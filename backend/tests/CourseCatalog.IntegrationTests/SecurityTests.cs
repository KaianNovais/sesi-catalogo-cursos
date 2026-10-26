using System.Net;
using CourseCatalog.IntegrationTests.Support;
using Microsoft.Extensions.Options;

namespace CourseCatalog.IntegrationTests;

public sealed class SecurityTests(CatalogTestDatabase database)
{
    [Theory]
    [InlineData("/api/statuses")]
    [InlineData("/api/courses/nao-existe")]
    [InlineData("/api/courses?featured=abc")]
    [InlineData("/api/nada")]
    public async Task SecurityHeaders_ArePresentOnSuccessAndErrorResponses(string path)
    {
        var response = await database.Api.GetAsync(path);

        Assert.Equal("nosniff", response.Header("X-Content-Type-Options"));
        Assert.Equal("DENY", response.Header("X-Frame-Options"));
        Assert.Equal("default-src 'none'; frame-ancestors 'none'", response.Header("Content-Security-Policy"));
        Assert.Equal("no-referrer", response.Header("Referrer-Policy"));
        Assert.Equal("same-origin", response.Header("Cross-Origin-Resource-Policy"));
        Assert.Null(response.Header("Server"));
    }

    [Fact]
    public async Task OnlySuccessfulResponses_CanBeCached()
    {
        var success = await database.Api.GetAsync("/api/categories");
        var notFound = await database.Api.GetAsync("/api/courses/nao-existe");

        Assert.Equal("public, max-age=60", success.Header("Cache-Control"));
        Assert.Contains("Origin", success.Header("Vary"), StringComparison.Ordinal);
        Assert.Equal("no-store", notFound.Header("Cache-Control"));
    }

    [Fact]
    public async Task OpenApiDocument_IsOnlyPublishedInDevelopment()
    {
        var response = await database.Api.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.NotFound, response.Status);
    }

    [Fact]
    public async Task UnknownHosts_AreRejected()
    {
        var response = await database.Api.SendAsync(
            HttpMethod.Get,
            "/api/statuses",
            new Dictionary<string, string> { ["Host"] = "site-malicioso.example" });

        Assert.Equal(HttpStatusCode.BadRequest, response.Status);
    }

    [Theory]
    [InlineData("' OR 1=1 --")]
    [InlineData("%")]
    [InlineData("_")]
    [InlineData("'; DROP TABLE catalog.courses; --")]
    public async Task SearchText_IsNeverInterpretedAsSql(string search)
    {
        // Texto comum para a consulta: nem injeção nem curingas de LIKE devolvem cursos.
        var response = await database.Api.GetAsync($"/api/courses?search={Uri.EscapeDataString(search)}");
        var catalog = await database.Api.GetAsync("/api/courses");

        Assert.Equal("""{"items":[],"total":0}""", response.Body);
        Assert.Equal(ExpectedCatalog.Courses.Count, catalog.Json["total"]!.GetValue<int>());
    }

    [Theory]
    [InlineData("POST")]
    [InlineData("PUT")]
    [InlineData("PATCH")]
    [InlineData("DELETE")]
    public async Task WriteMethods_AreNotAllowed(string method)
    {
        var response = await database.Api.SendAsync(new HttpMethod(method), "/api/courses");
        var health = await database.Api.SendAsync(new HttpMethod(method), "/health");

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.Status);
        Assert.Equal("GET", response.Header("Allow"));
        Assert.Equal(HttpStatusCode.MethodNotAllowed, health.Status);
    }

    [Fact]
    public async Task Cors_AllowsOnlyConfiguredOrigins()
    {
        var allowed = await database.Api.GetAsync("/api/modalities", origin: "http://localhost:5173");
        var unknown = await database.Api.GetAsync("/api/modalities", origin: "https://site-malicioso.example");

        Assert.Equal("http://localhost:5173", allowed.Header("Access-Control-Allow-Origin"));
        Assert.Null(unknown.Header("Access-Control-Allow-Origin"));
        Assert.Null(allowed.Header("Access-Control-Allow-Credentials"));
    }

    [Fact]
    public async Task Cors_EachOriginGetsItsOwnHeaderEvenFromTheCache()
    {
        foreach (var origin in CatalogApiFactory.AllowedOrigins)
        {
            var response = await database.Api.GetAsync("/api/courses?featured=true", origin);

            Assert.Equal(origin, response.Header("Access-Control-Allow-Origin"));
        }
    }

    [Fact]
    public async Task Cors_PreflightAllowsOnlyGet()
    {
        var get = await Preflight("GET");
        var delete = await Preflight("DELETE");

        // O servidor sempre anuncia só GET; o navegador bloqueia qualquer método fora da lista.
        Assert.Equal("http://localhost:5173", get.Header("Access-Control-Allow-Origin"));
        Assert.Equal("GET", get.Header("Access-Control-Allow-Methods"));
        Assert.Equal("GET", delete.Header("Access-Control-Allow-Methods"));
        Assert.Null(delete.Header("Access-Control-Allow-Credentials"));

        Task<ApiResponse> Preflight(string method) => database.Api.SendAsync(
            HttpMethod.Options,
            "/api/courses",
            new Dictionary<string, string>
            {
                ["Origin"] = "http://localhost:5173",
                ["Access-Control-Request-Method"] = method,
            });
    }

    [Fact]
    public async Task RateLimit_Returns429WithRetryAfter_AndSparesTheHealthCheck()
    {
        await using var api = new CatalogApiFactory(
            database.ApiConnectionString,
            new Dictionary<string, string?> { ["RateLimiting:PermitLimitPerClient"] = "3" });

        for (var attempt = 0; attempt < 3; attempt++)
        {
            Assert.Equal(HttpStatusCode.OK, (await api.GetAsync("/api/statuses")).Status);
        }

        var limited = await api.GetAsync("/api/statuses");
        var limitedPlainText = await api.SendAsync(
            HttpMethod.Get,
            "/api/statuses",
            new Dictionary<string, string> { ["Accept"] = "text/plain" });
        var health = await api.GetAsync("/health");

        Assert.Equal(HttpStatusCode.TooManyRequests, limited.Status);
        Assert.NotNull(limited.Header("Retry-After"));
        Assert.Equal("Muitas requisições.", limited.Json["title"]!.GetValue<string>());
        // Cliente que não aceita JSON continua recebendo 429 (sem corpo), não 500.
        Assert.Equal(HttpStatusCode.TooManyRequests, limitedPlainText.Status);
        Assert.NotNull(limitedPlainText.Header("Retry-After"));
        Assert.Equal(HttpStatusCode.OK, health.Status);
    }

    [Fact]
    public async Task DatabaseFailures_DoNotLeakInternalDetails()
    {
        var unreachable = database.ApiConnectionString.Replace(database.DatabaseName, "banco_que_nao_existe", StringComparison.Ordinal);
        await using var api = new CatalogApiFactory(unreachable);

        var response = await api.GetAsync("/api/courses");

        Assert.Equal(HttpStatusCode.InternalServerError, response.Status);
        Assert.Equal("application/problem+json", response.Header("Content-Type"));
        Assert.Equal("Erro interno. Tente novamente mais tarde.", response.Json["title"]!.GetValue<string>());
        Assert.NotNull(response.Json["traceId"]);
        Assert.DoesNotContain("Npgsql", response.Body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("exception", response.Body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("banco_que_nao_existe", response.Body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Startup_FailsWithoutConnectionString()
    {
        await using var api = new CatalogApiFactory(connectionString: string.Empty);

        var exception = Record.Exception(() => api.CreateClient());

        Assert.IsType<OptionsValidationException>(Unwrap(exception));
    }

    [Fact]
    public async Task Startup_RejectsWildcardCorsOrigin()
    {
        await using var api = new CatalogApiFactory(
            database.ApiConnectionString,
            new Dictionary<string, string?> { ["Cors:AllowedOrigins:0"] = "*" });

        var exception = Record.Exception(() => api.CreateClient());

        Assert.IsType<OptionsValidationException>(Unwrap(exception));
    }

    private static Exception? Unwrap(Exception? exception)
    {
        while (exception is AggregateException { InnerException: { } inner })
        {
            exception = inner;
        }

        return exception;
    }
}
