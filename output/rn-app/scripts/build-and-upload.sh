#!/usr/bin/env bash
# =============================================================================
# 本地一键打包 + 上传蒲公英脚本
# 使用前请先配置下方变量或对应的环境变量
# =============================================================================
set -euo pipefail

# ---- 配置区（优先使用环境变量，其次修改此处的默认值） ----
PGYER_API_KEY="${PGYER_API_KEY:-}"                         # 蒲公英 API Key（必填）
RELEASE_KEYSTORE_PATH="${RELEASE_KEYSTORE_PATH:-}"          # .jks 文件路径（必填）
RELEASE_KEYSTORE_PASSWORD="${RELEASE_KEYSTORE_PASSWORD:-}"  # 密钥库密码
RELEASE_KEY_ALIAS="${RELEASE_KEY_ALIAS:-}"                  # 密钥别名
RELEASE_KEY_PASSWORD="${RELEASE_KEY_PASSWORD:-}"            # 密钥密码

# ---- 脚本参数 ----
BUILD_TYPE="${1:-release}"   # release | debug
UPDATE_DESC="${2:-本地构建 $(date '+%Y-%m-%d %H:%M:%S')}"

# ---- 颜色输出 ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ---- 前置检查 ----
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

log_info "项目目录: $PROJECT_DIR"

if [ ! -d "$ANDROID_DIR" ]; then
    log_error "android 目录不存在: $ANDROID_DIR"
    exit 1
fi

if [ "$BUILD_TYPE" = "release" ]; then
    if [ -z "$RELEASE_KEYSTORE_PATH" ] || [ ! -f "$RELEASE_KEYSTORE_PATH" ]; then
        log_error "签名文件不存在: ${RELEASE_KEYSTORE_PATH:-"(未设置)"}"
        log_error "请设置 RELEASE_KEYSTORE_PATH 环境变量，或修改脚本中的默认值"
        exit 1
    fi
    if [ -z "$PGYER_API_KEY" ]; then
        log_warn "未设置 PGYER_API_KEY，构建完成后将跳过上传蒲公英"
        SKIP_UPLOAD=true
    else
        SKIP_UPLOAD=false
    fi
fi

# ---- Step 1: 安装依赖 ----
log_info "Step 1/4: 安装 npm 依赖..."
cd "$PROJECT_DIR"
npm install --legacy-peer-deps 2>&1 | tail -3

# ---- Step 2: 构建 APK ----
log_info "Step 2/4: 构建 ${BUILD_TYPE} APK..."

if [ "$BUILD_TYPE" = "release" ]; then
    # 将签名文件复制到 Android 项目目录
    cp "$RELEASE_KEYSTORE_PATH" "$ANDROID_DIR/app/release.keystore"

    cd "$ANDROID_DIR"
    chmod +x gradlew 2>/dev/null || true

    ./gradlew app:assembleRelease \
        -PRELEASE_KEYSTORE_PATH="$ANDROID_DIR/app/release.keystore" \
        -PRELEASE_KEYSTORE_PASSWORD="$RELEASE_KEYSTORE_PASSWORD" \
        -PRELEASE_KEY_ALIAS="$RELEASE_KEY_ALIAS" \
        -PRELEASE_KEY_PASSWORD="$RELEASE_KEY_PASSWORD"
else
    cd "$ANDROID_DIR"
    chmod +x gradlew 2>/dev/null || true
    ./gradlew app:assembleDebug
fi

# ---- Step 3: 定位 APK ----
if [ "$BUILD_TYPE" = "release" ]; then
    APK_DIR="$ANDROID_DIR/app/build/outputs/apk/release"
    APK_FILE="$APK_DIR/app-release.apk"
else
    APK_DIR="$ANDROID_DIR/app/build/outputs/apk/debug"
    APK_FILE="$APK_DIR/app-debug.apk"
fi

if [ ! -f "$APK_FILE" ]; then
    log_error "APK 构建失败，文件不存在: $APK_FILE"
    exit 1
fi

# 重命名 APK
VERSION_CODE=$(date +%Y%m%d%H%M)
APK_NAME="office-assistant-v${VERSION_CODE}-${BUILD_TYPE}.apk"
cp "$APK_FILE" "$APK_DIR/$APK_NAME"

APK_SIZE=$(du -h "$APK_DIR/$APK_NAME" | cut -f1)
log_info "Step 3/4: APK 构建完成"
log_info "  文件: $APK_DIR/$APK_NAME"
log_info "  大小: $APK_SIZE"

# ---- Step 4: 上传蒲公英 ----
if [ "$SKIP_UPLOAD" = true ] || [ "$BUILD_TYPE" != "release" ]; then
    log_info "Step 4/4: 跳过上传（SKIP_UPLOAD=$SKIP_UPLOAD, BUILD_TYPE=$BUILD_TYPE）"
    log_info "APK 文件位于: $APK_DIR/$APK_NAME"
    exit 0
fi

log_info "Step 4/4: 上传到蒲公英..."

RESPONSE=$(curl --fail-with-body -s \
    -F "file=@${APK_DIR}/${APK_NAME}" \
    -F "_api_key=${PGYER_API_KEY}" \
    -F "buildUpdateDescription=${UPDATE_DESC}" \
    -F "buildInstallType=2" \
    https://www.pgyer.com/apiv2/app/upload)

CODE=$(echo "$RESPONSE" | jq -r '.code // "unknown"')
if [ "$CODE" != "0" ]; then
    log_error "上传失败: $(echo "$RESPONSE" | jq -r '.message // "unknown error"')"
    exit 1
fi

SHORTCUT_URL=$(echo "$RESPONSE" | jq -r '.data.buildShortcutUrl')
QRCODE_URL=$(echo "$RESPONSE" | jq -r '.data.buildQRCodeURL')
APP_VERSION=$(echo "$RESPONSE" | jq -r '.data.buildVersion')
BUILD_VERSION=$(echo "$RESPONSE" | jq -r '.data.buildBuildVersion')

echo ""
echo "=============================================="
echo "  构建 & 上传完成！"
echo "=============================================="
echo "  应用版本: ${APP_VERSION} (build ${BUILD_VERSION})"
echo "  下载链接: ${SHORTCUT_URL}"
echo "  二维码:   ${QRCODE_URL}"
echo "=============================================="
echo ""
echo "  手机扫码即可安装 APK"
echo "  首次安装请允许"未知来源应用""
echo ""
