using System.Text.RegularExpressions;
using CourseCatalog.Domain.Courses;

namespace CourseCatalog.Infrastructure.Seeding;

/// <summary>
/// Confere o seed antes de qualquer gravação: referências, duplicidades e formatos (data/AGENTS.md).
/// O banco tem as mesmas regras como restrições, mas aqui a mensagem aponta o curso com problema.
/// </summary>
public static partial class SeedDataValidator
{
    public static IReadOnlyList<string> Validate(SeedData data)
    {
        ArgumentNullException.ThrowIfNull(data);

        var errors = new List<string>();

        RequireUnique(data.Categories.Select(category => category.Id), "id de categoria", errors);
        RequireUnique(data.Categories.Select(category => category.Slug), "slug de categoria", errors);
        RequireUnique(data.Modalities.Select(modality => modality.Id), "id de modalidade", errors);
        RequireUnique(data.Modalities.Select(modality => modality.Code), "código de modalidade", errors);
        RequireUnique(data.Statuses.Select(status => status.Id), "id de status", errors);
        RequireUnique(data.Statuses.Select(status => status.Code), "código de status", errors);
        RequireUnique(data.Courses.Select(course => course.Id), "id de curso", errors);
        RequireUnique(data.Courses.Select(course => course.Slug), "slug de curso", errors);

        foreach (var category in data.Categories)
        {
            if (!Slug.IsValid(category.Slug))
            {
                errors.Add($"Categoria \"{category.Name}\": slug \"{category.Slug}\" fora do formato kebab-case.");
            }

            if (!HexColor().IsMatch(category.Color))
            {
                errors.Add($"Categoria \"{category.Name}\": cor \"{category.Color}\" fora do formato #RRGGBB.");
            }
        }

        foreach (var code in data.Modalities.Select(modality => modality.Code).Concat(data.Statuses.Select(status => status.Code)))
        {
            if (!Slug.IsValid(code))
            {
                errors.Add($"Código \"{code}\" fora do formato kebab-case.");
            }
        }

        var categoryIds = data.Categories.Select(category => category.Id).ToHashSet();
        var modalityCodes = data.Modalities.Select(modality => modality.Code).ToHashSet(StringComparer.Ordinal);
        var statusCodes = data.Statuses.Select(status => status.Code).ToHashSet(StringComparer.Ordinal);

        foreach (var course in data.Courses)
        {
            ValidateCourse(course, categoryIds, modalityCodes, statusCodes, errors);
        }

        return errors;
    }

    private static void ValidateCourse(
        SeedCourse course,
        HashSet<int> categoryIds,
        HashSet<string> modalityCodes,
        HashSet<string> statusCodes,
        List<string> errors)
    {
        var label = $"Curso \"{course.Slug}\"";

        if (!Slug.IsValid(course.Slug))
        {
            errors.Add($"{label}: slug fora do formato kebab-case.");
        }

        if (!categoryIds.Contains(course.CategoryId))
        {
            errors.Add($"{label}: categoryId {course.CategoryId} não existe em categories.");
        }

        if (!modalityCodes.Contains(course.ModalityCode))
        {
            errors.Add($"{label}: modalityCode \"{course.ModalityCode}\" não existe em modalities.");
        }

        if (!statusCodes.Contains(course.StatusCode))
        {
            errors.Add($"{label}: statusCode \"{course.StatusCode}\" não existe em statuses.");
        }

        if (course.ImageUrl != $"/images/courses/{course.Slug}.webp")
        {
            errors.Add($"{label}: imageUrl deve ser /images/courses/{course.Slug}.webp.");
        }

        if (course.WorkloadHours is < 1 or > 2000)
        {
            errors.Add($"{label}: carga horária {course.WorkloadHours} fora do intervalo de 1 a 2000 h.");
        }

        var texts = new[] { course.FullName, course.ShortName, course.Summary, course.Description, course.TargetAudience, course.Certification };
        if (texts.Any(string.IsNullOrWhiteSpace))
        {
            errors.Add($"{label}: nome, resumo, descrição, público-alvo e certificadora são obrigatórios.");
        }

        if (course.Modules.Count == 0)
        {
            errors.Add($"{label}: precisa de ao menos um módulo.");
        }

        foreach (var module in course.Modules.Where(module => module.Lessons.Count == 0))
        {
            errors.Add($"{label}, módulo \"{module.Title}\": precisa de ao menos uma aula.");
        }
    }

    private static void RequireUnique<T>(IEnumerable<T> values, string description, List<string> errors)
        where T : notnull
    {
        foreach (var duplicate in values.GroupBy(value => value).Where(group => group.Count() > 1))
        {
            errors.Add($"{description} repetido: \"{duplicate.Key}\".");
        }
    }

    [GeneratedRegex("^#[0-9A-Fa-f]{6}$", RegexOptions.CultureInvariant)]
    private static partial Regex HexColor();
}
