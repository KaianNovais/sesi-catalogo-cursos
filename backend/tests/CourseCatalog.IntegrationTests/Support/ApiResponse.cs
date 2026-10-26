using System.Net;
using System.Text.Json.Nodes;

namespace CourseCatalog.IntegrationTests.Support;

/// <summary>Resposta já lida: status, cabeçalhos (nome sem diferenciar maiúsculas) e corpo.</summary>
public sealed record ApiResponse(HttpStatusCode Status, IReadOnlyDictionary<string, string> Headers, string Body)
{
    public JsonNode Json => JsonNode.Parse(Body) ?? throw new InvalidOperationException("Resposta sem corpo JSON.");

    public string? Header(string name) => Headers.TryGetValue(name, out var value) ? value : null;

    /// <summary>Slugs dos cursos de uma resposta de GET /api/courses, na ordem recebida.</summary>
    public IReadOnlyList<string> Slugs =>
        Json["items"]!.AsArray().Select(item => item!["slug"]!.GetValue<string>()).ToList();
}
