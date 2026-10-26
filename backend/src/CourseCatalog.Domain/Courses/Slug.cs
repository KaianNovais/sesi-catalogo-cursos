using System.Text.RegularExpressions;

namespace CourseCatalog.Domain.Courses;

/// <summary>Identificador legível em kebab-case, usado nas URLs (ex.: <c>matematica-para-a-precisao</c>).</summary>
public static partial class Slug
{
    public const int MaxLength = 100;

    public static bool IsValid(string? value) =>
        value is { Length: > 0 and <= MaxLength } && KebabCase().IsMatch(value);

    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant)]
    private static partial Regex KebabCase();
}
