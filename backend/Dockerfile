# Imagem da API para o Google Cloud Run (README §11). Contexto de build: a pasta backend/.
#   gcloud builds submit backend --tag southamerica-east1-docker.pkg.dev/<projeto>/course-catalog/api:<versão>

# ---------- Build: SDK fixo na versão do global.json ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0.402-noble AS build
WORKDIR /src

# Restauração numa camada própria e travada pelos packages.lock.json: falha se uma dependência mudar.
COPY global.json NuGet.config Directory.Build.props Directory.Packages.props .editorconfig ./
COPY src/CourseCatalog.Domain/CourseCatalog.Domain.csproj src/CourseCatalog.Domain/packages.lock.json src/CourseCatalog.Domain/
COPY src/CourseCatalog.Application/CourseCatalog.Application.csproj src/CourseCatalog.Application/packages.lock.json src/CourseCatalog.Application/
COPY src/CourseCatalog.Infrastructure/CourseCatalog.Infrastructure.csproj src/CourseCatalog.Infrastructure/packages.lock.json src/CourseCatalog.Infrastructure/
COPY src/CourseCatalog.Api/CourseCatalog.Api.csproj src/CourseCatalog.Api/packages.lock.json src/CourseCatalog.Api/
RUN dotnet restore src/CourseCatalog.Api/CourseCatalog.Api.csproj --locked-mode

COPY src/ src/
RUN dotnet publish src/CourseCatalog.Api/CourseCatalog.Api.csproj \
    --configuration Release --no-restore --output /app /p:UseAppHost=false

# ---------- Execução ----------
# Imagem "chiseled": sem shell nem gerenciador de pacotes e com usuário sem privilégios. A variante
# "extra" traz o ICU, usado pela normalização Unicode da busca (string.Normalize).
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled-extra
WORKDIR /app
COPY --from=build /app ./
# Sem a porta de diagnóstico do runtime (depurador e coleta de perfis) em produção.
ENV DOTNET_EnableDiagnostics=0
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "CourseCatalog.Api.dll"]
