namespace CourseCatalog.Domain.Courses;

/// <summary>Forma de oferta do curso (EAD, presencial ou híbrido).</summary>
public sealed class Modality
{
    public int Id { get; init; }

    public required string Code { get; init; }

    public required string Name { get; init; }
}
