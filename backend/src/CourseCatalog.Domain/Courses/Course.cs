namespace CourseCatalog.Domain.Courses;

/// <summary>Curso do catálogo. Os nomes seguem o Moodle (fullname, shortname, summary).</summary>
public sealed class Course
{
    public int Id { get; init; }

    public required string Slug { get; init; }

    public required string FullName { get; init; }

    public required string ShortName { get; init; }

    /// <summary>Descrição curta, exibida nos cards.</summary>
    public required string Summary { get; init; }

    /// <summary>Descrição completa ("Sobre o curso").</summary>
    public required string Description { get; init; }

    public int CategoryId { get; init; }

    public Category Category { get; private set; } = null!;

    public int ModalityId { get; init; }

    public Modality Modality { get; private set; } = null!;

    public int StatusId { get; init; }

    public CourseStatus Status { get; private set; } = null!;

    public int WorkloadHours { get; init; }

    public required string TargetAudience { get; init; }

    /// <summary>Caminho da imagem no front-end: <c>/images/courses/&lt;slug&gt;.webp</c>.</summary>
    public required string ImageUrl { get; init; }

    /// <summary>Data de disponibilização, quando aplicável (nula = início imediato).</summary>
    public DateOnly? AvailableFrom { get; init; }

    /// <summary>Instituição certificadora.</summary>
    public required string Certification { get; init; }

    /// <summary>Destaque em "Principais cursos" na página inicial.</summary>
    public bool Featured { get; init; }

    public ICollection<CourseModule> Modules { get; init; } = [];
}
