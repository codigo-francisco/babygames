<#
.SYNOPSIS
  Genera src\BabyGames\app.ico (la cara de Bubu, igual que app\img\icon.svg)
  dibujándolo con System.Drawing en varias tallas, y los iconos de Android en
  src\BabyGames.Android\Resources\mipmap-*.
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ico  = Join-Path $root 'src\BabyGames\app.ico'
Add-Type -AssemblyName System.Drawing

function New-Color([string]$hex, [int]$alpha = 255) {
    $c = [System.Drawing.ColorTranslator]::FromHtml($hex)
    [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
}

# Dibuja el icono en un lienzo de 200x200 unidades (las del SVG) escalado a $size.
# -Foreground: solo Bubu, sin fondo y centrado en la zona segura del icono adaptativo de Android.
function New-IconBitmap([int]$size, [switch]$Foreground) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.ScaleTransform($size / 200.0, $size / 200.0)

    if ($Foreground) {
        $g.TranslateTransform(100, 100); $g.ScaleTransform(0.74, 0.74); $g.TranslateTransform(-100, -108)
    } else {
        # Fondo: cuadrado redondeado azul cielo.
        $bg = New-Object System.Drawing.Drawing2D.GraphicsPath
        $r = 88
        $bg.AddArc(4, 4, $r, $r, 180, 90); $bg.AddArc(196 - $r, 4, $r, $r, 270, 90)
        $bg.AddArc(196 - $r, 196 - $r, $r, $r, 0, 90); $bg.AddArc(4, 196 - $r, $r, $r, 90, 90)
        $bg.CloseFigure()
        $g.FillPath((New-Object System.Drawing.SolidBrush (New-Color '#6ec3ff')), $bg)
    }

    # Cuerpo con degradado radial amarillo.
    $body = New-Object System.Drawing.Drawing2D.GraphicsPath
    $body.AddEllipse(22, 30, 156, 156)
    $grad = New-Object System.Drawing.Drawing2D.PathGradientBrush $body
    $grad.CenterPoint = New-Object System.Drawing.PointF 80, 80
    $grad.CenterColor = New-Color '#fff59d'
    $grad.SurroundColors = @(New-Color '#ffb300')
    $g.FillPath($grad, $body)
    $g.DrawEllipse((New-Object System.Drawing.Pen (New-Color '#f9a825'), 5), 22, 30, 156, 156)

    # Mofletes, ojos y boca.
    $cheek = New-Object System.Drawing.SolidBrush (New-Color '#ff8a80' 205)
    $g.FillEllipse($cheek, 37, 116, 30, 20); $g.FillEllipse($cheek, 133, 116, 30, 20)
    $white = [System.Drawing.Brushes]::White
    $ink = New-Object System.Drawing.SolidBrush (New-Color '#2b2d42')
    foreach ($x in 74, 126) {
        $g.FillEllipse($white, $x - 16, 76, 32, 40)
        $g.FillEllipse($ink, $x - 7, 90, 20, 20)
        $g.FillEllipse($white, $x + 3, 92, 8, 8)
    }
    $mouth = New-Object System.Drawing.Drawing2D.GraphicsPath
    $mouth.AddBezier(74, 134, 87, 155, 113, 155, 126, 134)
    $mouth.CloseFigure()
    $g.FillPath((New-Object System.Drawing.SolidBrush (New-Color '#ff5277')), $mouth)
    $pen = New-Object System.Drawing.Pen (New-Color '#2b2d42'), 6
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($pen, $mouth)

    $g.Dispose()
    return $bmp
}

$sizes = 16, 24, 32, 48, 64, 128, 256
$pngs = foreach ($s in $sizes) {
    $bmp = New-IconBitmap $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    if ($s -eq 256) { $bmp.Save((Join-Path ([System.IO.Path]::GetTempPath()) 'babygames-icon-256.png')) }
    $bmp.Dispose()
    , $ms.ToArray()
}

# Formato ICO: cabecera + una entrada por talla + las imágenes PNG.
$out = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $out
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]; $len = $pngs[$i].Length
    $dim = if ($s -ge 256) { 0 } else { $s }
    $w.Write([byte]$dim); $w.Write([byte]$dim); $w.Write([byte]0); $w.Write([byte]0)
    $w.Write([UInt16]1); $w.Write([UInt16]32); $w.Write([UInt32]$len); $w.Write([UInt32]$offset)
    $offset += $len
}
foreach ($p in $pngs) { $w.Write($p) }
$w.Flush()
New-Item -ItemType Directory -Force (Split-Path -Parent $ico) | Out-Null
[System.IO.File]::WriteAllBytes($ico, $out.ToArray())
Write-Host "Icono creado: $ico"

# Android: icono clásico (48 dp) y capa delantera del icono adaptativo (108 dp) por densidad.
$res = Join-Path $root 'src\BabyGames.Android\Resources'
$densities = [ordered]@{ mdpi = 1.0; hdpi = 1.5; xhdpi = 2.0; xxhdpi = 3.0; xxxhdpi = 4.0 }
foreach ($d in $densities.Keys) {
    $dir = Join-Path $res "mipmap-$d"
    New-Item -ItemType Directory -Force $dir | Out-Null
    $bmp = New-IconBitmap ([int](48 * $densities[$d]))
    $bmp.Save((Join-Path $dir 'ic_launcher.png'), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
    $bmp = New-IconBitmap ([int](108 * $densities[$d])) -Foreground
    $bmp.Save((Join-Path $dir 'ic_launcher_foreground.png'), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
Write-Host "Iconos de Android creados en: $res"
