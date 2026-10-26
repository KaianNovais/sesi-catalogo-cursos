using CourseCatalog.Api.Endpoints;
using CourseCatalog.Api.Hosting;
using CourseCatalog.Api.Security;
using Microsoft.AspNetCore.Http.Timeouts;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(kestrel =>
{
    // Não anuncia o servidor (cabeçalho "Server") e recusa corpos grandes: a API só tem GET.
    kestrel.AddServerHeader = false;
    kestrel.Limits.MaxRequestBodySize = 1024;
});

builder.Services.AddApiErrorHandling();
builder.Services.AddValidation();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddRequestTimeouts(options => options.DefaultPolicy = new RequestTimeoutPolicy
{
    Timeout = TimeSpan.FromSeconds(10),
    TimeoutStatusCode = StatusCodes.Status504GatewayTimeout,
});
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
});
builder.Services.AddReverseProxyHeaders();
builder.Services.AddApiCors();
builder.Services.AddApiRateLimiting();
builder.Services.AddCatalogOutputCache();
builder.Services.AddCatalog();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseSecurityHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseCors();
app.UseRateLimiter();
app.UseRequestTimeouts();
app.UseOutputCache();

if (app.Environment.IsDevelopment())
{
    // Documento OpenAPI em /openapi/v1.json, só no ambiente de desenvolvimento.
    app.MapOpenApi();
}

// Verificação de saúde da hospedagem: não consulta o banco (não o acorda nem gasta cota) e só aceita GET/HEAD.
app.MapHealthChecks("/health")
    .DisableRateLimiting()
    .WithMetadata(new HttpMethodMetadata([HttpMethods.Get, HttpMethods.Head]));
app.MapCatalogEndpoints();

await app.RunAsync();

/// <summary>Ponto de entrada; público para os testes de integração (WebApplicationFactory).</summary>
public partial class Program;
