#Requires -Version 5.1
[CmdletBinding()]
param([switch]$DryRun, [switch]$InstallDailyTask, [string]$BrowserPath, [switch]$SetupBrowser, [string]$OutputJson, [switch]$UploadToDrive)
$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$dataPath = Join-Path $siteRoot 'data\site-rating.json'
$listingUrl = 'https://www.google.com/maps/search/Motive+Insurance+Solutions+Matteson/?hl=en'

function Test-RatingData($Data) {
    if ($null -eq $Data) { return $false }
    $numericTypes = @([int], [long], [double], [decimal], [single])
    if ($null -eq $Data.rating -or $null -eq $Data.reviewCount -or $Data.rating.GetType() -notin $numericTypes -or $Data.reviewCount.GetType() -notin $numericTypes) { return $false }
    $rating = [double]$Data.rating
    $count = [double]$Data.reviewCount
    return (-not [double]::IsNaN($rating) -and $rating -ge 1 -and $rating -le 5 -and $count -gt 0 -and $count -le 9007199254740991 -and [math]::Floor($count) -eq $count)
}
function Save-RatingData($Data, [string]$Path) {
    if (-not (Test-RatingData $Data)) { throw 'Invalid rating or review count; existing data was not changed.' }
    $Path = [IO.Path]::GetFullPath($Path)
    if (-not [IO.Directory]::Exists([IO.Path]::GetDirectoryName($Path))) { throw "JSON destination folder is unavailable: $Path" }
    $saved = [ordered]@{ rating = [double]$Data.rating; reviewCount = [long]$Data.reviewCount; source = 'Google reviews'; lastUpdated = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'); verified = $true }
    $temporaryPath = $Path + '.' + [guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($temporaryPath, (($saved | ConvertTo-Json) + "`n"), [Text.UTF8Encoding]::new($false))
        if ([IO.File]::Exists($Path)) { [IO.File]::Replace($temporaryPath, $Path, [NullString]::Value) }
        else { [IO.File]::Move($temporaryPath, $Path) }
    } finally { if ([IO.File]::Exists($temporaryPath)) { [IO.File]::Delete($temporaryPath) } }
    return $saved
}
function Send-BrowserCommand([string]$Method, [hashtable]$Parameters = @{}) {
    $script:commandId++
    $command = @{ id = $script:commandId; method = $Method; params = $Parameters } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($command)
    $cancellation = [Threading.CancellationTokenSource]::new(20000)
    try {
        $script:socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, $cancellation.Token).GetAwaiter().GetResult() | Out-Null
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
if ($MyInvocation.InvocationName -eq '.') { return }
if ($InstallDailyTask) {
    $taskName = 'Motive Insurance - Daily Google Rating'
    $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $PSCommandPath + '"'
    if ($BrowserPath) { $arguments += ' -BrowserPath "' + $BrowserPath + '"' }
    if ($UploadToDrive) { $arguments += ' -UploadToDrive' }
    if ($OutputJson) {
        if ($OutputJson.Contains('"')) { throw 'Invalid JSON path.' }
        $arguments += ' -OutputJson "' + [IO.Path]::GetFullPath($OutputJson) + '"'
    }
    $action = New-ScheduledTaskAction -Execute (Join-Path $PSHOME 'powershell.exe') -Argument $arguments -WorkingDirectory $siteRoot
    $trigger = New-ScheduledTaskTrigger -Daily -At '08:00'
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 15)
    $principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force -Description 'Scrape verified Motive Google rating daily and save site-rating.json to the configured destination.' | Out-Null
    Write-Output "Installed '$taskName' for 08:00 in the Windows system time zone, while this user is logged in."
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
    $hashAlgorithm = [Security.Cryptography.SHA256]::Create()
    try { $pathHash = [BitConverter]::ToString($hashAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($dataPath.ToLowerInvariant()))).Replace('-', '') }
    finally { $hashAlgorithm.Dispose() }
    $mutex = [Threading.Mutex]::new($false, ('Local\MotiveGoogleRating-' + $pathHash))
    try { $ownsMutex = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $ownsMutex = $true }
    if (-not $ownsMutex) { throw 'Another rating scrape is already running.' }
    if (-not $BrowserPath) {
        $candidates = @((Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'), (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'), (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'))
        $BrowserPath = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    }
    if (-not $BrowserPath -or -not (Test-Path -LiteralPath $BrowserPath -PathType Leaf)) { throw 'Chrome or Edge was not found. Supply -BrowserPath.' }
    # A dedicated profile retains the user's own Google sign-in. Never copy or read
    # credentials from their normal browser. Keep this profile outside the website.
    $profilePath = Join-Path $env:LOCALAPPDATA 'MotiveRating\Browser'
    [IO.Directory]::CreateDirectory($profilePath) | Out-Null
    # Chromium leaves this port file behind after shutdown. Remove only that file
    # so the new launch cannot accidentally connect to a stale port.
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    if (Test-Path -LiteralPath $portFile) { Remove-Item -LiteralPath $portFile -Force }
    $browserArguments = @('--no-first-run', '--no-default-browser-check', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', '--lang=en-US', '--window-size=1280,1000', ('--user-data-dir="' + $profilePath + '"'), 'about:blank')
    if ($SetupBrowser) {
        Write-Output 'Sign in to Google in the dedicated browser, then return to the Motive Maps listing. Waiting up to ten minutes for a verified rating and count.'
        $browser = Start-Process -FilePath $BrowserPath -ArgumentList $browserArguments -WindowStyle Normal -PassThru
    } else {
        # Use ordinary Chrome: Google's headless response omits review counts.
        # The scheduled task still starts it hidden and closes it after extraction.
        $browser = Start-Process -FilePath $BrowserPath -ArgumentList $browserArguments -WindowStyle Hidden -PassThru
    }
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    $startup = [Diagnostics.Stopwatch]::StartNew()
    $tab = $null
    while (-not $tab) {
        if ($browser.HasExited -or $startup.Elapsed.TotalSeconds -gt 30) { throw 'Rating browser did not become ready within 30 seconds.' }
        try {
            # Existence does not mean Chrome has finished writing/unlocked the file.
            $portLines = [IO.File]::ReadAllLines($portFile)
            $port = 0
            if ($portLines.Length -gt 0 -and [int]::TryParse($portLines[0], [ref]$port) -and $port -gt 0) {
                $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list" -TimeoutSec 2
                $tab = $tabs | Where-Object { $_.type -eq 'page' -and $_.webSocketDebuggerUrl } | Select-Object -First 1
            }
        } catch { $tab = $null }
        if ($tab) { break }
        Start-Sleep -Milliseconds 200
    }
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
    $loadTimeout = if ($SetupBrowser) { 600 } else { 60 }
    while ($loadTimer.Elapsed.TotalSeconds -lt $loadTimeout) {
        $evaluation = Send-BrowserCommand 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
        if ($evaluation.exceptionDetails) { throw 'The browser could not read the Google business information.' }
        $candidate = $evaluation.result.value
        if ($candidate.error -and -not $SetupBrowser) { throw $candidate.error }
        if (Test-RatingData $candidate) { $values = $candidate; break }
        if ($candidate.pending) { $pendingReason = $candidate.pending }
        Start-Sleep -Seconds 1
    }
    if (-not (Test-RatingData $values)) {
        throw "Scrape timed out: $pendingReason"
    }
    if ($DryRun) { $values | ConvertTo-Json }
    elseif ($OutputJson) {
        $saved = Save-RatingData $values $OutputJson
        # Keep the website checkout current as well as the Drive handoff file.
        if ([IO.Path]::GetFullPath($OutputJson) -ne $dataPath) {
            $null = Save-RatingData $values $dataPath
        }
        Write-Output ("Saved {0} from {1} Google reviews at {2} to {3}" -f $saved.rating, $saved.reviewCount, $saved.lastUpdated, $OutputJson)
    }
    else {
        $saved = Save-RatingData $values $dataPath
        Write-Output ("Saved {0:F1} from {1} Google reviews at {2} to {3}" -f $saved.rating, $saved.reviewCount, $saved.lastUpdated, $dataPath)
    }
    if ($UploadToDrive -and -not $DryRun) {
        & (Join-Path $PSHOME 'powershell.exe') -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $siteRoot 'upload-google-rating.ps1') -JsonPath $dataPath
        if ($LASTEXITCODE -ne 0) { throw 'Fresh local JSON was saved, but Google Drive upload did not complete.' }
    }
} catch {
    [Console]::Error.WriteLine('Google rating job failed. ' + $_.Exception.Message)
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
    # Retain only the dedicated browser profile so tomorrow's run can reuse sign-in.
    if ($ownsMutex) { $mutex.ReleaseMutex() }
    if ($mutex) { $mutex.Dispose() }
}
exit $exitCode
