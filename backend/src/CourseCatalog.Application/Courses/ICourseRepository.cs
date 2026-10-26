namespace CourseCatalog.Application.Courses;

/// <summary>
/// Porta de leitura do catálogo, implementada na infraestrutura (EF Core + PostgreSQL). É a mesma
/// porta do front-end (<c>CourseRepository</c>): a origem dos dados pode mudar sem afetar os casos de uso.
/// </summary>
public interface ICourseRepository
{
    /// <summary>Cursos que atendem ao filtro (já normalizado), na ordem do catálogo.</summary>
    Task<IReadOnlyList<CourseSummaryDto>> ListAsync(CourseFilter filter, CancellationToken cancellationToken);

    /// <summary>Curso completo pelo slug, ou nulo se não existir.</summary>
    Task<CourseDetailDto?> FindBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<ModalityDto>> ListModalitiesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<StatusDto>> ListStatusesAsync(CancellationToken cancellationToken);
}
