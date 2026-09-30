<#
.SYNOPSIS
  Compila BabyGames.exe y genera en dist\:
    - BabyGames\                 (carpeta lista para usar)
    - BabyGames-portable.zip     (la misma carpeta comprimida)
    - BabyGames-Setup.exe        (instalador, si Inno Setup 6 está instalado)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\build.ps1
  powershell -ExecutionPolicy Bypass -File tools\build.ps1 -Fetch   # vuelve a descargar los juegos antes
#>
param(
    [switch]$Fetch,
    [switch]$SkipInstaller
)

$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$dist    = Join-Path $root 'dist'
$outDir  = Join-Path $dist 'BabyGames'
$project = Join-Path $root 'src\BabyGames\BabyGames.csproj'

if ($Fetch -or -not (Test-Path (Join-Path $root 'app\games\credits.json'))) {
    & (Join-Path $PSScriptRoot 'fetch-games.ps1')
}

Write-Host '==> Compilando BabyGames.exe' -ForegroundColor Cyan
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
& dotnet publish $project -c Release -o $outDir -nologo -p:DebugType=None -p:DebugSymbols=false
if ($LASTEXITCODE -ne 0) { throw 'dotnet publish fallo' }
# El control WPF de WebView2 no se usa (la app es WinForms).
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $outDir 'Microsoft.Web.WebView2.Wpf.dll')

Write-Host '==> Creando BabyGames-portable.zip' -ForegroundColor Cyan
$zip = Join-Path $dist 'BabyGames-portable.zip'
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path $outDir -DestinationPath $zip

if ($SkipInstaller) { return }

$iscc = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $iscc) {
    Write-Warning 'Inno Setup 6 no está instalado: se omite BabyGames-Setup.exe.'
    Write-Warning 'Instálalo con:  winget install JRSoftware.InnoSetup   y vuelve a ejecutar este script.'
    return
}

Write-Host '==> Creando BabyGames-Setup.exe' -ForegroundColor Cyan
$version = ([xml](Get-Content $project)).Project.PropertyGroup.Version | Where-Object { $_ } | Select-Object -First 1
& $iscc /Qp "/DAppVersion=$version" "/DSourceDir=$outDir" "/DOutputDir=$dist" (Join-Path $root 'installer\BabyGames.iss')
if ($LASTEXITCODE -ne 0) { throw 'Inno Setup fallo' }

Write-Host "Listo. Archivos en $dist" -ForegroundColor Green
