#!/usr/bin/env bash
# =============================================
#  Extract pure arm64-v8a APK from .aab
#  100% use system JDK + English output + clean folder
# =============================================

set -e

echo "=== Airtouch arm64 APK extractor ==="

# 1. 自动读取 credentials.json（必须和脚本在同一目录）
if [[ ! -f "credentials.json" ]]; then
    echo "Error: credentials.json not found in current folder!"
    exit 1
fi

KEYSTORE_PASS=$(jq -r '.android.keystorePassword' credentials.json)
KEY_ALIAS=$(jq -r '.android.keyAlias' credentials.json)
KEY_PASS=$(jq -r '.android.keyPassword' credentials.json)

echo "Keystore alias: $KEY_ALIAS"

# 2. 找 .aab 文件
AAB_FILE=$(ls *.aab 2>/dev/null | head -n1)
if [[ -z "$AAB_FILE" ]]; then
    echo "Error: No .aab file found in current folder!"
    exit 1
fi
echo "Found AAB: $AAB_FILE"

# 3. 下载最新 bundletool（只下一次）
if [[ ! -f "bundletool.jar" ]]; then
    echo "Downloading bundletool 1.18.1 ..."
    curl -L -o bundletool.jar https://github.com/google/bundletool/releases/download/1.18.1/bundletool-all-1.18.1.jar
fi

# 4. 强制使用系统 java（不管你装没装 Android Studio）
if ! command -v java &> /dev/null; then
    echo "Error: Java not found! Please install OpenJDK 11+"
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;')
if [[ "$JAVA_VER" -lt 11 ]]; then
    echo "Error: Java 11+ required, current is $JAVA_VER"
    exit 1
fi
echo "Using system Java: $(java -version 2>&1 | head -n1)"

# 5. 生成 universal apks（体积最小）
echo "Generating universal APK (pure arm64-v8a) ..."
java -jar bundletool.jar build-apks \
    --bundle="$AAB_FILE" \
    --output="universal.apks" \
    --mode=universal \
    --ks=keystore.jks \
    --ks-key-alias="$KEY_ALIAS" \
    --ks-pass=pass:"$KEYSTORE_PASS" \
    --key-pass=pass:"$KEY_PASS"

# 6. 解压 + 清理 + 英文重命名
unzip -jo universal.apks universal.apk
rm -f universal.apks

VERSION=$(basename "$AAB_FILE" .aab | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "v1.0.4")
FINAL_NAME="Airtouch-${VERSION}-arm64-$(date +%Y%m%d).apk"
mv universal.apk "$FINAL_NAME"

echo "========================================"
echo "Success! Pure arm64 APK generated:"
echo "   $FINAL_NAME"
echo "   Size: $(du -h "$FINAL_NAME" | cut -f1)"
echo "   Ready for sideloading / enterprise distribution"
echo "========================================"