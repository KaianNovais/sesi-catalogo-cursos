using System.Net;
using System.Text.Json.Nodes;
using CourseCatalog.IntegrationTests.Support;

namespace CourseCatalog.IntegrationTests;

/// <summary>
/// A API devolve exatamente o que o mock do front devolve a partir do mesmo seed: o front pode trocar
/// VITE_API_MODE=mock por http sem nenhuma diferença (README §7).
/// </summary>
public sealed class ContractTests(CatalogTestDatabase database)
{
    [Fact]
    public async Task ListCourses_MatchesTheSeedJoinedLikeTheFrontEndMock()
    {
        var response = await database.Api.GetAsync("/api/courses");

        var expected = new JsonObject
        {
            ["items"] = new JsonArray([.. ExpectedCatalog.Courses.Select(course => (JsonNode)ExpectedCatalog.Summary(course))]),
            ["total"] = ExpectedCatalog.Courses.Count,
        };
        Assert.Equal(HttpStatusCode.OK, response.Status);
        Assert.Equal(CanonicalJson.From(expected), CanonicalJson.From(response.Json));
    }

    [Fact]
    public async Task GetCourse_MatchesTheSeedForEveryCourse()
    {
        foreach (var course in ExpectedCatalog.Courses)
        {
            var response = await database.Api.GetAsync($"/api/courses/{course["slug"]!.GetValue<string>()}");

            Assert.Equal(HttpStatusCode.OK, response.Status);
            Assert.Equal(CanonicalJson.From(ExpectedCatalog.Detail(course)), CanonicalJson.From(response.Json));
        }
    }

    [Theory]
    [InlineData("/api/categories")]
    [InlineData("/api/modalities")]
    [InlineData("/api/statuses")]
    public async Task FilterOptions_MatchTheSeed(string path)
    {
        var expected = path switch
        {
            "/api/categories" => ExpectedCatalog.Categories,
            "/api/modalities" => ExpectedCatalog.Modalities,
            _ => ExpectedCatalog.Statuses,
        };

        var response = await database.Api.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.Status);
        Assert.Equal(CanonicalJson.From(expected), CanonicalJson.From(response.Json));
    }
}
