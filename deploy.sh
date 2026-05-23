#!/bin/bash
# ============================================================================
# 部署脚本 — 放在服务器 /home/ubuntu/deploy.sh
# 由云效流水线通过 SSH 远程执行，也可手动运行
# 功能：从 Gitee 拉取最新 main 分支代码，安装依赖，重启 Flask 服务
# ============================================================================
set -e

# ---- 配置 ----
REPO_URL="https://highly-paid-programmers:37bee881b7a6af470f84d5e1c251c849@gitee.com/highly-paid-programmers/quan.git"
PROJECT_DIR="/home/ubuntu/quan"
BACKEND_DIR="$PROJECT_DIR/output/backend"
VENV_DIR="$BACKEND_DIR/venv"
SERVICE_NAME="flask-app"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
REPO_SERVICE_FILE="$PROJECT_DIR/output/flask-app.service"

echo "=========================================="
echo "  部署开始 — $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# ---- 1. 克隆或更新代码 ----
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "[1/6] 更新已有代码..."
    cd "$PROJECT_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    echo "[1/6] 首次克隆代码仓库..."
    sudo rm -rf "$PROJECT_DIR" 2>/dev/null || true
    git clone --branch main "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo "      当前 commit: $(git rev-parse --short HEAD)"

# ---- 2. 自更新部署脚本 & 自动部署文件 ----
echo "[2/7] 更新部署脚本..."
if [ -f "$PROJECT_DIR/deploy.sh" ]; then
    cp "$PROJECT_DIR/deploy.sh" /home/ubuntu/deploy.sh
    chmod +x /home/ubuntu/deploy.sh
    echo "      deploy.sh 已同步"
fi
if [ -f "$PROJECT_DIR/auto-deploy.sh" ]; then
    cp "$PROJECT_DIR/auto-deploy.sh" /home/ubuntu/auto-deploy.sh
    chmod +x /home/ubuntu/auto-deploy.sh
    echo "      auto-deploy.sh 已同步"
fi
if [ -f "$PROJECT_DIR/auto-deploy.service" ]; then
    sudo cp "$PROJECT_DIR/auto-deploy.service" /etc/systemd/system/auto-deploy.service
    sudo cp "$PROJECT_DIR/auto-deploy.timer" /etc/systemd/system/auto-deploy.timer
    sudo systemctl daemon-reload
    sudo systemctl restart auto-deploy.timer
    echo "      auto-deploy timer 已更新"
fi

# ---- 3. 创建 .env 文件（gitignore 排除，需自动生成） ----
echo "[3/7] 检查 .env 文件..."
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << 'ENVEOF'
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=a92dabd9e12da26bff08e3eb80086c96
DATABASE_URL=mysql+pymysql://root:root@localhost/office_assistant
JWT_SECRET=119f646051cbc5cf586a98d99a858521
JWT_EXPIRATION_HOURS=2
ENVEOF
    chmod 600 "$ENV_FILE"
    echo "      .env 文件已自动创建"
else
    echo "      .env 文件已存在，跳过"
fi

# ---- 4. 创建虚拟环境 ----
echo "[4/7] 配置 Python 虚拟环境..."
cd "$BACKEND_DIR"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "      虚拟环境已创建"
else
    echo "      虚拟环境已存在，跳过创建"
fi
source "$VENV_DIR/bin/activate"

# ---- 5. 安装依赖 ----
echo "[5/7] 安装 Python 依赖..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo "      依赖安装完成"

# ---- 6. 构建并部署前端 ----
echo "[6/8] 构建前端..."
FRONTEND_SRC="$PROJECT_DIR"
FRONTEND_DIST="$FRONTEND_SRC/dist"
FRONTEND_WWW="/var/www/flask-app"

if [ -f "$FRONTEND_SRC/package.json" ]; then
    cd "$FRONTEND_SRC"
    pnpm install --quiet 2>&1 | tail -1
    pnpm build 2>&1 | tail -3
    sudo rm -rf "$FRONTEND_WWW"
    sudo mkdir -p "$FRONTEND_WWW"
    sudo cp -r "$FRONTEND_DIST"/* "$FRONTEND_WWW"/
    sudo chown -R www-data:www-data "$FRONTEND_WWW"
    echo "      前端构建并部署完成"
else
    echo "      跳过前端（无 package.json）"
fi

# ---- 7. 创建日志目录 ----
mkdir -p "$BACKEND_DIR/logs"

# ---- 8. 配置并重启 systemd 服务 ----
echo "[7/8] 配置 systemd 服务..."
if [ -f "$REPO_SERVICE_FILE" ]; then
    sudo cp "$REPO_SERVICE_FILE" "$SERVICE_FILE"
    sudo systemctl daemon-reload
    echo "      服务文件已更新"
else
    echo "      !! 警告: 未找到 $REPO_SERVICE_FILE，跳过服务文件更新"
fi

echo "[8/8] 重启服务..."
sudo systemctl enable "$SERVICE_NAME" 2>/dev/null || true
sudo systemctl restart "$SERVICE_NAME"

# ---- 验证 ----
sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "=========================================="
    echo "  ✓ 部署成功 — $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  服务状态: $(systemctl is-active $SERVICE_NAME)"
    echo "=========================================="
else
    echo "=========================================="
    echo "  ✗ 服务启动失败，请检查日志"
    echo "  sudo journalctl -u $SERVICE_NAME -n 50"
    echo "=========================================="
    exit 1
fi
