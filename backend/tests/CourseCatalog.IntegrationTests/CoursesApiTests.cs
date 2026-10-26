using System.Net;
using CourseCatalog.IntegrationTests.Support;

namespace CourseCatalog.IntegrationTests;

/// <summary>Comportamento exigido pelo edital: busca, filtros combinados, contagem, detalhes e estados.</summary>
public sealed class CoursesApiTests(CatalogTestDatabase database)
{
    [Fact]
    public async Task ListCourses_WithoutFilters_ReturnsTheWholeCatalogInIdOrder()
    {
        var response = await database.Api.GetAsync("/api/courses");

        var ids = response.Json["items"]!.AsArray().Select(item => item!["id"]!.GetValue<int>()).ToList();
        Assert.Equal(ExpectedCatalog.Courses.Count, response.Json["total"]!.GetValue<int>());
        Assert.Equal(ExpectedCatalog.Courses.Count, ids.Count);
        Assert.Equal(ids.Order(), ids);
    }

    [Theory]
    [InlineData("CIENCIA DOS MATERIAIS")]
    [InlineData("ciência dos materiais")]
    [InlineData("  Ciência   dos   Materiais  ")]
    public async Task ListCourses_SearchIgnoresAccentsCaseAndExtraSpaces(string search)
    {
        var response = await database.Api.GetAsync($"/api/courses?search={Uri.EscapeDataString(search)}");

        Assert.Equal(["ciencia-dos-materiais-na-metalurgia"], response.Slugs);
    }

    [Fact]
    public async Task ListCourses_SearchAlsoLooksAtTheShortName()
    {
        // "Estatística e Qualidade" só existe no nome breve; o nome completo é "Estatística e Controle de Qualidade...".
        var response = await database.Api.GetAsync("/api/courses?search=estatistica%20e%20qualidade");

        Assert.Equal(["estatistica-e-controle-de-qualidade"], response.Slugs);
    }

    [Fact]
    public async Task ListCourses_CombinesSearchAndFilters()
    {
        var response = await database.Api.GetAsync("/api/courses?search=metalurgia&category=ciencias-da-natureza");

        Assert.Equal(2, response.Json["total"]!.GetValue<int>());
        Assert.All(
            response.Json["items"]!.AsArray(),
            item => Assert.Equal("ciencias-da-natureza", item!["category"]!["slug"]!.GetValue<string>()));
    }

    [Fact]
    public async Task ListCourses_FiltersByModalityAndStatus()
    {
        var response = await database.Api.GetAsync("/api/courses?modality=presencial&status=encerrado");

        Assert.Equal(["economia-circular-na-industria"], response.Slugs);
    }

    [Fact]
    public async Task ListCourses_FeaturedTrue_ReturnsOnlyFeaturedCourses()
    {
        var expected = ExpectedCatalog.Courses.Count(course => course["featured"]!.GetValue<bool>());

        var featured = await database.Api.GetAsync("/api/courses?featured=true");
        var notFiltered = await database.Api.GetAsync("/api/courses?featured=false");

        Assert.Equal(expected, featured.Json["total"]!.GetValue<int>());
        Assert.All(featured.Json["items"]!.AsArray(), item => Assert.True(item!["featured"]!.GetValue<bool>()));
        // Como no front: featured=false não filtra (não existe "só os que não são destaque").
        Assert.Equal(ExpectedCatalog.Courses.Count, notFiltered.Json["total"]!.GetValue<int>());
    }

    [Theory]
    [InlineData("search=curso%20inexistente")]
    [InlineData("category=nao-existe")]
    [InlineData("modality=distancia")]
    [InlineData("status=aberto")]
    [InlineData("category=Matematica")]
    public async Task ListCourses_UnknownValues_ReturnAnEmptyList(string query)
    {
        var response = await database.Api.GetAsync($"/api/courses?{query}");

        Assert.Equal(HttpStatusCode.OK, response.Status);
        Assert.Equal("""{"items":[],"total":0}""", response.Body);
    }

    [Theory]
    [InlineData("search=%00")]
    [InlineData("search=metal%00urgia")]
    [InlineData("category=%00")]
    [InlineData("modality=%00")]
    [InlineData("status=%00")]
    public async Task ListCourses_NullCharacter_ReturnsAnEmptyList(string query)
    {
        // O PostgreSQL não aceita o caractere nulo em texto; a API responde como o mock, sem erro 500.
        var response = await database.Api.GetAsync($"/api/courses?{query}");

        Assert.Equal(HttpStatusCode.OK, response.Status);
        Assert.Equal("""{"items":[],"total":0}""", response.Body);
    }

    [Fact]
    public async Task GetCourse_SlugIsCaseSensitiveEvenAfterCaching()
    {
        // O cache de saída não pode responder "QUIMICA-..." com a resposta guardada de "quimica-...".
        var lower = await database.Api.GetAsync("/api/courses/quimica-e-sustentabilidade");
        var upper = await database.Api.GetAsync("/api/courses/QUIMICA-E-SUSTENTABILIDADE");

        Assert.Equal(HttpStatusCode.OK, lower.Status);
        Assert.Equal(HttpStatusCode.NotFound, upper.Status);
    }

    [Fact]
    public async Task ListCourses_CacheKeepsDifferentValuesApart()
    {
        // O cache de saída não pode tratar "Matematica" e "matematica" como a mesma consulta.
        var upper = await database.Api.GetAsync("/api/courses?category=Matematica");
        var lower = await database.Api.GetAsync("/api/courses?category=matematica");

        Assert.Equal(0, upper.Json["total"]!.GetValue<int>());
        Assert.True(lower.Json["total"]!.GetValue<int>() > 0);
    }

    [Fact]
    public async Task GetCourse_ReturnsModulesAndLessonsInOrder()
    {
        var seed = ExpectedCatalog.Courses.Single(course => course["slug"]!.GetValue<string>() == "matematica-para-a-precisao");

        var response = await database.Api.GetAsync("/api/courses/matematica-para-a-precisao");

        var modules = response.Json["modules"]!.AsArray();
        Assert.Equal(seed["modules"]!.AsArray().Count, modules.Count);
        Assert.Equal(
            seed["modules"]!.AsArray().Select(module => module!["title"]!.GetValue<string>()),
            modules.Select(module => module!["title"]!.GetValue<string>()));
        Assert.Equal("Matemática", response.Json["category"]!["name"]!.GetValue<string>());
    }

    [Theory]
    [InlineData("nao-existe")]
    [InlineData("Not_A_Slug")]
    [InlineData("%3Cscript%3E")]
    public async Task GetCourse_UnknownOrMalformedSlug_Returns404Problem(string slug)
    {
        var response = await database.Api.GetAsync($"/api/courses/{slug}");

        Assert.Equal(HttpStatusCode.NotFound, response.Status);
        Assert.Equal("application/problem+json", response.Header("Content-Type"));
        Assert.Equal("Curso não encontrado.", response.Json["title"]!.GetValue<string>());
    }

    [Fact]
    public async Task ListCourses_SearchLongerThan100Characters_Returns400Problem()
    {
        var accepted = await database.Api.GetAsync($"/api/courses?search={new string('a', 100)}");
        var rejected = await database.Api.GetAsync($"/api/courses?search={new string('a', 101)}");

        Assert.Equal(HttpStatusCode.OK, accepted.Status);
        Assert.Equal(HttpStatusCode.BadRequest, rejected.Status);
        Assert.Equal("application/problem+json", rejected.Header("Content-Type"));
        Assert.Equal(
            "A busca aceita no máximo 100 caracteres.",
            rejected.Json["errors"]!["search"]![0]!.GetValue<string>());
    }

    [Theory]
    [InlineData("featured=abc")]
    [InlineData("category=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
    public async Task ListCourses_InvalidParameters_Return400Problem(string query)
    {
        var response = await database.Api.GetAsync($"/api/courses?{query}");

        Assert.Equal(HttpStatusCode.BadRequest, response.Status);
        Assert.Equal("application/problem+json", response.Header("Content-Type"));
    }
}
