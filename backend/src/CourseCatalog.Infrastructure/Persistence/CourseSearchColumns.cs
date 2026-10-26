namespace CourseCatalog.Infrastructure.Persistence;

/// <summary>
/// Colunas internas da busca (propriedades "sombra" do EF, fora do domínio): os nomes do curso já
/// normalizados por <c>CatalogText.ToSearchKey</c>. Quem grava é o seed; a API só compara.
/// </summary>
internal static class CourseSearchColumns
{
    public const string FullName = "FullNameSearchKey";

    public const string ShortName = "ShortNameSearchKey";
}
