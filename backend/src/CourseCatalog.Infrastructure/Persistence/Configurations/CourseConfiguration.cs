using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CourseCatalog.Infrastructure.Persistence.Configurations;

internal sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses", table =>
        {
            table.HasCheckConstraint("ck_courses_slug", SqlChecks.KebabCase("slug"));
            table.HasCheckConstraint("ck_courses_workload_hours", "workload_hours BETWEEN 1 AND 2000");
            // A imagem é sempre um arquivo do próprio front-end: o catálogo não aponta para URLs externas.
            table.HasCheckConstraint("ck_courses_image_url", "image_url ~ '^/images/courses/[a-z0-9-]+[.]webp$'");
        });

        builder.HasKey(course => course.Id);
        builder.Property(course => course.Id).ValueGeneratedNever();

        builder.Property(course => course.Slug).HasMaxLength(Slug.MaxLength);
        builder.HasIndex(course => course.Slug).IsUnique();
        builder.Property(course => course.FullName).HasMaxLength(200);
        builder.Property(course => course.ShortName).HasMaxLength(100);
        builder.Property(course => course.Summary).HasMaxLength(300);
        builder.Property(course => course.Description).HasMaxLength(4000);
        builder.Property(course => course.TargetAudience).HasMaxLength(500);
        builder.Property(course => course.ImageUrl).HasMaxLength(200);
        builder.Property(course => course.Certification).HasMaxLength(100);

        builder.Property<string>(CourseSearchColumns.FullName).HasMaxLength(200).IsRequired();
        builder.Property<string>(CourseSearchColumns.ShortName).HasMaxLength(100).IsRequired();

        // Restrict: uma categoria, modalidade ou status em uso não pode ser apagado.
        builder.HasOne(course => course.Category).WithMany()
            .HasForeignKey(course => course.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(course => course.Modality).WithMany()
            .HasForeignKey(course => course.ModalityId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(course => course.Status).WithMany()
            .HasForeignKey(course => course.StatusId).OnDelete(DeleteBehavior.Restrict);

        // Módulos e aulas pertencem ao curso (agregado): chave composta por curso + posição e
        // exclusão em cascata junto com o curso.
        builder.OwnsMany(course => course.Modules, module =>
        {
            module.ToTable("course_modules", table =>
                table.HasCheckConstraint("ck_course_modules_position", "position >= 1"));
            module.WithOwner().HasForeignKey("CourseId");
            module.HasKey("CourseId", nameof(CourseModule.Position));
            module.Property(courseModule => courseModule.Position).ValueGeneratedNever();
            module.Property(courseModule => courseModule.Title).HasMaxLength(200);

            module.OwnsMany(courseModule => courseModule.Lessons, lesson =>
            {
                lesson.ToTable("course_lessons", table =>
                    table.HasCheckConstraint("ck_course_lessons_position", "position >= 1"));
                lesson.WithOwner().HasForeignKey("CourseId", "ModulePosition");
                lesson.HasKey("CourseId", "ModulePosition", nameof(Lesson.Position));
                lesson.Property(courseLesson => courseLesson.Position).ValueGeneratedNever();
                lesson.Property(courseLesson => courseLesson.Title).HasMaxLength(200);
                lesson.Property(courseLesson => courseLesson.Description).HasMaxLength(1000);
            });
        });
    }
}
