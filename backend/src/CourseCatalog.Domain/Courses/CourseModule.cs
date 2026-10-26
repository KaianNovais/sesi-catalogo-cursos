namespace CourseCatalog.Domain.Courses;

/// <summary>Módulo de um curso. Só existe dentro do curso (faz parte do agregado <see cref="Course"/>).</summary>
public sealed class CourseModule
{
    /// <summary>Ordem do módulo no curso, a partir de 1.</summary>
    public int Position { get; init; }

    public required string Title { get; init; }

    public ICollection<Lesson> Lessons { get; init; } = [];
}
