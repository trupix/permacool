Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$brandDir = Join-Path $root "public\images\brand"
$logoPath = Join-Path $brandDir "perma-cool.png"
$wordmarkPath = Join-Path $brandDir "perma-cool-wordmark.png"
$heroPath = Join-Path $root "public\images\generated\ethanol-systems-hero.png"

function Save-Png($bitmap, $path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$logo = [System.Drawing.Image]::FromFile($logoPath)
$wordmark = [System.Drawing.Image]::FromFile($wordmarkPath)
$hero = [System.Drawing.Image]::FromFile($heroPath)

try {
  $favicon = New-Object System.Drawing.Bitmap 64, 64
  $favicon.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($favicon)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($logo, 0, 0, 64, 64)
  Save-Png $favicon (Join-Path $root "public\favicon-64x64.png")
  $icon = [System.Drawing.Icon]::FromHandle($favicon.GetHicon())
  $stream = [System.IO.File]::Create((Join-Path $root "public\favicon.ico"))
  $icon.Save($stream)
  $stream.Dispose()
  $icon.Dispose()
  $graphics.Dispose()
  $favicon.Dispose()

  $apple = New-Object System.Drawing.Bitmap 180, 180
  $apple.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($apple)
  $graphics.Clear([System.Drawing.Color]::FromArgb(15, 21, 24))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($logo, 16, 16, 148, 148)
  Save-Png $apple (Join-Path $root "public\apple-touch-icon.png")
  $graphics.Dispose()
  $apple.Dispose()

  $card = New-Object System.Drawing.Bitmap 1200, 630
  $card.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($card)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(13, 19, 22))

  $source = New-Object System.Drawing.Rectangle 380, 0, 1292, 941
  $destination = New-Object System.Drawing.Rectangle 465, 0, 735, 630
  $graphics.DrawImage($hero, $destination, $source, [System.Drawing.GraphicsUnit]::Pixel)

  $overlayRect = New-Object System.Drawing.Rectangle 0, 0, 920, 630
  $overlay = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $overlayRect,
    [System.Drawing.Color]::FromArgb(255, 13, 19, 22),
    [System.Drawing.Color]::FromArgb(0, 13, 19, 22),
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
  )
  $graphics.FillRectangle($overlay, $overlayRect)

  $graphics.DrawImage($logo, 70, 64, 82, 82)
  $graphics.DrawImage($wordmark, 170, 84, 360, 38)

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(205, 216, 222))
  $cyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0, 207, 232))
  $titleFont = New-Object System.Drawing.Font("Arial", 44, [System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
  $urlFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)

  $graphics.DrawString("Industrial Extraction`nCooling Systems", $titleFont, $white, 70, 215)
  $graphics.DrawString("Ethanol chillers and butane recovery`nsystems built for commercial production.", $bodyFont, $muted, 72, 365)
  $graphics.FillRectangle($cyan, 72, 505, 52, 4)
  $graphics.DrawString("PERMA.COOL", $urlFont, $white, 72, 530)

  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq "image/jpeg"
  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]90)
  $card.Save((Join-Path $brandDir "permacool-social-card.jpg"), $jpegCodec, $parameters)

  $parameters.Dispose()
  $titleFont.Dispose()
  $bodyFont.Dispose()
  $urlFont.Dispose()
  $white.Dispose()
  $muted.Dispose()
  $cyan.Dispose()
  $overlay.Dispose()
  $graphics.Dispose()
  $card.Dispose()
}
finally {
  $logo.Dispose()
  $wordmark.Dispose()
  $hero.Dispose()
}
