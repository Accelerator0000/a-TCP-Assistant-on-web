$nodePath = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$serverDir = Join-Path $PSScriptRoot "server"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  水下机器人 - 通信中转服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "启动网页服务..." -ForegroundColor Yellow
Write-Host "浏览器打开: http://localhost:8080" -ForegroundColor Green
Write-Host ""

& $nodePath (Join-Path $serverDir "index.js")

Read-Host "`n按 Enter 退出"
