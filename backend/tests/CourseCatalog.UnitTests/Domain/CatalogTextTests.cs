using CourseCatalog.Domain.Courses;

namespace CourseCatalog.UnitTests.Domain;

public sealed class CatalogTextTests
{
    [Theory]
    [InlineData("Matemática", "matematica")]
    [InlineData("CIÊNCIA dos Materiais", "ciencia dos materiais")]
    [InlineData("Economia Circular na Indústria", "economia circular na industria")]
    [InlineData("  ação  ", "acao")]
    [InlineData("Comunicação Técnica", "comunicacao tecnica")]
    public void ToSearchKey_IgnoresAccentsCaseAndOuterSpaces(string value, string expected) =>
        Assert.Equal(expected, CatalogText.ToSearchKey(value));

    [Fact]
    public void ToSearchKey_MakesAccentedAndPlainTextEquivalent() =>
        Assert.Equal(CatalogText.ToSearchKey("estatística"), CatalogText.ToSearchKey("ESTATISTICA"));

    [Theory]
    [InlineData("fisica´", "fisica´")] // acento solto (não combinante) fica, como no front
    [InlineData("ſ", "ſ")] // "s longo" continua minúsculo (em maiúsculas viraria "S")
    public void ToSearchKey_RemovesOnlyCombiningMarks_LikeTheFrontEnd(string value, string expected) =>
        Assert.Equal(expected, CatalogText.ToSearchKey(value));

    [Theory]
    [InlineData("  ciência   dos \t materiais ", "ciência dos materiais")]
    [InlineData("metalurgia", "metalurgia")]
    [InlineData("   ", "")]
    [InlineData("\u00A0metal\u2003urgia\u3000", "metal urgia")]
    public void CollapseWhitespace_TrimsAndJoinsRepeatedSpaces(string value, string expected) =>
        Assert.Equal(expected, CatalogText.CollapseWhitespace(value));

    [Fact]
    public void CollapseWhitespace_UsesTheJavaScriptDefinitionOfSpace() =>
        // U+0085 é espaço para o .NET, mas não para o JavaScript do front: fica como está.
        Assert.Equal("\u0085metal", CatalogText.CollapseWhitespace("\u0085metal"));
}
