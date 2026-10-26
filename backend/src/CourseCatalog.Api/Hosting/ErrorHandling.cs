namespace CourseCatalog.Api.Hosting;

internal static class ErrorHandling
{
    // Títulos padrão do ASP.NET Core trocados pelos equivalentes em português (a API é pt-BR).
    private static readonly Dictionary<string, string> TranslatedTitles = new(StringComparer.Ordinal)
    {
        ["One or more validation errors occurred."] = "Parâmetros inválidos.",
        ["Bad Request"] = "Requisição inválida.",
        ["Not Found"] = "Recurso não encontrado.",
        ["Method Not Allowed"] = "Método não permitido.",
        ["Gateway Timeout"] = "Tempo de resposta esgotado.",
        ["An error occurred while processing your request."] = "Erro interno. Tente novamente mais tarde.",
    };

    /// <summary>
    /// Todo erro vira ProblemDetails (RFC 9457) com traceId, sem stack trace nem detalhes internos.
    /// Parâmetro que não pode ser convertido (ex.: featured=abc) é 400 em qualquer ambiente; em
    /// desenvolvimento o ASP.NET o lança como exceção, que de outro modo viraria 500.
    /// </summary>
    public static IServiceCollection AddApiErrorHandling(this IServiceCollection services)
    {
        services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
        {
            if (context.ProblemDetails.Title is { } title && TranslatedTitles.TryGetValue(title, out var translated))
            {
                context.ProblemDetails.Title = translated;
            }
        });

        services.Configure<ExceptionHandlerOptions>(options => options.StatusCodeSelector = exception =>
            exception is BadHttpRequestException badRequest
                ? badRequest.StatusCode
                : StatusCodes.Status500InternalServerError);

        return services;
    }
}
