using System.Globalization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CourseCatalog.IntegrationTests.Support;

/// <summary>API em memória (TestServer) apontando para o banco de testes, com configuração ajustável.</summary>
public sealed class CatalogApiFactory(
    string connectionString,
    IReadOnlyDictionary<string, string?>? settings = null) : WebApplicationFactory<Program>
{
    public static IReadOnlyList<string> AllowedOrigins { get; } = ["http://localhost:5173", "http://localhost:4173"];

    /// <summary>Faz uma requisição e devolve status, cabeçalhos e corpo já lidos.</summary>
    public async Task<ApiResponse> SendAsync(HttpMethod method, string path, IReadOnlyDictionary<string, string>? headers = null)
    {
        using var client = CreateClient();
        using var request = new HttpRequestMessage(method, path);
        foreach (var (name, value) in headers ?? new Dictionary<string, string>())
        {
            request.Headers.TryAddWithoutValidation(name, value);
        }

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var allHeaders = response.Headers
            .Concat(response.Content.Headers)
            .ToDictionary(header => header.Key, header => string.Join(", ", header.Value), StringComparer.OrdinalIgnoreCase);

        return new ApiResponse(response.StatusCode, allHeaders, body);
    }

    public Task<ApiResponse> GetAsync(string path, string? origin = null) =>
        SendAsync(HttpMethod.Get, path, origin is null ? null : new Dictionary<string, string> { ["Origin"] = origin });

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Catalog", connectionString);
        for (var index = 0; index < AllowedOrigins.Count; index++)
        {
            builder.UseSetting(string.Create(CultureInfo.InvariantCulture, $"Cors:AllowedOrigins:{index}"), AllowedOrigins[index]);
        }

        foreach (var (key, value) in settings ?? new Dictionary<string, string?>())
        {
            builder.UseSetting(key, value);
        }
    }
}
