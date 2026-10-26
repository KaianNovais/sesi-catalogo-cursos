namespace CourseCatalog.Domain.Courses;

/// <summary>Situação das inscrições do curso (inscrições abertas, em breve ou encerrado).</summary>
public sealed class CourseStatus
{
    public int Id { get; init; }

    public required string Code { get; init; }

    public required string Name { get; init; }
}
