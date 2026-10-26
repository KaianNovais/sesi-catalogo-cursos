using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace CourseCatalog.Api.Security;

/// <summary>Limites de uso (seção "RateLimiting" da configuração).</summary>
internal sealed class RateLimitingSettings
{
    public const string Section = "RateLimiting";

    /// <summary>Requisições por cliente (IP) em cada janela. Folgado: uma rede inteira pode sair pelo mesmo IP.</summary>
    [Range(1, 100_000)]
    public int PermitLimitPerClient { get; set; } = 300;

    [Range(1, 3_600)]
    public int WindowSeconds { get; set; } = 60;

    /// <summary>Requisições simultâneas na instância inteira: protege o banco de picos, venham de onde vierem.</summary>
    [Range(1, 10_000)]
    public int ConcurrencyLimit { get; set; } = 64;

    /// <summary>Requisições que aguardam vaga quando o limite simultâneo está cheio.</summary>
    [Range(0, 10_000)]
    public int QueueLimit { get; set; } = 128;
}

internal static class RateLimiting
{
    /// <summary>
    /// Dois limites encadeados para todas as rotas (menos /health): simultâneas na instância e por IP
    /// numa janela fixa. Excedeu: 429 com Retry-After e corpo ProblemDetails.
    /// </summary>
    public static IServiceCollection AddApiRateLimiting(this IServiceCollection services)
    {
        services.AddOptions<RateLimitingSettings>()
            .BindConfiguration(RateLimitingSettings.Section)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = WriteRejectionAsync;
            options.GlobalLimiter = PartitionedRateLimiter.CreateChained(
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    var settings = GetSettings(context);
                    return RateLimitPartition.GetConcurrencyLimiter("instance", _ => new ConcurrencyLimiterOptions
                    {
                        PermitLimit = settings.ConcurrencyLimit,
                        QueueLimit = settings.QueueLimit,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    });
                }),
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    var settings = GetSettings(context);
                    var client = context.Connection.RemoteIpAddress?.ToString() ?? "desconhecido";
                    return RateLimitPartition.GetFixedWindowLimiter(client, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = settings.PermitLimitPerClient,
                        Window = TimeSpan.FromSeconds(settings.WindowSeconds),
                        QueueLimit = 0,
                    });
                }));
        });

        return services;
    }

    private static RateLimitingSettings GetSettings(HttpContext context) =>
        context.RequestServices.GetRequiredService<IOptions<RateLimitingSettings>>().Value;

    private static async ValueTask WriteRejectionAsync(OnRejectedContext context, CancellationToken cancellationToken)
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);
        }

        // TryWriteAsync: se o cliente não aceita JSON (ex.: Accept: text/plain), fica o 429 sem corpo,
        // em vez de uma exceção que viraria 500.
        var problemDetails = context.HttpContext.RequestServices.GetRequiredService<IProblemDetailsService>();
        await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context.HttpContext,
            ProblemDetails =
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Muitas requisições.",
                Detail = "Aguarde alguns instantes e tente novamente.",
            },
        });
    }
}
