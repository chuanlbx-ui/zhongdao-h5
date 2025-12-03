@echo off
cd /d "D:\wwwroot\zhongdao-h5"
echo 当前目录: %CD%
echo 正在清理现有的Node.js进程...

rem 清理可能占用5173端口的进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo 终止进程 %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 等待端口释放...
timeout /t 2 /nobreak >nul

echo 启动前端开发服务器 (端口: 5173)...
npm run dev

pause