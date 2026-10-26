using CourseCatalog.Application.Courses;
using CourseCatalog.Infrastructure.Persistence;
using CourseCatalog.Infrastructure.Seeding;
using Microsoft.Extensions.DependencyInjection;

namespace CourseCatalog.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    /// <summary>
    /// Registra o DbContext (em pool) e o repositório do catálogo. A connection string é lida só quando
    /// o primeiro DbContext é criado, depois de toda a configuração carregada.
    /// </summary>
    public static IServiceCollection AddCatalogPersistence(
        this IServiceCollection services,
        Func<IServiceProvider, string> connectionString)
    {
        ArgumentNullException.ThrowIfNull(connectionString);

        services.AddDbContextPool<CatalogDbContext>((provider, options) =>
            CatalogDatabase.Configure(options, connectionString(provider)));
        services.AddScoped<ICourseRepository, EfCourseRepository>();
        return services;
    }

    /// <summary>Migrations, seed e permissões: só para quem usa a credencial de dono do banco.</summary>
    public static IServiceCollection AddCatalogDatabaseInitialization(this IServiceCollection services)
    {
        services.AddScoped<CatalogSeeder>();
        services.AddScoped<CatalogDatabaseInitializer>();
        return services;
    }
}
