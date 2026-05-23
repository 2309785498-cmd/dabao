#!/bin/bash
# ============================================================================
# 自动轮询部署脚本
# 每分钟检查 Gitee 仓库是否有新提交，有则自动部署
# 由 systemd timer 每 60 秒触发一次
# ============================================================================
set -e

REPO_URL="https://highly-paid-programmers:37bee881b7a6af470f84d5e1c251c849@gitee.com/highly-paid-programmers/quan.git"
PROJECT_DIR="/home/ubuntu/quan"
LOCK_FILE="/tmp/auto-deploy.lock"
LOG_FILE="/home/ubuntu/quan/output/backend/logs/auto-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 防止并发执行
if [ -f "$LOCK_FILE" ]; then
    exit 0
fi
touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

mkdir -p "$(dirname "$LOG_FILE")"

# ---- 检查仓库 ----
if [ ! -d "$PROJECT_DIR/.git" ]; then
    log "仓库不存在，执行首次克隆..."
    git clone --branch main "$REPO_URL" "$PROJECT_DIR"
    bash /home/ubuntu/deploy.sh
    exit 0
fi

cd "$PROJECT_DIR"

# ---- 获取远程最新 commit ----
git fetch origin main 2>&1 | tee -a "$LOG_FILE"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    # 无变化，静默退出
    exit 0
fi

# ---- 有更新，触发部署 ----
log "检测到新提交: ${REMOTE:0:7} (当前: ${LOCAL:0:7})"
log "触发部署..."

if sudo bash /home/ubuntu/deploy.sh >> "$LOG_FILE" 2>&1; then
    log "✓ 自动部署成功"
else
    log "✗ 自动部署失败，请检查日志"
fi
