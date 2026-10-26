using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

namespace CourseCatalog.Api.Security;

/// <summary>API atrás do proxy da hospedagem (seção "ReverseProxy" da configuração).</summary>
internal sealed class ReverseProxySettings
{
    public const string Section = "ReverseProxy";

    /// <summary>Lê X-Forwarded-For e X-Forwarded-Proto. Desligado localmente, onde não há proxy.</summary>
    public bool Enabled { get; set; }

    /// <summary>Quantos proxies confiáveis ficam na frente da API (cada um acrescenta um IP ao X-Forwarded-For).</summary>
    [Range(1, 5)]
    public int ForwardLimit { get; set; } = 1;
}

internal static class ReverseProxy
{
    /// <summary>
    /// IP real do cliente (usado pelo limite por IP) e esquema HTTPS original (usado pelo HSTS).
    /// Os IPs do proxy de uma hospedagem gerenciada não são fixos, então a API confia nos últimos
    /// ForwardLimit saltos, que o próprio proxy acrescenta. Só é seguro porque o contêiner recebe
    /// tráfego apenas através dele; um X-Forwarded-For forjado pelo cliente fica à esquerda e é ignorado.
    /// </summary>
    public static IServiceCollection AddReverseProxyHeaders(this IServiceCollection services)
    {
        services.AddOptions<ReverseProxySettings>()
            .BindConfiguration(ReverseProxySettings.Section)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<ForwardedHeadersOptions>()
            .Configure<IOptions<ReverseProxySettings>>((options, settings) =>
            {
                if (!settings.Value.Enabled)
                {
                    options.ForwardedHeaders = ForwardedHeaders.None;
                    return;
                }

                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.ForwardLimit = settings.Value.ForwardLimit;
                options.KnownIPNetworks.Clear();
                options.KnownProxies.Clear();
            });

        return services;
    }
}
