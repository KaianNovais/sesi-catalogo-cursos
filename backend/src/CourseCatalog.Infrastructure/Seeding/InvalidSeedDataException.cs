namespace CourseCatalog.Infrastructure.Seeding;

/// <summary>O arquivo de seed tem dados inconsistentes; nada foi gravado no banco.</summary>
public sealed class InvalidSeedDataException : Exception
{
    public InvalidSeedDataException()
    {
    }

    public InvalidSeedDataException(string message)
        : base(message)
    {
    }

    public InvalidSeedDataException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public InvalidSeedDataException(IReadOnlyList<string> errors)
        : base("Seed inconsistente:" + Environment.NewLine + string.Join(Environment.NewLine, errors.Select(error => $"- {error}")))
    {
        Errors = errors;
    }

    public IReadOnlyList<string> Errors { get; } = [];
}
