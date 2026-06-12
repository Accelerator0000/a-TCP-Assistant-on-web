# 水下机器人 - 上传到 GitHub 脚本
# 运行前请确保已安装 Git

# 1. 解决目录所有权问题（如遇报错）
git config --global --add safe.directory "C:\Users\shejiahan\Desktop\嵌赛"

# 2. 设置 Git 用户信息（如未配置过）
git config user.name "shejiahan"
git config user.email "shejiahan@example.com"

# 3. 初始化仓库（如未初始化）
if (-not (Test-Path ".git")) {
    git init
}

# 4. 添加所有文件
git add -A

# 5. 提交
git commit -m "🎉 初始化：水下机器人 PC 端通信与监控系统"

# 6. 设置远程仓库
git remote remove origin 2>
git remote add origin https://github.com/Accelerator0000/a-TCP-Assistant-on-web.git

# 7. 切换到 main 分支
git branch -M main

# 8. 拉取远程内容并合并（如远程已有文件）
git pull origin main --rebase --allow-unrelated-histories

# 9. 推送到 GitHub
git push -u origin main

Write-Host "
✅ 推送完成！" -ForegroundColor Green
