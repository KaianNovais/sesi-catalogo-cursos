using System.Text.Json;
using CourseCatalog.DbMigrator;
using CourseCatalog.Infrastructure;
using CourseCatalog.Infrastructure.Persistence;
using CourseCatalog.Infrastructure.Seeding;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

// Aplica as migrations, grava os dados fictícios de data/courses.seed.json e dá ao usuário da API
// (Database:ReaderRole) permissão só de leitura. Usa a credencial de dono do banco
// (ConnectionStrings:CatalogAdmin), que a API nunca recebe.
// A configuração (appsettings.json) e o seed ficam ao lado do executável, de onde quer que ele seja chamado.
var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
});

var connectionString = builder.Configuration.GetConnectionString("CatalogAdmin");
if (string.IsNullOrWhiteSpace(connectionString))
{
    await Console.Error.WriteLineAsync(
        "Defina a connection string 'CatalogAdmin' (variável de ambiente ConnectionStrings__CatalogAdmin " +
        "ou dotnet user-secrets). Veja o README, seção 6.");
    return 1;
}

var readerRole = builder.Configuration["Database:ReaderRole"] ?? "catalog_api";
var seedFilePath = Path.Combine(AppContext.BaseDirectory, "courses.seed.json");

builder.Services
    .AddCatalogPersistence(_ => connectionString)
    .AddCatalogDatabaseInitialization();

using var host = builder.Build();
var logger = host.Services.GetRequiredService<ILoggerFactory>().CreateLogger("CourseCatalog.DbMigrator");

await using var scope = host.Services.CreateAsyncScope();
var initializer = scope.ServiceProvider.GetRequiredService<CatalogDatabaseInitializer>();

try
{
    var summary = await initializer.InitializeAsync(seedFilePath, readerRole, CancellationToken.None);
    MigratorLog.DatabaseReady(logger, summary.Courses, summary.Categories, summary.Modalities, summary.Statuses, readerRole);
    return 0;
}
catch (Exception exception) when (exception is InvalidSeedDataException or JsonException)
{
    // Seed inconsistente ou JSON fora do formato (ex.: campo desconhecido): nada foi gravado no banco.
    MigratorLog.InvalidSeed(logger, exception.Message);
    return 1;
}
