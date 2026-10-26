using CourseCatalog.Domain.Courses;
using CourseCatalog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CourseCatalog.Infrastructure.Seeding;

/// <summary>Grava o seed no banco. Precisa do usuário dono do banco (a API não tem permissão de escrita).</summary>
public sealed class CatalogSeeder(CatalogDbContext db)
{
    /// <summary>
    /// Deixa o catálogo igual ao seed, numa única transação: quem lê o banco nesse meio-tempo continua
    /// vendo os dados anteriores até o fim. Pode rodar várias vezes sem duplicar nada.
    /// </summary>
    public async Task<SeedSummary> SeedAsync(SeedData data, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(data);

        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

            // Cursos saem antes das tabelas que eles referenciam; módulos e aulas saem em cascata.
            await db.Courses.ExecuteDeleteAsync(cancellationToken);
            await db.Categories.ExecuteDeleteAsync(cancellationToken);
            await db.Modalities.ExecuteDeleteAsync(cancellationToken);
            await db.Statuses.ExecuteDeleteAsync(cancellationToken);

            AddCatalog(data);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
        db.ChangeTracker.Clear();

        return new SeedSummary(data.Courses.Count, data.Categories.Count, data.Modalities.Count, data.Statuses.Count);
    }

    private void AddCatalog(SeedData data)
    {
        db.Categories.AddRange(data.Categories.Select(category => new Category
        {
            Id = category.Id,
            Slug = category.Slug,
            Name = category.Name,
            Color = category.Color,
        }));
        db.Modalities.AddRange(data.Modalities.Select(modality => new Modality
        {
            Id = modality.Id,
            Code = modality.Code,
            Name = modality.Name,
        }));
        db.Statuses.AddRange(data.Statuses.Select(status => new CourseStatus
        {
            Id = status.Id,
            Code = status.Code,
            Name = status.Name,
        }));

        // No JSON, modalidade e status são referenciados pelo código; no banco, pela chave.
        var modalityIds = data.Modalities.ToDictionary(modality => modality.Code, modality => modality.Id, StringComparer.Ordinal);
        var statusIds = data.Statuses.ToDictionary(status => status.Code, status => status.Id, StringComparer.Ordinal);

        foreach (var seed in data.Courses)
        {
            var course = new Course
            {
                Id = seed.Id,
                Slug = seed.Slug,
                FullName = seed.FullName,
                ShortName = seed.ShortName,
                Summary = seed.Summary,
                Description = seed.Description,
                CategoryId = seed.CategoryId,
                ModalityId = modalityIds[seed.ModalityCode],
                StatusId = statusIds[seed.StatusCode],
                WorkloadHours = seed.WorkloadHours,
                TargetAudience = seed.TargetAudience,
                ImageUrl = seed.ImageUrl,
                AvailableFrom = seed.AvailableFrom,
                Certification = seed.Certification,
                Featured = seed.Featured,
                Modules = seed.Modules.Select((module, moduleIndex) => new CourseModule
                {
                    Position = moduleIndex + 1,
                    Title = module.Title,
                    Lessons = module.Lessons.Select((lesson, lessonIndex) => new Lesson
                    {
                        Position = lessonIndex + 1,
                        Title = lesson.Title,
                        Description = lesson.Description,
                    }).ToList(),
                }).ToList(),
            };

            var entry = db.Courses.Add(course);
            entry.Property<string>(CourseSearchColumns.FullName).CurrentValue = CatalogText.ToSearchKey(course.FullName);
            entry.Property<string>(CourseSearchColumns.ShortName).CurrentValue = CatalogText.ToSearchKey(course.ShortName);
        }
    }
}
