namespace CourseCatalog.Domain.Courses;

/// <summary>Aula de um módulo.</summary>
public sealed class Lesson
{
    /// <summary>Ordem da aula no módulo, a partir de 1.</summary>
    public int Position { get; init; }

    public required string Title { get; init; }

    public required string Description { get; init; }
}
