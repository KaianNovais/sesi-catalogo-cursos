using System.Text.Json;
using System.Text.Json.Serialization;

namespace CourseCatalog.Infrastructure.Seeding;

/// <summary>Lê e valida <c>data/courses.seed.json</c>.</summary>
public static class SeedDataReader
{
    // Leitura estrita: campo desconhecido, ausente ou nulo onde não pode é erro (um campo novo no JSON
    // exige atualizar o modelo do back-end junto, como pede data/AGENTS.md).
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
    };

    public static async Task<SeedData> ReadAsync(string path, CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(path);
        var data = await JsonSerializer.DeserializeAsync<SeedData>(stream, Options, cancellationToken)
            ?? throw new InvalidSeedDataException($"O arquivo de seed está vazio: {path}");

        var errors = SeedDataValidator.Validate(data);
        return errors.Count == 0 ? data : throw new InvalidSeedDataException(errors);
    }
}
