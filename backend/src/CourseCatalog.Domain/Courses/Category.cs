namespace CourseCatalog.Domain.Courses;

/// <summary>Área do conhecimento do curso (ex.: Matemática). A cor identifica a categoria nos cards.</summary>
public sealed class Category
{
    public int Id { get; init; }

    public required string Slug { get; init; }

    public required string Name { get; init; }

    /// <summary>Cor no formato <c>#RRGGBB</c>.</summary>
    public required string Color { get; init; }
}
