using System.Linq.Expressions;
using CourseCatalog.Application.Courses;
using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;

namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>
/// Implementação da porta de leitura com EF Core. As consultas projetam direto para os DTOs (só as
/// colunas necessárias) e são parametrizadas pelo EF: nenhum valor da requisição vira SQL.
/// </summary>
internal sealed class EfCourseRepository(CatalogDbContext db) : ICourseRepository
{
    public async Task<IReadOnlyList<CourseSummaryDto>> ListAsync(CourseFilter filter, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(filter);

        // O PostgreSQL não guarda o caractere nulo em texto: um filtro com ele nunca corresponde a nada
        // (e faria o driver falhar). Mesmo resultado do mock do front: lista vazia.
        if (ContainsNullCharacter(filter.Search, filter.Category, filter.Modality, filter.Status))
        {
            return [];
        }

        var query = db.Courses.AsQueryable();

        if (filter.Search is not null)
        {
            var key = CatalogText.ToSearchKey(filter.Search);
            query = query.Where(course =>
                EF.Property<string>(course, CourseSearchColumns.FullName).Contains(key) ||
                EF.Property<string>(course, CourseSearchColumns.ShortName).Contains(key));
        }

        if (filter.Category is { } category)
        {
            query = query.Where(course => course.Category.Slug == category);
        }

        if (filter.Modality is { } modality)
        {
            query = query.Where(course => course.Modality.Code == modality);
        }

        if (filter.Status is { } status)
        {
            query = query.Where(course => course.Status.Code == status);
        }

        if (filter.Featured)
        {
            query = query.Where(course => course.Featured);
        }

        return await query.OrderBy(course => course.Id).Select(ToSummary).ToListAsync(cancellationToken);
    }

    public Task<CourseDetailDto?> FindBySlugAsync(string slug, CancellationToken cancellationToken) =>
        db.Courses
            .Where(course => course.Slug == slug)
            .Select(course => new CourseDetailDto
            {
                Id = course.Id,
                Slug = course.Slug,
                FullName = course.FullName,
                ShortName = course.ShortName,
                Summary = course.Summary,
                Category = new CategoryDto(course.Category.Id, course.Category.Slug, course.Category.Name, course.Category.Color),
                Modality = new ModalityDto(course.Modality.Code, course.Modality.Name),
                Status = new StatusDto(course.Status.Code, course.Status.Name),
                WorkloadHours = course.WorkloadHours,
                ImageUrl = course.ImageUrl,
                AvailableFrom = course.AvailableFrom,
                Featured = course.Featured,
                Description = course.Description,
                TargetAudience = course.TargetAudience,
                Certification = course.Certification,
                Modules = course.Modules
                    .OrderBy(module => module.Position)
                    .Select(module => new ModuleDto(
                        module.Title,
                        module.Lessons
                            .OrderBy(lesson => lesson.Position)
                            .Select(lesson => new LessonDto(lesson.Title, lesson.Description))
                            .ToList()))
                    .ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken cancellationToken) =>
        await db.Categories
            .OrderBy(category => category.Id)
            .Select(category => new CategoryDto(category.Id, category.Slug, category.Name, category.Color))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ModalityDto>> ListModalitiesAsync(CancellationToken cancellationToken) =>
        await db.Modalities
            .OrderBy(modality => modality.Id)
            .Select(modality => new ModalityDto(modality.Code, modality.Name))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<StatusDto>> ListStatusesAsync(CancellationToken cancellationToken) =>
        await db.Statuses
            .OrderBy(status => status.Id)
            .Select(status => new StatusDto(status.Code, status.Name))
            .ToListAsync(cancellationToken);

    private static bool ContainsNullCharacter(params string?[] values) =>
        values.Any(value => value?.Contains('\0', StringComparison.Ordinal) == true);

    private static readonly Expression<Func<Course, CourseSummaryDto>> ToSummary = course => new CourseSummaryDto
    {
        Id = course.Id,
        Slug = course.Slug,
        FullName = course.FullName,
        ShortName = course.ShortName,
        Summary = course.Summary,
        Category = new CategoryDto(course.Category.Id, course.Category.Slug, course.Category.Name, course.Category.Color),
        Modality = new ModalityDto(course.Modality.Code, course.Modality.Name),
        Status = new StatusDto(course.Status.Code, course.Status.Name),
        WorkloadHours = course.WorkloadHours,
        ImageUrl = course.ImageUrl,
        AvailableFrom = course.AvailableFrom,
        Featured = course.Featured,
    };
}
