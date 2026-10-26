using System.Text.Json.Nodes;

namespace CourseCatalog.IntegrationTests.Support;

/// <summary>
/// Oráculo do contrato: o JSON que a API deve devolver, montado direto de data/courses.seed.json com o
/// mesmo "join" do mock do front (buildCatalog) e os campos de courseDtos.ts. Não usa o código da API.
/// </summary>
public static class ExpectedCatalog
{
    private static readonly JsonObject Seed =
        JsonNode.Parse(File.ReadAllText(CatalogTestDatabase.SeedFilePath))!.AsObject();

    public static IReadOnlyList<JsonNode> Courses => [.. Seed["courses"]!.AsArray().Select(course => course!)];

    public static JsonArray Categories => (JsonArray)Seed["categories"]!.DeepClone();

    public static JsonArray Modalities => CodeAndName(Seed["modalities"]!.AsArray());

    public static JsonArray Statuses => CodeAndName(Seed["statuses"]!.AsArray());

    public static int LessonCount =>
        Courses.Sum(course => course["modules"]!.AsArray().Sum(module => module!["lessons"]!.AsArray().Count));

    public static JsonObject Summary(JsonNode course)
    {
        ArgumentNullException.ThrowIfNull(course);

        var category = Seed["categories"]!.AsArray()
            .Single(item => item!["id"]!.GetValue<int>() == course["categoryId"]!.GetValue<int>())!;
        var modality = Seed["modalities"]!.AsArray()
            .Single(item => item!["code"]!.GetValue<string>() == course["modalityCode"]!.GetValue<string>())!;
        var status = Seed["statuses"]!.AsArray()
            .Single(item => item!["code"]!.GetValue<string>() == course["statusCode"]!.GetValue<string>())!;

        return new JsonObject
        {
            ["id"] = course["id"]!.DeepClone(),
            ["slug"] = course["slug"]!.DeepClone(),
            ["fullName"] = course["fullName"]!.DeepClone(),
            ["shortName"] = course["shortName"]!.DeepClone(),
            ["summary"] = course["summary"]!.DeepClone(),
            ["category"] = category.DeepClone(),
            ["modality"] = new JsonObject { ["code"] = modality["code"]!.DeepClone(), ["name"] = modality["name"]!.DeepClone() },
            ["status"] = new JsonObject { ["code"] = status["code"]!.DeepClone(), ["name"] = status["name"]!.DeepClone() },
            ["workloadHours"] = course["workloadHours"]!.DeepClone(),
            ["imageUrl"] = course["imageUrl"]!.DeepClone(),
            ["availableFrom"] = course["availableFrom"]?.DeepClone(),
            ["featured"] = course["featured"]!.DeepClone(),
        };
    }

    public static JsonObject Detail(JsonNode course)
    {
        ArgumentNullException.ThrowIfNull(course);

        var detail = Summary(course);
        detail["description"] = course["description"]!.DeepClone();
        detail["targetAudience"] = course["targetAudience"]!.DeepClone();
        detail["certification"] = course["certification"]!.DeepClone();
        detail["modules"] = course["modules"]!.DeepClone();
        return detail;
    }

    private static JsonArray CodeAndName(JsonArray items) =>
        [.. items.Select(item => (JsonNode)new JsonObject
        {
            ["code"] = item!["code"]!.DeepClone(),
            ["name"] = item["name"]!.DeepClone(),
        })];
}
