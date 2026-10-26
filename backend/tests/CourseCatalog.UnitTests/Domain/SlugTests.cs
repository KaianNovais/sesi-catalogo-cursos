using CourseCatalog.Domain.Courses;

namespace CourseCatalog.UnitTests.Domain;

public sealed class SlugTests
{
    [Theory]
    [InlineData("matematica-para-a-precisao")]
    [InlineData("ead")]
    [InlineData("curso-2026")]
    public void IsValid_AcceptsKebabCase(string value) => Assert.True(Slug.IsValid(value));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("Matematica")]
    [InlineData("-matematica")]
    [InlineData("matematica-")]
    [InlineData("mate--matica")]
    [InlineData("matemática")]
    [InlineData("mate_matica")]
    [InlineData("../etc/passwd")]
    [InlineData("<script>")]
    public void IsValid_RejectsAnythingElse(string? value) => Assert.False(Slug.IsValid(value));

    [Fact]
    public void IsValid_RejectsSlugsLongerThanTheLimit()
    {
        Assert.True(Slug.IsValid(new string('a', Slug.MaxLength)));
        Assert.False(Slug.IsValid(new string('a', Slug.MaxLength + 1)));
    }
}
