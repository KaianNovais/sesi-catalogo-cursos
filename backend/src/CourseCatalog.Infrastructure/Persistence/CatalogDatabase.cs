using Microsoft.EntityFrameworkCore;

namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>
/// Configuração única do banco, usada pela API, pelo migrador, pelos testes e pelas ferramentas do EF:
/// assim o modelo das migrations é sempre o mesmo que roda em produção.
/// </summary>
public static class CatalogDatabase
{
    /// <summary>Schema próprio do catálogo; o usuário da API só recebe permissão de leitura nele.</summary>
    public const string Schema = "catalog";

    public const string MigrationsHistoryTable = "__ef_migrations_history";

    public static DbContextOptionsBuilder Configure(DbContextOptionsBuilder options, string connectionString)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        return options
            .UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable(MigrationsHistoryTable, Schema)
                // Repete a operação após falhas transitórias (ex.: banco gerenciado saindo do modo de espera).
                .EnableRetryOnFailure(maxRetryCount: 3))
            .UseSnakeCaseNamingConvention()
            // O catálogo é só leitura: nenhuma consulta precisa rastrear entidades.
            .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    }
}
