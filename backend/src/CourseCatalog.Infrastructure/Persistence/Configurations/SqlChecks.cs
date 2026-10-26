namespace CourseCatalog.Infrastructure.Persistence.Configurations;

/// <summary>Restrições CHECK reaproveitadas: o banco também recusa dados fora do formato.</summary>
internal static class SqlChecks
{
    /// <summary>Slug ou código em kebab-case (mesma regra de <c>Slug.IsValid</c>).</summary>
    public static string KebabCase(string column) => $"{column} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'";
}
