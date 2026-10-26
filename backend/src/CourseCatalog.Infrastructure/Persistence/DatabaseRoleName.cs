using System.Text.RegularExpressions;

namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>Nome de usuário (role) do PostgreSQL aceito na configuração: minúsculas, dígitos e "_".</summary>
public static partial class DatabaseRoleName
{
    public static bool IsValid(string? value) => value is not null && Pattern().IsMatch(value);

    [GeneratedRegex("^[a-z_][a-z0-9_]{0,62}$", RegexOptions.CultureInvariant)]
    private static partial Regex Pattern();
}
