#!/usr/bin/env bash
# Gera entrega/sesi-catalogo-cursos-publicacao.zip com os arquivos de publicação (README §11):
#   site/      build do front-end publicado no Firebase Hosting (npm run build:firebase)
#   api/       API publicada (dotnet publish), a mesma que roda no contêiner do Cloud Run
#   migrador/  CourseCatalog.DbMigrator publicado (migrations, seed e permissões do banco)
#   banco/     setup.sql e o esquema em SQL (script idempotente das migrations)
#   config/    firebase.json, .firebaserc e Dockerfile
# Nenhum segredo vai no ZIP: as connection strings ficam no Secret Manager (produção) e no
# dotnet user-secrets (local).
#
# Uso, na raiz do repositório: ./scripts/gerar-zip-publicacao.sh
# Requer: Node 22.12+ (com npm install feito em frontend/) e o SDK do .NET 10.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="sesi-catalogo-cursos-publicacao"
OUT_DIR="$ROOT/entrega"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
PKG="$STAGE/$NAME"
mkdir -p "$PKG/site" "$PKG/api" "$PKG/migrador" "$PKG/banco" "$PKG/config"

echo "1/5 Build do site (modo firebase)"
npm --prefix "$ROOT/frontend" run build:firebase > /dev/null
cp -R "$ROOT/frontend/dist/." "$PKG/site/"

echo "2/5 API e migrador (dotnet publish)"
dotnet publish "$ROOT/backend/src/CourseCatalog.Api/CourseCatalog.Api.csproj" \
  --configuration Release --output "$PKG/api" -p:UseAppHost=false --nologo --verbosity quiet
dotnet publish "$ROOT/backend/src/CourseCatalog.DbMigrator/CourseCatalog.DbMigrator.csproj" \
  --configuration Release --output "$PKG/migrador" -p:UseAppHost=false --nologo --verbosity quiet

echo "3/5 Scripts do banco"
cp "$ROOT/backend/database/setup.sql" "$PKG/banco/"
(
  cd "$ROOT/backend"
  dotnet tool restore > /dev/null
  dotnet ef migrations script --idempotent \
    --project src/CourseCatalog.Infrastructure --startup-project src/CourseCatalog.DbMigrator \
    --output "$PKG/banco/migrations.sql" > /dev/null
)

echo "4/5 Configuração da publicação"
cp "$ROOT/firebase.json" "$ROOT/.firebaserc" "$ROOT/backend/Dockerfile" "$PKG/config/"
cp "$ROOT/scripts/LEIA-ME-publicacao.md" "$PKG/LEIA-ME.md"

echo "5/5 Compactando"
mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/$NAME.zip"
(cd "$STAGE" && zip -qrX "$OUT_DIR/$NAME.zip" "$NAME")
echo "Pronto: $OUT_DIR/$NAME.zip ($(du -h "$OUT_DIR/$NAME.zip" | cut -f1))"
