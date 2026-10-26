using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CourseCatalog.Infrastructure.Persistence.Configurations;

internal sealed class CourseStatusConfiguration : IEntityTypeConfiguration<CourseStatus>
{
    public void Configure(EntityTypeBuilder<CourseStatus> builder)
    {
        builder.ToTable("statuses", table => table.HasCheckConstraint("ck_statuses_code", SqlChecks.KebabCase("code")));

        builder.HasKey(status => status.Id);
        builder.Property(status => status.Id).ValueGeneratedNever();

        builder.Property(status => status.Code).HasMaxLength(50);
        builder.HasIndex(status => status.Code).IsUnique();
        builder.Property(status => status.Name).HasMaxLength(100);
    }
}
