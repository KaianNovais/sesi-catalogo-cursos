using CourseCatalog.Infrastructure.Seeding;
using Microsoft.EntityFrameworkCore;

namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>
/// Prepara o banco: aplica as migrations, grava o seed e dá ao usuário da API permissão só de leitura.
/// Roda com o usuário dono do banco, pelo CourseCatalog.DbMigrator (e pelos testes de integração).
/// </summary>
public sealed class CatalogDatabaseInitializer(CatalogDbContext db, CatalogSeeder seeder)
{
    // Os nomes chegam como parâmetros (set_config) e o próprio PostgreSQL os cita com %I: nenhum SQL é
    // montado por concatenação. REVOKE antes do GRANT garante que sobre só o SELECT, e o histórico de
    // migrations (assunto só do migrador) fica fora do alcance da API.
    private const string GrantReadAccessSql = """
        DO $$
        DECLARE
          target_schema text := current_setting('catalog.schema');
          history_table text := current_setting('catalog.history_table');
          reader text := current_setting('catalog.reader_role');
        BEGIN
          EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', target_schema, reader);
          EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM %I', target_schema, reader);
          EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO %I', target_schema, reader);
          EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM %I', target_schema, history_table, reader);
          EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT ON TABLES TO %I', target_schema, reader);
        END
        $$
        """;

    public async Task<SeedSummary> InitializeAsync(string seedFilePath, string readerRole, CancellationToken cancellationToken)
    {
        if (!DatabaseRoleName.IsValid(readerRole))
        {
            throw new ArgumentException($"Nome de usuário do banco inválido: \"{readerRole}\".", nameof(readerRole));
        }

        // O seed é validado antes de qualquer alteração no banco.
        var data = await SeedDataReader.ReadAsync(seedFilePath, cancellationToken);

        await db.Database.MigrateAsync(cancellationToken);
        var summary = await seeder.SeedAsync(data, cancellationToken);
        await GrantReadAccessAsync(readerRole, cancellationToken);

        return summary;
    }

    private async Task GrantReadAccessAsync(string readerRole, CancellationToken cancellationToken)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
            await db.Database.ExecuteSqlAsync(
                $"""
                SELECT set_config('catalog.schema', {CatalogDatabase.Schema}, true),
                       set_config('catalog.history_table', {CatalogDatabase.MigrationsHistoryTable}, true),
                       set_config('catalog.reader_role', {readerRole}, true)
                """,
                cancellationToken);
            await db.Database.ExecuteSqlRawAsync(GrantReadAccessSql, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
    }
}
