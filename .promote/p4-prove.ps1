# PHASE 4 — authoritative proof that every pre-LCGPA migration's effects are
# already present in the clone, using Prisma's own diff tooling rather than
# text parsing. READ ONLY.
#
#   clone     vs  git HEAD:prisma/schema.prisma   -> must be "No difference"
#   cleanroom vs  prisma/schema.prisma            -> must be "No difference"
#
# The clean room was built by `prisma migrate deploy` from empty, so the second
# check proves the chain reproduces the target schema. The first proves the
# clone already sits at exactly the pre-LCGPA point of that chain. Together they
# establish that the only outstanding work is the two new migrations.

$repo = "C:\Users\PC\Documents\Aqliya"
Set-Location $repo

if (-not (Test-Path "$repo\.promote\schema-head.prisma")) {
  git show HEAD:prisma/schema.prisma | Out-File -Encoding utf8 "$repo\.promote\schema-head.prisma"
}

Write-Host "== clone vs HEAD schema (pre-LCGPA target) =="
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya_promote_rehearsal?schema=public"
npx prisma migrate diff --from-config-datasource --to-schema "$repo\.promote\schema-head.prisma" --exit-code
Write-Host "   exit: $LASTEXITCODE  (0 = identical)"

Write-Host ""
Write-Host "== clean room vs current schema (post-LCGPA target) =="
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya_cleanroom?schema=public"
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
Write-Host "   exit: $LASTEXITCODE  (0 = identical)"
