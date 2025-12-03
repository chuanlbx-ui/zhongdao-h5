#!/bin/bash

# 切换到项目目录
cd "$(dirname "$0")"
echo "当前目录: $(pwd)"

echo "正在清理现有的Node.js进程..."

# 清理可能占用5173端口的进程
if command -v netstat >/dev/null 2>&1; then
    PIDS=$(netstat -tlnp 2>/dev/null | grep :5173 | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$PIDS" ]; then
        echo "终止占用5173端口的进程: $PIDS"
        kill -9 $PIDS 2>/dev/null
    fi
fi

echo "等待端口释放..."
sleep 2

echo "启动前端开发服务器 (端口: 5173)..."
npm run dev