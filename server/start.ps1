$nodePath = "C:\Users\shejiahan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$npmPath = "C:\Users\shejiahan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\npm.cmd"

Write-Host "[安装依赖] 请稍候..." -ForegroundColor Cyan
& $npmPath install

Write-Host "[启动] Node.js 中转服务" -ForegroundColor Green
& $nodePath index.js

Read-Host "按 Enter 退出"
