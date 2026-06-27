$text = Get-Content "docs\Ficha site\app.js" -Raw; $openCount = ($text -split "\{").Count - 1; $closeCount = ($text -split "\}").Count - 1; Write-Host "Open: $openCount, Close: $closeCount"
