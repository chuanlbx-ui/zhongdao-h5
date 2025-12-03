#!/bin/bash

# 中道商城H5前端自动同步脚本
# 同步服务器端代码与GitHub仓库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# 配置
PROJECT_NAME="中道商城H5前端"
# 自动检测项目路径，如果脚本在项目目录内运行则使用当前目录
if [[ -f "package.json" && -d "src" && -f "vite.config.ts" ]]; then
    PROJECT_PATH="$(pwd)"
else
    PROJECT_PATH="/d/wwwroot/zhongdao-H5"
fi
GITHUB_REPO="https://github.com/chuanlbx-ui/zhongdao-mall-h5.git"
BRANCH="main"
BUILD_DIR="dist"
VERCEL_PROJECT_ID=""

# 检查Git仓库状态
check_git_status() {
    log "检查Git仓库状态..."

    cd "$PROJECT_PATH"

    if [ ! -d ".git" ]; then
        log_warning "Git仓库未初始化，开始初始化..."
        git init
        git remote add origin "$GITHUB_REPO"
        git branch -M main
        log_success "Git仓库初始化完成"
    else
        log_success "Git仓库已存在"
    fi

    # 检查远程仓库地址
    local current_remote=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ -z "$current_remote" ]]; then
        log_warning "远程仓库origin不存在，添加中..."
        git remote add origin "$GITHUB_REPO"
        log_success "远程仓库origin已添加"
    elif [[ "$current_remote" != "$GITHUB_REPO" ]]; then
        log_warning "远程仓库地址不匹配，更新中..."
        git remote set-url origin "$GITHUB_REPO"
        log_success "远程仓库地址已更新"
    fi
}

# 检查本地更改
check_local_changes() {
    cd "$PROJECT_PATH"

    local has_changes=$(git status --porcelain 2>/dev/null | wc -l)
    if [ "$has_changes" -gt 0 ]; then
        log_warning "发现本地更改，准备提交..."
        return 0
    else
        log_success "没有本地更改"
        return 1
    fi
}

# 提交本地更改
commit_local_changes() {
    cd "$PROJECT_PATH"

    log "添加文件到暂存区..."
    git add .

    log "创建提交..."
    git commit -m "chore: 自动同步H5前端服务器端更改

🔄 H5前端同步内容
- 移动端UI组件优化
- API接口集成更新
- 环境配置调整
- 构建配置优化
- 性能优化改进
- 移动端适配修复

同步时间: $(date)
服务器: $(hostname)

📱 移动端特性
- 响应式设计优化
- 触摸交互体验
- 离线数据支持
- 微信小程序准备
- 推送通知集成

🤖 Generated with Auto Sync Script

Co-Authored-By: AutoSync <noreply@system>"

    if [ $? -eq 0 ]; then
        log_success "本地更改提交成功"
        return 0
    else
        log_error "本地更改提交失败"
        return 1
    fi
}

# 拉取远程更新
pull_remote_changes() {
    cd "$PROJECT_PATH"

    log "从远程仓库拉取最新更改..."

    # 先获取远程信息
    git fetch origin

    # 检查是否有新提交
    local local_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    local remote_commit=$(git rev-parse origin/$BRANCH 2>/dev/null || echo "")

    if [[ "$local_commit" == "$remote_commit" ]]; then
        log_success "本地已是最新版本，无需拉取"
        return 0
    fi

    log "发现远程更新，开始拉取..."

    # 拉取更改
    if git pull origin $BRANCH; then
        log_success "远程更改拉取成功"

        # 检查是否有提交历史来进行差异比较
        local has_prev_commit=$(git rev-parse HEAD~1 2>/dev/null || echo "")

        if [ -n "$has_prev_commit" ]; then
            # 检查是否需要重新安装依赖
            if [ -n "$(git diff HEAD~1 HEAD --name-only package.json package-lock.json 2>/dev/null)" ]; then
                log "检测到依赖文件更改，重新安装依赖..."
                npm install
                log_success "依赖重新安装完成"
            fi

            # 检查是否需要重新构建
            if [ -n "$(git diff HEAD~1 HEAD --name-only src/ vite.config.ts tsconfig.json 2>/dev/null)" ]; then
                log_warning "检测到配置文件更改，需要重新构建"
                build_project
            fi

            # 检查Vercel配置是否更改
            if [ -n "$(git diff HEAD~1 HEAD --name-only vercel.json .vercel/ 2>/dev/null)" ]; then
                log_warning "检测到Vercel配置更改，可能需要重新部署"
            fi
        else
            log "首次拉取，检查项目文件状态..."
            # 检查关键文件是否存在来决定是否需要安装依赖
            if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
                log "检测到缺少依赖，重新安装..."
                npm install
                log_success "依赖安装完成"
            fi
        fi

        return 0
    else
        log_error "远程更改拉取失败"
        return 1
    fi
}

# 构建项目
build_project() {
    cd "$PROJECT_PATH"

    log "开始构建H5前端项目..."

    # 清理旧的构建文件
    if [ -d "$BUILD_DIR" ]; then
        log "清理旧的构建文件..."
        rm -rf "$BUILD_DIR"
    fi

    # 执行构建
    if npm run build; then
        log_success "H5前端构建成功"

        # 显示构建结果
        if [ -d "$BUILD_DIR" ]; then
            local build_size=$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1)
            local file_count=$(find "$BUILD_DIR" -type f | wc -l)
            log "构建大小: $build_size"
            log "文件数量: $file_count"

            # 检查关键文件
            if [ -f "$BUILD_DIR/index.html" ]; then
                log_success "index.html 存在"
            else
                log_error "index.html 缺失"
            fi

            if [ -f "$BUILD_DIR/assets/index.js" ]; then
                log_success "主JavaScript文件存在"
            fi

            if [ -f "$BUILD_DIR/assets/index.css" ]; then
                log_success "主CSS文件存在"
            fi
        fi

        return 0
    else
        log_error "H5前端构建失败"
        return 1
    fi
}

# 推送本地更改
push_local_changes() {
    cd "$PROJECT_PATH"

    log "推送本地更改到远程仓库..."

    if git push origin $BRANCH; then
        log_success "本地更改推送成功"

        # 检查是否需要自动部署
        if command -v vercel &> /dev/null && [ -n "$VERCEL_PROJECT_ID" ]; then
            log_warning "检测到Vercel CLI，开始自动部署..."
            deploy_to_vercel
        fi

        return 0
    else
        log_error "本地更改推送失败"
        return 1
    fi
}

# 部署到Vercel
deploy_to_vercel() {
    cd "$PROJECT_PATH"

    log "部署到Vercel..."

    if vercel --prod; then
        log_success "Vercel部署成功"

        # 获取部署URL
        local deploy_url=$(vercel ls 2>/dev/null | head -1 | grep -o 'https://[^[:space:]]*' | head -1)
        if [ -n "$deploy_url" ]; then
            log_success "部署URL: $deploy_url"
        fi

        return 0
    else
        log_error "Vercel部署失败"
        return 1
    fi
}

# 备份重要文件
backup_important_files() {
    local backup_dir="$PROJECT_PATH/backups/$(date +%Y%m%d_%H%M%S)"

    log "创建重要文件备份到 $backup_dir"

    mkdir -p "$backup_dir"

    # 备份环境配置文件
    [ -f ".env.development" ] && cp ".env.development" "$backup_dir/"
    [ -f ".env.production" ] && cp ".env.production" "$backup_dir/"

    # 备份配置文件
    [ -f "vite.config.ts" ] && cp "vite.config.ts" "$backup_dir/"
    [ -f "tsconfig.json" ] && cp "tsconfig.json" "$backup_dir/"
    [ -f "package.json" ] && cp "package.json" "$backup_dir/"

    # 备份构建文件
    if [ -d "$BUILD_DIR" ]; then
        log "备份构建文件..."
        cp -r "$BUILD_DIR" "$backup_dir/"
    fi

    log_success "重要文件备份完成"
}

# 检查前端部署状态
check_frontend_status() {
    log "检查H5前端部署状态..."

    # 检查构建文件
    if [ -f "$PROJECT_PATH/$BUILD_DIR/index.html" ]; then
        log_success "构建文件存在"
    else
        log_warning "构建文件不存在，需要先构建"
        return 1
    fi

    # 检查端口占用
    local port_pattern="3001"
    if netstat -tuln 2>/dev/null | grep -q ":$port_pattern "; then
        log_success "前端服务端口$port_pattern已被占用"
    else
        log_warning "前端服务端口$port_pattern未被占用"
    fi

    # 检查是否有本地开发服务器运行
    if pgrep -f "npm.*run.*dev" > /dev/null 2>&1; then
        log_warning "检测到本地开发服务器正在运行"
    else
        log_success "没有检测到本地开发服务器"
    fi

    # 检查Vercel部署状态
    if command -v vercel &> /dev/null; then
        if vercel ls &> /dev/null; then
            log_success "Vercel项目可访问"
        else
            log_warning "Vercel项目未配置或无权限访问"
        fi
    fi
}

# 性能优化建议
performance_check() {
    cd "$PROJECT_PATH"

    log "执行性能检查..."

    # 检查包大小
    if [ -f "package.json" ]; then
        local node_modules_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "0")
        log "node_modules大小: $node_modules_size"

        # 建议清理不需要的依赖
        if [ "$node_modules_size" != "0" ]; then
            log_warning "建议定期清理node_modules以节省空间"
        fi
    fi

    # 检查构建大小
    if [ -d "$BUILD_DIR" ]; then
        local build_size=$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1)
        log "构建大小: $build_size"

        # 建议代码分割
        if [[ "$build_size" == *"M"* ]] && [[ ${build_size%.*} -gt 10 ]]; then
            log_warning "构建文件较大，建议进行代码分割优化"
        fi
    fi

    # 检查资源文件
    if [ -d "$BUILD_DIR/assets" ]; then
        local js_count=$(find "$BUILD_DIR/assets" -name "*.js" | wc -l)
        local css_count=$(find "$BUILD_DIR/assets" -name "*.css" | wc -l)
        log "JavaScript文件: $js_count"
        log "CSS文件: $css_count"

        # 建议压缩优化
        local total_size=$(du -sh "$BUILD_DIR/assets" 2>/dev/null | cut -f1)
        if [[ "$total_size" == *"M"* ]] && [[ ${total_size%.*} -gt 5 ]]; then
            log_warning "静态资源较大，建议压缩优化"
        fi
    fi
}

# 显示Git状态摘要
show_git_summary() {
    cd "$PROJECT_PATH"

    log "Git状态摘要:"
    echo "==============================================="

    # 分支信息
    log "当前分支: $(git branch --show-current)"

    # 最后提交
    local last_commit=$(git log -1 --oneline 2>/dev/null || echo "无提交记录")
    log "最后提交: $last_commit"

    # 远程信息
    log "远程仓库: $(git remote get-url origin 2>/dev/null || echo "未配置")"

    # 状态信息
    local status_info=$(git status --short 2>/dev/null || echo "无法获取状态")
    if [ -n "$status_info" ]; then
        log "文件状态: "
        echo "$status_info"
    else
        log "文件状态: 工作区干净"
    fi

    echo "==============================================="
}

# 主函数
main() {
    log "开始同步 $PROJECT_NAME..."
    log "项目路径: $PROJECT_PATH"
    log "GitHub仓库: $GITHUB_REPO"
    log "==============================================="

    # 检查项目路径
    if [ ! -d "$PROJECT_PATH" ]; then
        log_error "项目路径不存在: $PROJECT_PATH"
        exit 1
    fi

    # 备份重要文件
    backup_important_files

    # 检查Git仓库状态
    check_git_status

    # 同步主循环
    local sync_needed=1
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ] && [ $sync_needed -eq 1 ]; do
        log "同步尝试 $attempt/$max_attempts"

        # 拉取远程更改
        if ! pull_remote_changes; then
            log_error "拉取远程更改失败，尝试 $attempt/$max_attempts"
            attempt=$((attempt + 1))
            sleep 5
            continue
        fi

        # 检查是否有本地更改需要推送
        if check_local_changes; then
            if commit_local_changes; then
                if ! push_local_changes; then
                    log_error "推送本地更改失败，尝试 $attempt/$max_attempts"
                    attempt=$((attempt + 1))
                    sleep 5
                    continue
                fi
            else
                log_error "提交本地更改失败，尝试 $attempt/$max_attempts"
                attempt=$((attempt + 1))
                sleep 5
                continue
            fi
        else
            sync_needed=0
        fi

        attempt=$((attempt + 1))
    done

    if [ $sync_needed -eq 0 ]; then
        log_success "同步完成"
    else
        log_error "同步失败，已达到最大尝试次数"
    fi

    # 显示Git状态
    show_git_summary

    # 检查部署状态
    check_frontend_status

    # 性能检查
    performance_check

    # 清理旧备份（保留最近7天）
    find "$PROJECT_PATH/backups" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

    log "同步任务完成！"
    log ""
    log "📋 H5前端项目信息:"
    log "- 项目: $PROJECT_NAME"
    log "- 路径: $PROJECT_PATH"
    log "- 分支: $BRANCH"
    log "- 构建目录: $BUILD_DIR"
    log "- GitHub: $GITHUB_REPO"
}

# 脚本入口
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi

exit 0