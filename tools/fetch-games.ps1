<#
.SYNOPSIS
  Descarga los 10 juegos de GitHub (commits fijados en games.json), copia solo
  lo necesario a app\games\<id> y aplica los parches/traducciones.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\fetch-games.ps1
  powershell -ExecutionPolicy Bypass -File tools\fetch-games.ps1 -Only dino,piano
#>
param(
    [string[]]$Only = @()
)

$ErrorActionPreference = 'Stop'
$root      = Split-Path -Parent $PSScriptRoot
$toolsDir  = $PSScriptRoot
$cacheDir  = Join-Path $toolsDir '.cache\repos'
$gamesDir  = Join-Path $root 'app\games'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Read-Text([string]$path)  { [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8) }
function Write-Text([string]$path, [string]$text) { [System.IO.File]::WriteAllText($path, $text, $utf8NoBom) }

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') fallo (codigo $LASTEXITCODE)" }
}

# Deja en $dir el repo exactamente en $commit (descarga superficial, solo ese commit).
function Get-Repo($game) {
    $dir = Join-Path $cacheDir $game.id
    if (Test-Path (Join-Path $dir '.git')) {
        $head = (& git -C $dir rev-parse HEAD 2>$null)
        if ($head -eq $game.commit) { return $dir }
        Remove-Item -Recurse -Force $dir
    }
    New-Item -ItemType Directory -Force $dir | Out-Null
    Invoke-Git -C $dir init -q
    Invoke-Git -C $dir remote add origin "https://github.com/$($game.repo).git"
    Invoke-Git -C $dir fetch -q --depth 1 origin $game.commit
    Invoke-Git -C $dir checkout -q FETCH_HEAD
    return $dir
}

function Copy-Included($game, [string]$src, [string]$dest) {
    foreach ($item in $game.include) {
        $from = Join-Path $src $item
        if (-not (Test-Path $from)) { throw "[$($game.id)] no existe '$item' en el repo" }
        $to = Join-Path $dest $item
        New-Item -ItemType Directory -Force (Split-Path -Parent $to) | Out-Null
        Copy-Item -Recurse -Force $from $to
    }
}

function Apply-Translation($game, [string]$dest) {
    if (-not $game.translate) { return }
    $mapJson = Read-Text (Join-Path $toolsDir $game.translate.map) | ConvertFrom-Json
    # Primero las frases mas largas para no romper las que contienen a otras.
    $pairs = $mapJson.PSObject.Properties | Sort-Object { $_.Name.Length } -Descending
    foreach ($file in $game.translate.files) {
        $path = Join-Path $dest $file
        $text = Read-Text $path
        foreach ($p in $pairs) { $text = $text.Replace($p.Name, [string]$p.Value) }
        Write-Text $path $text
    }
}

function Apply-Patches($game, [string]$dest) {
    foreach ($p in $game.patches) {
        $path = Join-Path $dest $p.file
        $text = Read-Text $path
        $all  = [bool]$p.all
        if ($p.regex) {
            $re = New-Object System.Text.RegularExpressions.Regex($p.find)
            if (-not $re.IsMatch($text)) { throw "[$($game.id)] parche no encontrado en $($p.file): $($p.find)" }
            $repl = ([string]$p.replace).Replace('$', '$$')
            if ($all) { $text = $re.Replace($text, $repl) } else { $text = $re.Replace($text, $repl, 1) }
        } else {
            $idx = $text.IndexOf($p.find, [System.StringComparison]::Ordinal)
            if ($idx -lt 0) { throw "[$($game.id)] parche no encontrado en $($p.file): $($p.find)" }
            if ($all) {
                $text = $text.Replace($p.find, [string]$p.replace)
            } else {
                $text = $text.Substring(0, $idx) + $p.replace + $text.Substring($idx + $p.find.Length)
            }
        }
        Write-Text $path $text
    }
}

# Replica build.sh de Kiddo Paint: concatena js/<carpetas>/* en js/app.js.
function Build-KiddoPaint([string]$dest) {
    $jsDir = Join-Path $dest 'js'
    $order = 'init', 'util', 'tools', 'textures', 'submenus', 'brushes', 'builders', 'stamps', 'sounds'
    $sb = New-Object System.Text.StringBuilder
    foreach ($sub in $order) {
        $files = Get-ChildItem -File (Join-Path $jsDir $sub) | Sort-Object Name
        foreach ($f in $files) {
            [void]$sb.AppendLine("// ---- $sub/$($f.Name)")
            [void]$sb.AppendLine((Read-Text $f.FullName))
            [void]$sb.AppendLine(';')
        }
    }
    Get-ChildItem -Directory $jsDir | Remove-Item -Recurse -Force
    Write-Text (Join-Path $jsDir 'app.js') $sb.ToString()
}

# Enlaza en el HTML del juego los ajustes comunes y los propios del juego
# (app\shared\game-inject.css|.js y app\overrides\<id>.css|.js). Se enlazan desde el
# propio HTML para que se apliquen antes de que el juego calcule su tamaño.
function Add-HostHooks($game, [string]$dest) {
    $path = Join-Path $dest $game.entry
    $html = Read-Text $path
    $id = $game.id
    $css = "<link rel=`"stylesheet`" href=`"../../shared/game-inject.css`"><link rel=`"stylesheet`" href=`"../../overrides/$id.css`">"
    $js  = "<script src=`"../../shared/game-inject.js`"></script><script src=`"../../overrides/$id.js`"></script>"
    $h = $html.IndexOf('</head>', [System.StringComparison]::OrdinalIgnoreCase)
    if ($h -lt 0) { throw "[$id] no hay </head> en $($game.entry)" }
    $html = $html.Insert($h, $css)
    $b = $html.LastIndexOf('</body>', [System.StringComparison]::OrdinalIgnoreCase)
    if ($b -lt 0) { throw "[$id] no hay </body> en $($game.entry)" }
    $html = $html.Insert($b, $js)
    Write-Text $path $html
}

$manifest = Read-Text (Join-Path $toolsDir 'games.json') | ConvertFrom-Json
$games = $manifest.games
if ($Only.Count -gt 0) { $games = $games | Where-Object { $Only -contains $_.id } }

New-Item -ItemType Directory -Force $cacheDir, $gamesDir | Out-Null

foreach ($game in $games) {
    Write-Host "==> $($game.id)  ($($game.repo) @ $($game.commit.Substring(0,12)))" -ForegroundColor Cyan
    $src  = Get-Repo $game
    $dest = Join-Path $gamesDir $game.id
    if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
    New-Item -ItemType Directory -Force $dest | Out-Null

    Copy-Included $game $src $dest
    Apply-Translation $game $dest
    Apply-Patches $game $dest
    if ($game.build -eq 'kiddopaint') { Build-KiddoPaint $dest }
    Add-HostHooks $game $dest
}

# Creditos para la pantalla de "Creditos" del juego anfitrion.
$credits = $manifest.games | ForEach-Object {
    [ordered]@{ id = $_.id; repo = $_.repo; commit = $_.commit; license = $_.license }
}
Write-Text (Join-Path $gamesDir 'credits.json') (ConvertTo-Json @($credits) -Depth 3)

Write-Host "Listo: $(@($games).Count) juego(s) en $gamesDir" -ForegroundColor Green
