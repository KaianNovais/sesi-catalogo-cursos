using Microsoft.Extensions.Logging;

namespace CourseCatalog.DbMigrator;

/// <summary>Mensagens de log do migrador (geradas em tempo de compilação pelo LoggerMessage).</summary>
internal static partial class MigratorLog
{
    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Banco pronto: {Courses} cursos, {Categories} categorias, {Modalities} modalidades e {Statuses} status; leitura liberada para {ReaderRole}.")]
    public static partial void DatabaseReady(ILogger logger, int courses, int categories, int modalities, int statuses, string readerRole);

    [LoggerMessage(Level = LogLevel.Error, Message = "Nada foi gravado. {Reason}")]
    public static partial void InvalidSeed(ILogger logger, string reason);
}
