using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace CourseCatalog.Domain.Courses;

/// <summary>
/// Regras de texto da busca, as mesmas do front-end (<c>normalizeText</c> e <c>normalizeSearchTerm</c>):
/// a busca ignora acentos, maiúsculas e espaços repetidos. Os casos de data/search-cases.json, testados
/// nos dois lados, garantem que front e API tratem cada caractere do mesmo jeito.
/// </summary>
public static partial class CatalogText
{
    // Espaço como o JavaScript entende (\s e trim()). O \s do .NET aceita outros caracteres (ex.: U+0085).
    private const string Whitespace = @"[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]";

    /// <summary>
    /// Chave de comparação da busca, sem acentos e em minúsculas ("Matemática" → "matematica"): remove as
    /// marcas combinantes da forma decomposta (NFD). O nome do curso e o termo buscado passam por ela.
    /// </summary>
    [SuppressMessage(
        "Globalization",
        "CA1308:Normalize strings to uppercase",
        Justification = "Mesma regra do front (toLocaleLowerCase); a chave serve só para comparação e nunca é exibida.")]
    public static string ToSearchKey(string value)
    {
        ArgumentNullException.ThrowIfNull(value);

        var builder = new StringBuilder(value.Length);
        foreach (var rune in value.Normalize(NormalizationForm.FormD).EnumerateRunes())
        {
            if (Rune.GetUnicodeCategory(rune) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(rune.ToString());
            }
        }

        return Trim(builder.ToString().ToLowerInvariant());
    }

    /// <summary>Remove espaços nas pontas e troca sequências de espaços por um só.</summary>
    public static string CollapseWhitespace(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        return WhitespaceRun().Replace(Trim(value), " ");
    }

    private static string Trim(string value) => OuterWhitespace().Replace(value, string.Empty);

    [GeneratedRegex(Whitespace + "+", RegexOptions.CultureInvariant)]
    private static partial Regex WhitespaceRun();

    [GeneratedRegex("^" + Whitespace + "+|" + Whitespace + "+$", RegexOptions.CultureInvariant)]
    private static partial Regex OuterWhitespace();
}
