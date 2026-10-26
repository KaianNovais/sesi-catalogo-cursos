using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;

namespace CourseCatalog.Infrastructure.Persistence;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Modality> Modalities => Set<Modality>();

    public DbSet<CourseStatus> Statuses => Set<CourseStatus>();

    public DbSet<Course> Courses => Set<Course>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(CatalogDatabase.Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogDbContext).Assembly);
    }
}
