using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>
/// Usada só pelas ferramentas do EF (<c>dotnet ef migrations add</c>), que não abrem conexão:
/// a connection string abaixo não tem senha e nunca é usada para acessar um banco.
/// </summary>
public sealed class CatalogDbContextDesignTimeFactory : IDesignTimeDbContextFactory<CatalogDbContext>
{
    public CatalogDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<CatalogDbContext>();
        CatalogDatabase.Configure(options, "Host=localhost;Database=course_catalog");
        return new CatalogDbContext(options.Options);
    }
}
