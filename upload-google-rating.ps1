#Requires -Version 5.1
[CmdletBinding()]
param([string]$JsonPath = (Join-Path $PSScriptRoot 'data\site-rating.json'))
$ErrorActionPreference = 'Stop'
$uploaderRoot = Join-Path $env:LOCALAPPDATA 'MotiveRating\Uploader'
$rclone = Join-Path $uploaderRoot 'rclone-v1.75.2-windows-amd64\rclone.exe'
$config = Join-Path $uploaderRoot 'rclone.conf'
$log = Join-Path $uploaderRoot 'upload.log'
try {
    if (-not (Test-Path -LiteralPath $rclone)) { throw 'Portable uploader is missing.' }
    if (-not (Test-Path -LiteralPath $config)) { throw 'Google Drive authorization is not configured.' }
    $data = Get-Content -LiteralPath $JsonPath -Raw | ConvertFrom-Json
    if ($data.verified -ne $true -or $data.rating -isnot [ValueType] -or
        $data.rating -lt 1 -or $data.rating -gt 5 -or
        $data.reviewCount -isnot [ValueType] -or $data.reviewCount -le 0 -or
        [math]::Floor($data.reviewCount) -ne $data.reviewCount) { throw 'Invalid rating JSON; upload canceled.' }
    # One exact file in the user-selected folder. No sync/delete operations.
    & $rclone copyto $JsonPath 'motive-site-data:site-rating.json' --config $config --drive-root-folder-id '1efH36RWrBf2RmnrTv1wVWTH7AXD_5Plk' --retries 3 --low-level-retries 3 --contimeout 20s --timeout 45s --log-file $log --log-level INFO
    if ($LASTEXITCODE -ne 0) { throw "Drive upload failed; see $log" }
    $remoteText = & $rclone cat 'motive-site-data:site-rating.json' --config $config --drive-root-folder-id '1efH36RWrBf2RmnrTv1wVWTH7AXD_5Plk' --contimeout 20s --timeout 45s
    if ($LASTEXITCODE -ne 0) { throw 'Drive upload readback failed.' }
    $remote = ($remoteText -join "`n") | ConvertFrom-Json
    if ($remote.rating -ne $data.rating -or $remote.reviewCount -ne $data.reviewCount -or $remote.lastUpdated -ne $data.lastUpdated -or $remote.verified -ne $true) { throw 'Drive readback does not match the local JSON.' }
    Write-Output "Verified site-rating.json in Google Drive: $($remote.rating) stars, $($remote.reviewCount) reviews."
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
exit 0
