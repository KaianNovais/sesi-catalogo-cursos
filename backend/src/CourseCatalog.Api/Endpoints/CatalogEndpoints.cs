using System.ComponentModel.DataAnnotations;
using CourseCatalog.Application.Courses;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Net.Http.Headers;

namespace CourseCatalog.Api.Endpoints;

/// <summary>Endpoints do catálogo (contrato do README §7). Todos são GET: a API não altera dados.</summary>
internal static class CatalogEndpoints
{
    private const string CachePolicy = "catalog";

    /// <summary>
    /// Cache de saída: a mesma consulta, em até 60 s, não vai ao banco. A chave considera só os
    /// parâmetros do contrato (parâmetros extras não criam entradas novas) e a origem (CORS), e
    /// diferencia maiúsculas no caminho (o slug é exato: /api/courses/ABC não é /api/courses/abc).
    /// Sem "locking": com ele, requisições iguais e simultâneas esperam a primeira, e se o cliente
    /// dela desiste (troca de página), o cancelamento derruba as outras com erro 500.
    /// </summary>
    public static IServiceCollection AddCatalogOutputCache(this IServiceCollection services) =>
        services.AddOutputCache(options =>
        {
            options.SizeLimit = 32 * 1024 * 1024;
            options.UseCaseSensitivePaths = true;
            options.AddPolicy(CachePolicy, policy => policy
                .Expire(TimeSpan.FromSeconds(60))
                .SetVaryByQuery("search", "category", "modality", "status", "featured")
                .SetVaryByHeader(HeaderNames.Origin)
                .SetLocking(false));
        });

    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder routes)
    {
        var api = routes.MapGroup("/api")
            .WithTags("Catálogo")
            .CacheOutput(CachePolicy)
            .AddEndpointFilter(AllowPublicCaching);

        api.MapGet("/courses", ListCoursesAsync)
            .WithName("ListCourses")
            .WithSummary("Lista os cursos (resumo), com busca pelo nome e filtros combináveis.");

        api.MapGet("/courses/{slug}", GetCourseAsync)
            .WithName("GetCourse")
            .WithSummary("Detalhes do curso, com módulos e aulas.");

        api.MapGet("/categories", async (CourseCatalogService catalog, CancellationToken cancellationToken) =>
                TypedResults.Ok(await catalog.ListCategoriesAsync(cancellationToken)))
            .WithName("ListCategories")
            .WithSummary("Categorias (opções do filtro).");

        api.MapGet("/modalities", async (CourseCatalogService catalog, CancellationToken cancellationToken) =>
                TypedResults.Ok(await catalog.ListModalitiesAsync(cancellationToken)))
            .WithName("ListModalities")
            .WithSummary("Modalidades (opções do filtro).");

        api.MapGet("/statuses", async (CourseCatalogService catalog, CancellationToken cancellationToken) =>
                TypedResults.Ok(await catalog.ListStatusesAsync(cancellationToken)))
            .WithName("ListStatuses")
            .WithSummary("Status (opções do filtro).");

        return routes;
    }

    /// <param name="search">Texto buscado no nome completo ou no nome breve (sem diferenciar acentos e maiúsculas).</param>
    /// <param name="category">Slug da categoria.</param>
    /// <param name="modality">Código da modalidade.</param>
    /// <param name="status">Código do status.</param>
    /// <param name="featured">Com <c>true</c>, só os cursos em destaque.</param>
    /// <param name="catalog">Casos de uso do catálogo.</param>
    /// <param name="cancellationToken">Cancelado quando o cliente desiste ou o tempo da requisição acaba.</param>
    private static async Task<Ok<CourseListDto>> ListCoursesAsync(
        [MaxLength(CourseFilter.SearchMaxLength, ErrorMessage = "A busca aceita no máximo 100 caracteres.")] string? search,
        [MaxLength(CourseFilter.CodeMaxLength, ErrorMessage = "A categoria aceita no máximo 50 caracteres.")] string? category,
        [MaxLength(CourseFilter.CodeMaxLength, ErrorMessage = "A modalidade aceita no máximo 50 caracteres.")] string? modality,
        [MaxLength(CourseFilter.CodeMaxLength, ErrorMessage = "O status aceita no máximo 50 caracteres.")] string? status,
        bool? featured,
        CourseCatalogService catalog,
        CancellationToken cancellationToken)
    {
        var filter = new CourseFilter
        {
            Search = search,
            Category = category,
            Modality = modality,
            Status = status,
            Featured = featured == true,
        };
        return TypedResults.Ok(await catalog.ListCoursesAsync(filter, cancellationToken));
    }

    private static async Task<Results<Ok<CourseDetailDto>, ProblemHttpResult>> GetCourseAsync(
        string slug,
        CourseCatalogService catalog,
        CancellationToken cancellationToken)
    {
        var course = await catalog.GetCourseDetailsAsync(slug, cancellationToken);
        return course is null
            ? TypedResults.Problem(title: "Curso não encontrado.", statusCode: StatusCodes.Status404NotFound)
            : TypedResults.Ok(course);
    }

    /// <summary>
    /// Respostas de sucesso podem ficar 60 s em cache: os dados só mudam com um novo seed. "Vary: Origin"
    /// evita que um cache compartilhado entregue a resposta de uma origem (CORS) para outra.
    /// Erros recebem "no-store" (cabeçalhos de segurança).
    /// </summary>
    private static async ValueTask<object?> AllowPublicCaching(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var result = await next(context);
        var actual = result is INestedHttpResult nested ? nested.Result : result;
        if (actual is IStatusCodeHttpResult { StatusCode: StatusCodes.Status200OK })
        {
            var headers = context.HttpContext.Response.Headers;
            headers.CacheControl = "public, max-age=60";
            if (!headers.Vary.Any(value => value?.Contains(HeaderNames.Origin, StringComparison.OrdinalIgnoreCase) == true))
            {
                headers.Append(HeaderNames.Vary, HeaderNames.Origin);
            }
        }

        return result;
    }
}
