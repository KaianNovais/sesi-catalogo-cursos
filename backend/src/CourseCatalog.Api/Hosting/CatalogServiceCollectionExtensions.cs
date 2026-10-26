using CourseCatalog.Application.Courses;
using CourseCatalog.Infrastructure;
using Microsoft.Extensions.Options;

namespace CourseCatalog.Api.Hosting;

internal static class CatalogServiceCollectionExtensions
{
    /// <summary>
    /// Casos de uso e acesso ao banco. A connection string "Catalog" usa o usuário somente leitura e vem
    /// de variável de ambiente (ConnectionStrings__Catalog) ou do dotnet user-secrets, nunca do appsettings.
    /// Sem ela, a API não sobe (ValidateOnStart).
    /// </summary>
    public static IServiceCollection AddCatalog(this IServiceCollection services)
    {
        services.AddOptions<CatalogDatabaseSettings>()
            .Configure<IConfiguration>((settings, configuration) =>
                settings.ConnectionString = configuration.GetConnectionString("Catalog") ?? string.Empty)
            .Validate(
                settings => !string.IsNullOrWhiteSpace(settings.ConnectionString),
                "Defina a connection string 'Catalog' (variável ConnectionStrings__Catalog ou dotnet user-secrets). Veja o README, seção 6.")
            .ValidateOnStart();

        services.AddCatalogPersistence(provider =>
            provider.GetRequiredService<IOptions<CatalogDatabaseSettings>>().Value.ConnectionString);
        services.AddScoped<CourseCatalogService>();
        return services;
    }

    private sealed class CatalogDatabaseSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
    }
}
