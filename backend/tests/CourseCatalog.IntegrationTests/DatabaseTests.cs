using System.Net;
using CourseCatalog.IntegrationTests.Support;
using Npgsql;

namespace CourseCatalog.IntegrationTests;

/// <summary>Privilégio mínimo no banco e preparação idempotente (DbMigrator).</summary>
public sealed class DatabaseTests(CatalogTestDatabase database)
{
    [Fact]
    public async Task ApiUser_CanReadTheCatalog()
    {
        var count = await ScalarAsync<long>(database.ApiConnectionString, "SELECT count(*) FROM catalog.courses");

        Assert.Equal(ExpectedCatalog.Courses.Count, count);
    }

    [Fact]
    public async Task ApiUser_CannotReadTheMigrationsHistory()
    {
        var exception = await Assert.ThrowsAsync<PostgresException>(() => ExecuteAsync(
            database.ApiConnectionString,
            "SELECT count(*) FROM catalog.__ef_migrations_history"));

        Assert.Equal(PostgresErrorCodes.InsufficientPrivilege, exception.SqlState);
    }

    [Fact]
    public async Task ApiUser_SessionsStartReadOnly()
    {
        var exception = await Assert.ThrowsAsync<PostgresException>(() => ExecuteAsync(
            database.ApiConnectionString,
            "INSERT INTO catalog.statuses (id, code, name) VALUES (99, 'teste', 'Teste')"));

        Assert.Equal(PostgresErrorCodes.ReadOnlySqlTransaction, exception.SqlState);
    }

    [Theory]
    [InlineData("INSERT INTO catalog.statuses (id, code, name) VALUES (99, 'teste', 'Teste')")]
    [InlineData("UPDATE catalog.courses SET featured = NOT featured")]
    [InlineData("DELETE FROM catalog.course_lessons")]
    [InlineData("TRUNCATE catalog.categories CASCADE")]
    [InlineData("CREATE TABLE catalog.invasao (id int)")]
    [InlineData("CREATE TABLE public.invasao (id int)")]
    public async Task ApiUser_CannotWriteEvenAfterTurningReadOnlyOff(string sql)
    {
        // A sessão somente leitura é uma segunda barreira; a primeira são as permissões (só SELECT).
        var exception = await Assert.ThrowsAsync<PostgresException>(() => ExecuteAsync(
            database.ApiConnectionString,
            "SET default_transaction_read_only = off",
            sql));

        Assert.Equal(PostgresErrorCodes.InsufficientPrivilege, exception.SqlState);
    }

    [Fact]
    public async Task ApiUser_HasQueryAndConnectionLimits()
    {
        Assert.Equal("5s", await ScalarAsync<string>(database.ApiConnectionString, "SHOW statement_timeout"));
        Assert.Equal(20, await ScalarAsync<int>(
            database.ApiConnectionString,
            "SELECT rolconnlimit FROM pg_roles WHERE rolname = current_user"));
    }

    [Fact]
    public async Task Database_RejectsImagesOutsideTheFrontEnd()
    {
        // Mesmo com o usuário dono, o banco recusa uma imagem que não seja /images/courses/<slug>.webp.
        var exception = await Assert.ThrowsAsync<PostgresException>(() => ExecuteAsync(
            database.OwnerConnectionString,
            "BEGIN",
            "UPDATE catalog.courses SET image_url = 'https://site-malicioso.example/rastreio.gif' WHERE id = 1"));

        Assert.Equal(PostgresErrorCodes.CheckViolation, exception.SqlState);
    }

    [Fact]
    public async Task Initialization_CanRunAgainWithoutDuplicatingData()
    {
        var summary = await database.InitializeCatalogAsync(TestContext.Current.CancellationToken);

        Assert.Equal(ExpectedCatalog.Courses.Count, summary.Courses);
        Assert.Equal(ExpectedCatalog.Courses.Count, await ScalarAsync<long>(database.OwnerConnectionString, "SELECT count(*) FROM catalog.courses"));
        Assert.Equal(ExpectedCatalog.LessonCount, await ScalarAsync<long>(database.OwnerConnectionString, "SELECT count(*) FROM catalog.course_lessons"));
        // As permissões continuam valendo para o usuário da API.
        Assert.Equal(HttpStatusCode.OK, (await database.Api.GetAsync("/api/courses")).Status);
    }

    private static async Task<T> ScalarAsync<T>(string connectionString, string sql)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(TestContext.Current.CancellationToken);
        await using var command = new NpgsqlCommand(sql, connection);
        return (T)(await command.ExecuteScalarAsync(TestContext.Current.CancellationToken))!;
    }

    private static async Task ExecuteAsync(string connectionString, params string[] statements)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(TestContext.Current.CancellationToken);
        foreach (var sql in statements)
        {
            await using var command = new NpgsqlCommand(sql, connection);
            await command.ExecuteNonQueryAsync(TestContext.Current.CancellationToken);
        }
    }
}
