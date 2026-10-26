using CourseCatalog.Domain.Courses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CourseCatalog.Infrastructure.Persistence.Configurations;

internal sealed class ModalityConfiguration : IEntityTypeConfiguration<Modality>
{
    public void Configure(EntityTypeBuilder<Modality> builder)
    {
        builder.ToTable("modalities", table => table.HasCheckConstraint("ck_modalities_code", SqlChecks.KebabCase("code")));

        builder.HasKey(modality => modality.Id);
        builder.Property(modality => modality.Id).ValueGeneratedNever();

        builder.Property(modality => modality.Code).HasMaxLength(50);
        builder.HasIndex(modality => modality.Code).IsUnique();
        builder.Property(modality => modality.Name).HasMaxLength(100);
    }
}
