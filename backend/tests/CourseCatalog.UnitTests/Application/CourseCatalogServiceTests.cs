using CourseCatalog.Application.Courses;

namespace CourseCatalog.UnitTests.Application;

public sealed class CourseCatalogServiceTests
{
    private readonly FakeCourseRepository repository = new();

    [Fact]
    public async Task ListCoursesAsync_SendsTheNormalizedFilterAndCountsTheItems()
    {
        repository.Courses = [CreateSummary(1), CreateSummary(2)];
        var service = new CourseCatalogService(repository);

        var result = await service.ListCoursesAsync(new CourseFilter { Search = "  metal  " }, TestContext.Current.CancellationToken);

        Assert.Equal("metal", repository.LastFilter?.Search);
        Assert.Equal(2, result.Total);
        Assert.Equal(result.Items.Count, result.Total);
    }

    [Theory]
    [InlineData("Not_A_Slug")]
    [InlineData("../segredo")]
    [InlineData("")]
    public async Task GetCourseDetailsAsync_ReturnsNullWithoutQueryingForInvalidSlugs(string slug)
    {
        var service = new CourseCatalogService(repository);

        var course = await service.GetCourseDetailsAsync(slug, TestContext.Current.CancellationToken);

        Assert.Null(course);
        Assert.Equal(0, repository.FindCalls);
    }

    [Fact]
    public async Task GetCourseDetailsAsync_QueriesValidSlugs()
    {
        var service = new CourseCatalogService(repository);

        await service.GetCourseDetailsAsync("matematica-para-a-precisao", TestContext.Current.CancellationToken);

        Assert.Equal(1, repository.FindCalls);
    }

    private static CourseSummaryDto CreateSummary(int id) => new()
    {
        Id = id,
        Slug = $"curso-{id}",
        FullName = $"Curso {id}",
        ShortName = $"Curso {id}",
        Summary = "Resumo",
        Category = new CategoryDto(1, "matematica", "Matemática", "#FCD19C"),
        Modality = new ModalityDto("ead", "EAD"),
        Status = new StatusDto("inscricoes-abertas", "Inscrições abertas"),
        WorkloadHours = 20,
        ImageUrl = $"/images/courses/curso-{id}.webp",
        AvailableFrom = null,
        Featured = false,
    };

    private sealed class FakeCourseRepository : ICourseRepository
    {
        public IReadOnlyList<CourseSummaryDto> Courses { get; set; } = [];

        public CourseFilter? LastFilter { get; private set; }

        public int FindCalls { get; private set; }

        public Task<IReadOnlyList<CourseSummaryDto>> ListAsync(CourseFilter filter, CancellationToken cancellationToken)
        {
            LastFilter = filter;
            return Task.FromResult(Courses);
        }

        public Task<CourseDetailDto?> FindBySlugAsync(string slug, CancellationToken cancellationToken)
        {
            FindCalls++;
            return Task.FromResult<CourseDetailDto?>(null);
        }

        public Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<CategoryDto>>([]);

        public Task<IReadOnlyList<ModalityDto>> ListModalitiesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ModalityDto>>([]);

        public Task<IReadOnlyList<StatusDto>> ListStatusesAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<StatusDto>>([]);
    }
}
