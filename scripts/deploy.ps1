<#
.SYNOPSIS
  Deploys site/ to AWS S3 from Windows.

.DESCRIPTION
  Uses AWS CLI (must be installed and `aws configure` already run).
  Mirrors site/ to the S3 bucket with appropriate cache headers.

.EXAMPLE
  pwsh ./scripts/deploy.ps1
  pwsh ./scripts/deploy.ps1 -DryRun
#>

[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$Bucket = 'honeymoon-roma-paris-2026-863646532781'
$Region = 'ap-northeast-1'
$SiteDir = Join-Path $PSScriptRoot '..\site'

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI not found. Install from https://aws.amazon.com/cli/ and run 'aws configure'."
}

if (-not (Test-Path $SiteDir)) {
    throw "site/ directory not found at: $SiteDir"
}

$dryFlag = if ($DryRun) { '--dryrun' } else { '' }

Write-Host "==> Syncing HTML (no-cache) to s3://$Bucket/" -ForegroundColor Cyan
aws s3 sync $SiteDir "s3://$Bucket/" `
    --region $Region `
    --delete `
    --exclude "*" `
    --include "*.html" `
    --cache-control "no-cache, no-store, must-revalidate" `
    --content-type "text/html; charset=utf-8" `
    $dryFlag

Write-Host "==> Syncing static assets (1-day cache) to s3://$Bucket/" -ForegroundColor Cyan
aws s3 sync $SiteDir "s3://$Bucket/" `
    --region $Region `
    --exclude "*.html" `
    --exclude "*.md" `
    --exclude ".*" `
    --exclude "*/.*" `
    --cache-control "public, max-age=86400" `
    $dryFlag

Write-Host ""
Write-Host "Deployed: https://$Bucket.s3.$Region.amazonaws.com/index.html" -ForegroundColor Green
