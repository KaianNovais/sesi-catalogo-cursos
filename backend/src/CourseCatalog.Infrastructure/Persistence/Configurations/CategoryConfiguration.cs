using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CourseCatalog.Infrastructure.Persistence.Configurations;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories", table =>
        {
            table.HasCheckConstraint("ck_categories_slug", SqlChecks.KebabCase("slug"));
            table.HasCheckConstraint("ck_categories_color", "color ~ '^#[0-9A-Fa-f]{6}$'");
        });

        // Os ids vêm do seed (estáveis entre ambientes), então o banco não os gera.
        builder.HasKey(category => category.Id);
        builder.Property(category => category.Id).ValueGeneratedNever();

        builder.Property(category => category.Slug).HasMaxLength(Slug.MaxLength);
        builder.HasIndex(category => category.Slug).IsUnique();
        builder.Property(category => category.Name).HasMaxLength(100);
        builder.Property(category => category.Color).HasMaxLength(7);
    }
}
