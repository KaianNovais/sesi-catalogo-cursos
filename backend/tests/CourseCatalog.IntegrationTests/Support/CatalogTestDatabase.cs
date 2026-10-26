using System.ComponentModel;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Security.Cryptography;
using CourseCatalog.Infrastructure;
using CourseCatalog.Infrastructure.Persistence;
using CourseCatalog.Infrastructure.Seeding;
using CourseCatalog.IntegrationTests.Support;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

[assembly: AssemblyFixture(typeof(CatalogTestDatabase))]

namespace CourseCatalog.IntegrationTests.Support;

/// <summary>
/// Banco PostgreSQL temporário, criado como o real: backend/database/setup.sql (usuários e banco) e o
/// inicializador do DbMigrator (migrations, seed e permissões). Os nomes levam um sufixo aleatório e,
/// no fim, só o que foi criado aqui é apagado.
/// Conexão de administrador: variável CATALOG_TEST_ADMIN_CONNECTION (padrão: PostgreSQL local, usuário atual).
/// </summary>
public sealed class CatalogTestDatabase : IAsyncLifetime
{
    private readonly string suffix = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(4));
    private readonly NpgsqlConnectionStringBuilder admin = new(
        Environment.GetEnvironmentVariable("CATALOG_TEST_ADMIN_CONNECTION")
        ?? $"Host=localhost;Username={Environment.UserName};Database=postgres");

    public static string SeedFilePath { get; } = Path.Combine(AppContext.BaseDirectory, "courses.seed.json");

    public string DatabaseName => $"course_catalog_test_{suffix}";

    public string OwnerRole => $"catalog_owner_test_{suffix}";

    public string ApiRole => $"catalog_api_test_{suffix}";

    public string OwnerConnectionString { get; private set; } = string.Empty;

    public string ApiConnectionString { get; private set; } = string.Empty;

    /// <summary>API com a configuração padrão dos testes (usuário somente leitura).</summary>
    public CatalogApiFactory Api { get; private set; } = null!;

    public async ValueTask InitializeAsync()
    {
        var ownerPassword = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(24));
        var apiPassword = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(24));
        await RunSetupScriptAsync(ownerPassword, apiPassword);

        OwnerConnectionString = ConnectionStringFor(OwnerRole, ownerPassword);
        ApiConnectionString = ConnectionStringFor(ApiRole, apiPassword);

        await InitializeCatalogAsync(CancellationToken.None);
        Api = new CatalogApiFactory(ApiConnectionString);
    }

    /// <summary>Mesmo caminho do DbMigrator: migrations, seed e permissão de leitura para o usuário da API.</summary>
    public async Task<SeedSummary> InitializeCatalogAsync(CancellationToken cancellationToken)
    {
        var services = new ServiceCollection()
            .AddCatalogPersistence(_ => OwnerConnectionString)
            .AddCatalogDatabaseInitialization()
            .BuildServiceProvider();
        await using (services)
        {
            await using var scope = services.CreateAsyncScope();
            var initializer = scope.ServiceProvider.GetRequiredService<CatalogDatabaseInitializer>();
            return await initializer.InitializeAsync(SeedFilePath, ApiRole, cancellationToken);
        }
    }

    [SuppressMessage(
        "Security",
        "CA2100:Review SQL queries for security vulnerabilities",
        Justification = "Os nomes são gerados por este fixture (prefixo fixo e sufixo hexadecimal).")]
    public async ValueTask DisposeAsync()
    {
        if (Api is not null)
        {
            await Api.DisposeAsync();
        }

        NpgsqlConnection.ClearAllPools();
        await using var connection = new NpgsqlConnection(admin.ConnectionString);
        await connection.OpenAsync();
        foreach (var sql in new[]
        {
            $"DROP DATABASE IF EXISTS \"{DatabaseName}\" WITH (FORCE)",
            $"DROP ROLE IF EXISTS \"{ApiRole}\"",
            $"DROP ROLE IF EXISTS \"{OwnerRole}\"",
        })
        {
            await using var command = new NpgsqlCommand(sql, connection);
            await command.ExecuteNonQueryAsync();
        }
    }

    private string ConnectionStringFor(string role, string password) =>
        new NpgsqlConnectionStringBuilder(admin.ConnectionString)
        {
            Database = DatabaseName,
            Username = role,
            Password = password,
        }.ConnectionString;

    private async Task RunSetupScriptAsync(string ownerPassword, string apiPassword)
    {
        var startInfo = new ProcessStartInfo(Environment.GetEnvironmentVariable("PSQL") ?? "psql")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        foreach (var argument in new[]
        {
            "-X", "-q", "-d", admin.Database ?? "postgres",
            "-v", $"db_name={DatabaseName}",
            "-v", $"owner_role={OwnerRole}",
            "-v", $"api_role={ApiRole}",
            "-f", Path.Combine(AppContext.BaseDirectory, "database", "setup.sql"),
        })
        {
            startInfo.ArgumentList.Add(argument);
        }

        // Credenciais por variável de ambiente, como no uso real do script (nunca na linha de comando).
        startInfo.Environment["PGHOST"] = admin.Host;
        startInfo.Environment["PGPORT"] = admin.Port.ToString(CultureInfo.InvariantCulture);
        startInfo.Environment["PGUSER"] = admin.Username ?? Environment.UserName;
        if (!string.IsNullOrEmpty(admin.Password))
        {
            startInfo.Environment["PGPASSWORD"] = admin.Password;
        }

        startInfo.Environment["CATALOG_OWNER_PASSWORD"] = ownerPassword;
        startInfo.Environment["CATALOG_API_PASSWORD"] = apiPassword;

        Process process;
        try
        {
            process = Process.Start(startInfo) ?? throw new InvalidOperationException("Não foi possível iniciar o psql.");
        }
        catch (Win32Exception exception)
        {
            throw new InvalidOperationException(
                "O psql (cliente do PostgreSQL) não foi encontrado. Instale-o ou informe o caminho na variável PSQL.",
                exception);
        }

        using (process)
        {
            var output = process.StandardOutput.ReadToEndAsync();
            var error = process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();
            await Task.WhenAll(output, error);
            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException(
                    $"backend/database/setup.sql falhou (código {process.ExitCode}). O PostgreSQL está rodando? {await error}");
            }
        }
    }
}
