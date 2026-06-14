$serverDir = Join-Path $PSScriptRoot "server"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  水下机器人 - 通信中转服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 查找 Node.js
$nodePaths = @(
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"),
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    (Join-Path $env:LOCALAPPDATA "Programs\nodejs\node.exe"),
    "node"
)

$node = $null
foreach ($p in $nodePaths) {
    if (Test-Path $p -ErrorAction SilentlyContinue) {
        $node = $p
        break
    }
    try {
        $ver = & $p --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $node = $p
            break
        }
    } catch {}
}

if (-not $node) {
    Write-Host "错误: 找不到 Node.js！" -ForegroundColor Red
    Write-Host "请从 https://nodejs.org 安装" -ForegroundColor Yellow
    Read-Host "`n按 Enter 退出"
    exit 1
}

Write-Host "Node.js: $node" -ForegroundColor Gray
Write-Host "启动网页服务..." -ForegroundColor Yellow
Write-Host "浏览器打开: http://localhost:8080" -ForegroundColor Green
Write-Host ""

try {
    & $node (Join-Path $serverDir "index.js")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n服务异常退出，退出码: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "`n启动失败: $_" -ForegroundColor Red
}

Read-Host "`n按 Enter 退出"
