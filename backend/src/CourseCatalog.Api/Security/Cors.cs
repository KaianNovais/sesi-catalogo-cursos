using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace CourseCatalog.Api.Security;

/// <summary>Origens que podem chamar a API pelo navegador (seção "Cors" da configuração).</summary>
internal sealed class CorsSettings
{
    public const string Section = "Cors";

    /// <summary>
    /// Origens completas (ex.: <c>http://localhost:5173</c>). Vazio = nenhuma: em produção o front e a
    /// API ficam no mesmo domínio e o CORS não é necessário.
    /// </summary>
    public IList<string> AllowedOrigins { get; } = [];
}

internal static class Cors
{
    /// <summary>Política única: só as origens configuradas, só GET, sem cookies nem credenciais.</summary>
    public static IServiceCollection AddApiCors(this IServiceCollection services)
    {
        services.AddOptions<CorsSettings>()
            .BindConfiguration(CorsSettings.Section)
            .Validate(
                settings => settings.AllowedOrigins.All(IsOrigin),
                "Cors:AllowedOrigins aceita só origens completas, como https://exemplo.com.br (sem *, caminho ou barra no fim).")
            .ValidateOnStart();

        services.AddCors();
        services.AddOptions<CorsOptions>()
            .Configure<IOptions<CorsSettings>>((cors, settings) => cors.AddDefaultPolicy(policy => policy
                .WithOrigins([.. settings.Value.AllowedOrigins])
                .WithMethods(HttpMethods.Get)
                .WithHeaders(HeaderNames.Accept)
                .SetPreflightMaxAge(TimeSpan.FromHours(1))));

        return services;
    }

    private static bool IsOrigin(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp)
        && string.Equals(value, uri.GetLeftPart(UriPartial.Authority), StringComparison.Ordinal);
}
