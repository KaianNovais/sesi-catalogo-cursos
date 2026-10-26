using CourseCatalog.Domain.Courses;

namespace CourseCatalog.Application.Courses;

/// <summary>Critérios de consulta do catálogo. Todos são opcionais e combináveis (README §7).</summary>
public sealed record CourseFilter
{
    /// <summary>Tamanho máximo do termo de busca (igual ao <c>SEARCH_MAX_LENGTH</c> do front-end).</summary>
    public const int SearchMaxLength = 100;

    /// <summary>Tamanho máximo dos códigos de categoria, modalidade e status.</summary>
    public const int CodeMaxLength = 50;

    /// <summary>Texto buscado no nome completo ou no nome breve.</summary>
    public string? Search { get; init; }

    /// <summary>Slug da categoria.</summary>
    public string? Category { get; init; }

    /// <summary>Código da modalidade.</summary>
    public string? Modality { get; init; }

    /// <summary>Código do status.</summary>
    public string? Status { get; init; }

    /// <summary>Quando verdadeiro, só os cursos em destaque.</summary>
    public bool Featured { get; init; }

    /// <summary>
    /// Remove espaços extras da busca e descarta valores vazios, como o <c>normalizeFilters</c> do front.
    /// Códigos são comparados exatamente como chegam: valor desconhecido resulta em lista vazia.
    /// </summary>
    public CourseFilter Normalize() => new()
    {
        Search = EmptyToNull(Search is null ? null : CatalogText.CollapseWhitespace(Search)),
        Category = EmptyToNull(Category),
        Modality = EmptyToNull(Modality),
        Status = EmptyToNull(Status),
        Featured = Featured,
    };

    private static string? EmptyToNull(string? value) => string.IsNullOrEmpty(value) ? null : value;
}
