namespace CourseCatalog.Application.Courses;

// Contrato da API (README §7), espelhado em frontend/src/infrastructure/course/courseDtos.ts.
// Campo novo exige atualizar os dois lados, o mapeador do front e o README juntos.

public sealed record CategoryDto(int Id, string Slug, string Name, string Color);

public sealed record ModalityDto(string Code, string Name);

public sealed record StatusDto(string Code, string Name);

public sealed record LessonDto(string Title, string Description);

public sealed record ModuleDto(string Title, IReadOnlyList<LessonDto> Lessons);

/// <summary>Resumo do curso, usado nos cards e na listagem.</summary>
public record CourseSummaryDto
{
    public required int Id { get; init; }

    public required string Slug { get; init; }

    public required string FullName { get; init; }

    public required string ShortName { get; init; }

    public required string Summary { get; init; }

    public required CategoryDto Category { get; init; }

    public required ModalityDto Modality { get; init; }

    public required StatusDto Status { get; init; }

    public required int WorkloadHours { get; init; }

    public required string ImageUrl { get; init; }

    /// <summary>Data no formato <c>AAAA-MM-DD</c> ou nula quando não se aplica.</summary>
    public required DateOnly? AvailableFrom { get; init; }

    public required bool Featured { get; init; }
}

/// <summary>Curso completo, com módulos e aulas (página de detalhes).</summary>
public sealed record CourseDetailDto : CourseSummaryDto
{
    public required string Description { get; init; }

    public required string TargetAudience { get; init; }

    public required string Certification { get; init; }

    public required IReadOnlyList<ModuleDto> Modules { get; init; }
}

/// <summary>Resultado da listagem; <c>Total</c> é a quantidade de cursos após os filtros.</summary>
public sealed record CourseListDto(IReadOnlyList<CourseSummaryDto> Items, int Total);
