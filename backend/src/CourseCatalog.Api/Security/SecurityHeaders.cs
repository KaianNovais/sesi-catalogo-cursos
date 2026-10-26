using Microsoft.Net.Http.Headers;

namespace CourseCatalog.Api.Security;

internal static class SecurityHeaders
{
    /// <summary>
    /// Cabeçalhos de segurança em todas as respostas, inclusive erros (aplicados no OnStarting, depois
    /// de qualquer limpeza feita pelo tratamento de exceções):
    /// - nosniff: o navegador não "adivinha" o tipo do conteúdo;
    /// - CSP default-src 'none' e frame-ancestors 'none': JSON aberto direto não executa nada nem vira iframe;
    /// - Referrer-Policy e Cross-Origin-Resource-Policy: nada vaza para outros sites;
    /// - Cache-Control no-store, a menos que o endpoint libere cache (respostas de sucesso do catálogo).
    /// </summary>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app) =>
        app.Use(static (context, next) =>
        {
            context.Response.OnStarting(
                static state =>
                {
                    var headers = ((HttpResponse)state).Headers;
                    headers.XContentTypeOptions = "nosniff";
                    headers.XFrameOptions = "DENY";
                    headers.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
                    headers["Referrer-Policy"] = "no-referrer";
                    headers["Cross-Origin-Resource-Policy"] = "same-origin";
                    if (!headers.ContainsKey(HeaderNames.CacheControl))
                    {
                        headers.CacheControl = "no-store";
                    }

                    return Task.CompletedTask;
                },
                context.Response);
            return next(context);
        });
}
