#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$InstallDailyTask,
    [string]$BrowserPath
)

$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$dataPath = Join-Path $siteRoot 'data\site-rating.json'
$listingUrl = 'https://www.google.com/maps/search/Motive+Insurance+Solutions+Matteson/?hl=en'

function Test-RatingData($Data) {
    if ($null -eq $Data) { return $false }
    $numericTypes = @([int], [long], [double], [decimal], [single])
    if ($null -eq $Data.rating -or $null -eq $Data.reviewCount -or
        $Data.rating.GetType() -notin $numericTypes -or
        $Data.reviewCount.GetType() -notin $numericTypes) { return $false }
    $rating = [double]$Data.rating
    $count = [double]$Data.reviewCount
    return (-not [double]::IsNaN($rating) -and $rating -ge 1 -and $rating -le 5 -and
        $count -gt 0 -and $count -le 9007199254740991 -and [math]::Floor($count) -eq $count)
}

function Save-RatingData($Data, [string]$Path) {
    if (-not (Test-RatingData $Data)) { throw 'Invalid rating or review count; existing data was not changed.' }
    $saved = [ordered]@{
        rating = [double]$Data.rating
        reviewCount = [long]$Data.reviewCount
        source = 'Google reviews'
        lastUpdated = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
    }
    $temporaryPath = $Path + '.' + [guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($temporaryPath, (($saved | ConvertTo-Json) + "`n"), [Text.UTF8Encoding]::new($false))
        # The temporary file is on the same volume; readers see either complete version.
        if ([IO.File]::Exists($Path)) { [IO.File]::Replace($temporaryPath, $Path, [NullString]::Value) }
        else { [IO.File]::Move($temporaryPath, $Path) }
    } finally {
        if ([IO.File]::Exists($temporaryPath)) { [IO.File]::Delete($temporaryPath) }
    }
    return $saved
}

function Send-BrowserCommand([string]$Method, [hashtable]$Parameters = @{}) {
    $script:commandId++
    $command = @{ id = $script:commandId; method = $Method; params = $Parameters } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($command)
    $cancellation = [Threading.CancellationTokenSource]::new(20000)
    try {
        $script:socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text,
            $true, $cancellation.Token).GetAwaiter().GetResult() | Out-Null
        do {
            $message = [IO.MemoryStream]::new()
            try {
                do {
                    $buffer = [byte[]]::new(65536)
                    $received = $script:socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cancellation.Token).GetAwaiter().GetResult()
                    if ($received.MessageType -eq [Net.WebSockets.WebSocketMessageType]::Close) { throw 'Browser connection closed.' }
                    $message.Write($buffer, 0, $received.Count)
                } until ($received.EndOfMessage)
                $reply = [Text.Encoding]::UTF8.GetString($message.ToArray()) | ConvertFrom-Json
            } finally { $message.Dispose() }
        } until ($reply.id -eq $script:commandId)
        if ($reply.error) { throw ($reply.error | ConvertTo-Json -Compress) }
        return $reply.result
    } finally { $cancellation.Dispose() }
}

# Dot-sourcing loads helpers for the focused checks without starting a scrape.
if ($MyInvocation.InvocationName -eq '.') { return }

if ($InstallDailyTask) {
    $taskName = 'Motive Insurance - Daily Google Rating'
    $scriptPath = Join-Path $siteRoot 'scrape-google-reviews.ps1'
    $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $scriptPath + '"'
    if ($BrowserPath) { $arguments += ' -BrowserPath "' + $BrowserPath + '"' }
    $action = New-ScheduledTaskAction -Execute (Join-Path $PSHOME 'powershell.exe') -Argument $arguments -WorkingDirectory $siteRoot
    $trigger = New-ScheduledTaskTrigger -Daily -At '06:00'
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
    $principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
        -Description ('Refresh only data/site-rating.json in ' + $siteRoot + ' from the public Google listing once daily.') | Out-Null
    Write-Output "Installed '$taskName' for 06:00 in the Windows system time zone, while this user is logged in."
    exit 0
}

$browser = $null
$script:socket = $null
$profilePath = $null
$script:commandId = 0
$exitCode = 0
$mutex = $null
$ownsMutex = $false
try {
    # Prevent a manual run from overlapping the scheduled scrape of the same file.
    $hashAlgorithm = [Security.Cryptography.SHA256]::Create()
    try { $pathHash = [BitConverter]::ToString($hashAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($dataPath.ToLowerInvariant()))).Replace('-', '') }
    finally { $hashAlgorithm.Dispose() }
    $mutex = [Threading.Mutex]::new($false, ('Local\MotiveGoogleRating-' + $pathHash))
    try { $ownsMutex = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $ownsMutex = $true }
    if (-not $ownsMutex) { throw 'Another rating scrape is already running.' }

    if (-not $BrowserPath) {
        $candidates = @(
            (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
            (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
            (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
        )
        $BrowserPath = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    }
    if (-not $BrowserPath -or -not (Test-Path -LiteralPath $BrowserPath -PathType Leaf)) { throw 'Chrome or Edge was not found. Supply -BrowserPath.' }
    $profilePath = Join-Path ([IO.Path]::GetTempPath()) ('motive-google-rating-' + [guid]::NewGuid().ToString('N'))
    [IO.Directory]::CreateDirectory($profilePath) | Out-Null
    $browserArguments = @('--headless', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', '--lang=en-US', '--window-size=1280,1000',
        ('--user-data-dir="' + $profilePath + '"'), 'about:blank')
    $browser = Start-Process -FilePath $BrowserPath -ArgumentList $browserArguments -WindowStyle Hidden -PassThru
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    $startup = [Diagnostics.Stopwatch]::StartNew()
    while (-not (Test-Path -LiteralPath $portFile)) {
        if ($browser.HasExited -or $startup.Elapsed.TotalSeconds -gt 20) { throw 'Headless browser did not start.' }
        Start-Sleep -Milliseconds 200
    }
    $port = [int](Get-Content -LiteralPath $portFile -TotalCount 1)
    # Loopback browser control only. No Google API, keys, or business-data endpoints.
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list" -TimeoutSec 10
    $tab = $tabs | Where-Object type -EQ 'page' | Select-Object -First 1
    $script:socket = [Net.WebSockets.ClientWebSocket]::new()
    $connectionTimeout = [Threading.CancellationTokenSource]::new(10000)
    try { $script:socket.ConnectAsync([Uri]$tab.webSocketDebuggerUrl, $connectionTimeout.Token).GetAwaiter().GetResult() | Out-Null }
    finally { $connectionTimeout.Dispose() }
    $navigation = Send-BrowserCommand 'Page.navigate' @{ url = $listingUrl }
    if ($navigation.errorText) { throw "Google navigation failed: $($navigation.errorText)" }
    $extractor = [IO.File]::ReadAllText((Join-Path $siteRoot 'google-rating-extract.js'))
    $expression = $extractor + "`nreadMotiveGoogleRating();"
    $loadTimer = [Diagnostics.Stopwatch]::StartNew()
    $values = $null
    $pendingReason = 'Google business information did not appear.'
    while ($loadTimer.Elapsed.TotalSeconds -lt 60) {
        $evaluation = Send-BrowserCommand 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
        if ($evaluation.exceptionDetails) { throw 'The browser could not read the Google business information.' }
        $candidate = $evaluation.result.value
        if ($candidate.error) { throw $candidate.error }
        if (Test-RatingData $candidate) { $values = $candidate; break }
        if ($candidate.pending) { $pendingReason = $candidate.pending }
        Start-Sleep -Seconds 1
    }
    if (-not (Test-RatingData $values)) { throw "Scrape timed out: $pendingReason" }
    if ($DryRun) { $values | ConvertTo-Json }
    else {
        $saved = Save-RatingData $values $dataPath
        Write-Output ("Saved {0:F1} from {1} Google reviews at {2} to {3}" -f $saved.rating, $saved.reviewCount, $saved.lastUpdated, $dataPath)
    }
} catch {
    [Console]::Error.WriteLine('Google rating scrape failed; previous saved values preserved. ' + $_.Exception.Message)
    $exitCode = 1
} finally {
    if ($script:socket) {
        try { Send-BrowserCommand 'Browser.close' | Out-Null } catch { }
        $script:socket.Dispose()
    }
    if ($browser) {
        if (-not $browser.WaitForExit(5000)) { Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue }
        $browser.Dispose()
    }
    if ($profilePath) {
        # Verify the exact temporary profile target before recursive cleanup.
        $temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
        $resolvedProfile = [IO.Path]::GetFullPath($profilePath)
        if ($resolvedProfile.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase) -and
            [IO.Path]::GetFileName($resolvedProfile) -match '^motive-google-rating-[a-f0-9]{32}$') {
            Remove-Item -LiteralPath $resolvedProfile -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    if ($ownsMutex) { $mutex.ReleaseMutex() }
    if ($mutex) { $mutex.Dispose() }
}
exit $exitCode
