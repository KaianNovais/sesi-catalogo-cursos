namespace CourseCatalog.Infrastructure.Seeding;

// Formato de data/courses.seed.json, a fonte única dos dados fictícios (também usada como mock pelo front).

public sealed record SeedData(
    IReadOnlyList<SeedCategory> Categories,
    IReadOnlyList<SeedModality> Modalities,
    IReadOnlyList<SeedStatus> Statuses,
    IReadOnlyList<SeedCourse> Courses);

public sealed record SeedCategory(int Id, string Slug, string Name, string Color);

public sealed record SeedModality(int Id, string Code, string Name);

public sealed record SeedStatus(int Id, string Code, string Name);

public sealed record SeedCourse(
    int Id,
    string Slug,
    string FullName,
    string ShortName,
    string Summary,
    string Description,
    int CategoryId,
    string ModalityCode,
    string StatusCode,
    int WorkloadHours,
    string TargetAudience,
    string ImageUrl,
    DateOnly? AvailableFrom,
    string Certification,
    bool Featured,
    IReadOnlyList<SeedModule> Modules);

public sealed record SeedModule(string Title, IReadOnlyList<SeedLesson> Lessons);

public sealed record SeedLesson(string Title, string Description);

/// <summary>Quantidades carregadas pelo seed.</summary>
public sealed record SeedSummary(int Courses, int Categories, int Modalities, int Statuses);
