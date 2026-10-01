<#
.SYNOPSIS
  Compila BabyGames para Android y genera dist\BabyGames.apk (firmada, lista para instalar).

.DESCRIPTION
  Usa el SDK de .NET (carga de trabajo "android"), el Android SDK y el JDK que instala Visual Studio.
  Se pueden usar otros con las variables de entorno ANDROID_HOME y JAVA_HOME.

  La primera vez crea la clave de firma en src\BabyGames.Android\signing\ (no se guarda en git).
  Guárdala bien: las actualizaciones de la app tienen que firmarse con la misma clave.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\build-android.ps1
  powershell -ExecutionPolicy Bypass -File tools\build-android.ps1 -Install   # además la instala y abre por adb
#>
param(
    [switch]$Fetch,
    [switch]$Install
)

$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$dist    = Join-Path $root 'dist'
$project = Join-Path $root 'src\BabyGames.Android\BabyGames.Android.csproj'
$signing = Join-Path $root 'src\BabyGames.Android\signing'
$appId   = 'com.babygames.app'

if ($Fetch -or -not (Test-Path (Join-Path $root 'app\games\credits.json'))) {
    & (Join-Path $PSScriptRoot 'fetch-games.ps1')
}

# ---- Herramientas -------------------------------------------------------------
$jdk = @($env:JAVA_HOME) +
    @(Get-ChildItem "$env:ProgramFiles\Android\openjdk", "$env:ProgramFiles\Microsoft" -Directory -Filter 'jdk-*' -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending | ForEach-Object { $_.FullName }) |
    Where-Object { $_ -and (Test-Path (Join-Path $_ 'bin\keytool.exe')) } | Select-Object -First 1
if (-not $jdk) {
    throw 'No se encuentra el JDK. Instala Visual Studio con "Desarrollo de .NET Multi-platform App UI" o define JAVA_HOME.'
}

$sdk = @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, "${env:ProgramFiles(x86)}\Android\android-sdk", "$env:LOCALAPPDATA\Android\Sdk") |
    Where-Object { $_ -and (Test-Path (Join-Path $_ 'platforms')) } | Select-Object -First 1
if (-not $sdk) {
    throw 'No se encuentra el Android SDK. Instala Visual Studio con "Desarrollo de .NET Multi-platform App UI" o define ANDROID_HOME.'
}

# La versión es la de BabyGames.exe; el número interno de Android sube con ella (1.2.3 -> 10203).
$csproj  = Join-Path $root 'src\BabyGames\BabyGames.csproj'
$version = ([xml](Get-Content $csproj)).Project.PropertyGroup.Version | Where-Object { $_ } | Select-Object -First 1
$v = [version]$version
$versionCode = $v.Major * 10000 + $v.Minor * 100 + [Math]::Max($v.Build, 0)

# ---- Clave de firma -------------------------------------------------------------
$keystore = Join-Path $signing 'babygames.keystore'
$passFile = Join-Path $signing 'password.txt'
if (-not (Test-Path $keystore)) {
    Write-Host '==> Creando la clave de firma (solo la primera vez)' -ForegroundColor Cyan
    New-Item -ItemType Directory -Force $signing | Out-Null
    $bytes = New-Object byte[] 18
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $pass = [Convert]::ToBase64String($bytes) -replace '[+/=]', 'x'
    [IO.File]::WriteAllText($passFile, $pass)
    & (Join-Path $jdk 'bin\keytool.exe') -genkeypair -noprompt -keystore $keystore -storetype PKCS12 -alias babygames `
        -keyalg RSA -keysize 2048 -validity 10000 -storepass $pass -keypass $pass -dname 'CN=BabyGames, O=BabyGames, C=ES'
    if ($LASTEXITCODE -ne 0) { throw 'keytool fallo' }
}

# ---- Compilar -------------------------------------------------------------------
Write-Host "==> Compilando BabyGames.apk $version" -ForegroundColor Cyan
$out = Join-Path $root 'src\BabyGames.Android\bin\publish'
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
# Sin APK anteriores: así siempre se vuelve a empaquetar y firmar.
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $root 'src\BabyGames.Android\bin\Release\net10.0-android\*.apk')
# apksigner no admite el mismo archivo para las dos contraseñas: van por una variable de entorno.
$env:BABYGAMES_SIGNING_PASS = (Get-Content $passFile -Raw).Trim()
& dotnet publish $project -c Release -f net10.0-android -o $out -nologo `
    "-p:AndroidSdkDirectory=$sdk" "-p:JavaSdkDirectory=$jdk" `
    "-p:ApplicationDisplayVersion=$version" "-p:ApplicationVersion=$versionCode" `
    -p:AndroidKeyStore=true "-p:AndroidSigningKeyStore=$keystore" -p:AndroidSigningKeyAlias=babygames `
    -p:AndroidSigningStorePass=env:BABYGAMES_SIGNING_PASS -p:AndroidSigningKeyPass=env:BABYGAMES_SIGNING_PASS
if ($LASTEXITCODE -ne 0) { throw 'dotnet publish fallo' }

$signed = Get-ChildItem $out -Filter '*-Signed.apk' | Select-Object -First 1
if (-not $signed) { throw "No se ha generado la APK firmada en $out" }

# Una APK mal firmada no se puede instalar: se comprueba antes de copiarla a dist\.
$apksigner = Get-ChildItem (Join-Path $sdk 'build-tools') -Directory | Sort-Object { [version]$_.Name } -Descending |
    ForEach-Object { Join-Path $_.FullName 'lib\apksigner.jar' } | Where-Object { Test-Path $_ } | Select-Object -First 1
& (Join-Path $jdk 'bin\java.exe') -jar $apksigner verify $signed.FullName
if ($LASTEXITCODE -ne 0) { throw 'La APK no está bien firmada' }

New-Item -ItemType Directory -Force $dist | Out-Null
$apk = Join-Path $dist 'BabyGames.apk'
Copy-Item $signed.FullName $apk -Force
Write-Host ('Listo: {0} ({1:N1} MB)' -f $apk, ((Get-Item $apk).Length / 1MB)) -ForegroundColor Green

if (-not $Install) { return }

# ---- Instalar en el emulador o en el dispositivo conectado (depuración USB) -----------
# Con varios conectados, elige uno con la variable ANDROID_SERIAL (ver "adb devices").
$adb = @((Join-Path $sdk 'platform-tools\adb.exe'), "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe") |
    Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $adb) { throw 'No se encuentra adb.exe (platform-tools del Android SDK).' }
Write-Host '==> Instalando en el dispositivo' -ForegroundColor Cyan
& $adb install -r $apk
if ($LASTEXITCODE -ne 0) { throw 'adb install fallo: ¿hay un emulador abierto o un dispositivo conectado con la depuración USB activada?' }
& $adb shell am start -n "$appId/$appId.MainActivity" | Out-Null
