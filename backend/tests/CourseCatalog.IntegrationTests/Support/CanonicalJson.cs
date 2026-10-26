using System.Text.Json.Nodes;

namespace CourseCatalog.IntegrationTests.Support;

/// <summary>JSON com as chaves em ordem alfabética: comparação sem depender da ordem dos campos e com diff legível.</summary>
public static class CanonicalJson
{
    public static string From(JsonNode? node) => Sort(node)?.ToJsonString() ?? "null";

    private static JsonNode? Sort(JsonNode? node) => node switch
    {
        JsonObject jsonObject => new JsonObject(jsonObject
            .OrderBy(property => property.Key, StringComparer.Ordinal)
            .Select(property => KeyValuePair.Create(property.Key, Sort(property.Value)))),
        JsonArray jsonArray => new JsonArray([.. jsonArray.Select(Sort)]),
        _ => node?.DeepClone(),
    };
}
