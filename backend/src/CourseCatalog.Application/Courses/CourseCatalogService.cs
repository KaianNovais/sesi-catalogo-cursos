using CourseCatalog.Domain.Courses;

namespace CourseCatalog.Application.Courses;

/// <summary>
/// Casos de uso do catálogo, os mesmos do front-end (<c>listCourses</c>, <c>getCourseDetails</c> e as
/// opções dos filtros). Recebem o repositório (porta) por injeção de dependência.
/// </summary>
public sealed class CourseCatalogService(ICourseRepository repository)
{
    public async Task<CourseListDto> ListCoursesAsync(CourseFilter filter, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(filter);

        var items = await repository.ListAsync(filter.Normalize(), cancellationToken);
        return new CourseListDto(items, items.Count);
    }

    /// <summary>Detalhes do curso, ou nulo quando o slug não existe (ou nem tem o formato de um slug).</summary>
    public Task<CourseDetailDto?> GetCourseDetailsAsync(string slug, CancellationToken cancellationToken) =>
        Slug.IsValid(slug)
            ? repository.FindBySlugAsync(slug, cancellationToken)
            : Task.FromResult<CourseDetailDto?>(null);

    public Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken cancellationToken) =>
        repository.ListCategoriesAsync(cancellationToken);

    public Task<IReadOnlyList<ModalityDto>> ListModalitiesAsync(CancellationToken cancellationToken) =>
        repository.ListModalitiesAsync(cancellationToken);

    public Task<IReadOnlyList<StatusDto>> ListStatusesAsync(CancellationToken cancellationToken) =>
        repository.ListStatusesAsync(cancellationToken);
}
