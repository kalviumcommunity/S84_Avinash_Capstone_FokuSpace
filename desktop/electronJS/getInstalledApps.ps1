$OutputEncoding = [System.Text.Encoding]::UTF8
$apps = @()

$registryPaths = @(
  "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

foreach ($path in $registryPaths) {
  Get-ItemProperty $path -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.DisplayName -and $_.DisplayIcon) {
      $iconPath = $_.DisplayIcon
      if ($iconPath -match ",\d+$") {
        $iconPath = $iconPath -replace ",\d+$", ""
      }

      # Try resolving the path (optional, fallback to original)
      try {
        $iconPath = (Resolve-Path $iconPath -ErrorAction Stop).Path
      }
      catch {
        # ignore, keep original
      }

      $apps += [PSCustomObject]@{
        Name = $_.DisplayName
        Path = $iconPath
      }
    }
  }
}

# Use Compress to make sure JSON is one line
$apps | ConvertTo-Json -Compress
