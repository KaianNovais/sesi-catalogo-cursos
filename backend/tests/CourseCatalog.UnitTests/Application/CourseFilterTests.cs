using CourseCatalog.Application.Courses;

namespace CourseCatalog.UnitTests.Application;

public sealed class CourseFilterTests
{
    [Fact]
    public void Normalize_CollapsesSearchWhitespace()
    {
        var filter = new CourseFilter { Search = "  ciência   dos  materiais " }.Normalize();

        Assert.Equal("ciência dos materiais", filter.Search);
    }

    [Fact]
    public void Normalize_TurnsEmptyValuesIntoNoFilter()
    {
        var filter = new CourseFilter { Search = "   ", Category = "", Modality = "", Status = "" }.Normalize();

        Assert.Equal(new CourseFilter(), filter);
    }

    [Fact]
    public void Normalize_KeepsCodesExactlyAsReceived()
    {
        // Como no mock do front: um código diferente (ex.: com maiúscula) não corresponde a nada.
        var filter = new CourseFilter { Category = "Matematica", Modality = "ead", Status = "em-breve", Featured = true }.Normalize();

        Assert.Equal("Matematica", filter.Category);
        Assert.Equal("ead", filter.Modality);
        Assert.Equal("em-breve", filter.Status);
        Assert.True(filter.Featured);
    }
}
