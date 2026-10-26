using CourseCatalog.Infrastructure.Seeding;

namespace CourseCatalog.UnitTests.Infrastructure;

public sealed class SeedDataTests
{
    private static readonly string SeedFilePath = Path.Combine(AppContext.BaseDirectory, "courses.seed.json");

    [Fact]
    public async Task TheSharedSeedFileIsValid()
    {
        var data = await SeedDataReader.ReadAsync(SeedFilePath, TestContext.Current.CancellationToken);

        // Mínimos do edital: 6 cursos, 3 categorias, 2 modalidades e 3 status.
        Assert.True(data.Courses.Count >= 6);
        Assert.True(data.Categories.Count >= 3);
        Assert.True(data.Modalities.Count >= 2);
        Assert.True(data.Statuses.Count >= 3);
    }

    [Fact]
    public async Task Validate_ReportsBrokenReferencesAndFormats()
    {
        var data = await SeedDataReader.ReadAsync(SeedFilePath, TestContext.Current.CancellationToken);
        var first = data.Courses[0];
        var broken = data with
        {
            Courses =
            [
                first with
                {
                    CategoryId = 999,
                    ModalityCode = "a-distancia",
                    StatusCode = "aberto",
                    ImageUrl = "https://exemplo.com/foto.webp",
                    WorkloadHours = 0,
                    Modules = [],
                },
            ],
        };

        var errors = SeedDataValidator.Validate(broken);

        Assert.Contains(errors, error => error.Contains("categoryId 999", StringComparison.Ordinal));
        Assert.Contains(errors, error => error.Contains("modalityCode \"a-distancia\"", StringComparison.Ordinal));
        Assert.Contains(errors, error => error.Contains("statusCode \"aberto\"", StringComparison.Ordinal));
        Assert.Contains(errors, error => error.Contains("imageUrl", StringComparison.Ordinal));
        Assert.Contains(errors, error => error.Contains("carga horária", StringComparison.Ordinal));
        Assert.Contains(errors, error => error.Contains("ao menos um módulo", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Validate_ReportsDuplicatedSlugs()
    {
        var data = await SeedDataReader.ReadAsync(SeedFilePath, TestContext.Current.CancellationToken);
        var duplicated = data with { Courses = [data.Courses[0], data.Courses[0] with { Id = 999 }] };

        var errors = SeedDataValidator.Validate(duplicated);

        Assert.Contains(errors, error => error.Contains("slug de curso repetido", StringComparison.Ordinal));
    }

    [Fact]
    public async Task ReadAsync_RejectsUnknownFields()
    {
        var path = Path.Combine(Path.GetTempPath(), $"seed-{Guid.NewGuid():N}.json");
        var json = await File.ReadAllTextAsync(SeedFilePath, TestContext.Current.CancellationToken);
        await File.WriteAllTextAsync(path, json.Replace("\"featured\":", "\"price\": 10, \"featured\":", StringComparison.Ordinal), TestContext.Current.CancellationToken);

        try
        {
            await Assert.ThrowsAnyAsync<System.Text.Json.JsonException>(() =>
                SeedDataReader.ReadAsync(path, TestContext.Current.CancellationToken));
        }
        finally
        {
            File.Delete(path);
        }
    }
}
