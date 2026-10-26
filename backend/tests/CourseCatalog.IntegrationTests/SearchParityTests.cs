using System.Text.Json.Nodes;
using CourseCatalog.IntegrationTests.Support;

namespace CourseCatalog.IntegrationTests;

/// <summary>
/// A busca da API responde igual à do mock do front: os mesmos casos (data/search-cases.json) rodam em
/// frontend/src/application/courses.test.ts. Inclui acentos soltos, espaços incomuns e caracteres especiais.
/// </summary>
public sealed class SearchParityTests(CatalogTestDatabase database)
{
    [Fact]
    public async Task SearchCases_MatchTheFrontEndMock()
    {
        var cases = JsonNode.Parse(await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "search-cases.json"),
            TestContext.Current.CancellationToken))!["cases"]!.AsArray();
        var mismatches = new List<string>();

        foreach (var searchCase in cases)
        {
            var search = searchCase!["search"]!.GetValue<string>();
            var expected = searchCase["slugs"]!.AsArray().Select(slug => slug!.GetValue<string>()).ToList();

            var response = await database.Api.GetAsync($"/api/courses?search={Uri.EscapeDataString(search)}");

            if (!response.Slugs.SequenceEqual(expected))
            {
                mismatches.Add($"{System.Text.Json.JsonSerializer.Serialize(search)}: esperado [{string.Join(", ", expected)}], veio [{string.Join(", ", response.Slugs)}]");
            }
        }

        Assert.NotEmpty(cases);
        Assert.Empty(mismatches);
    }
}
