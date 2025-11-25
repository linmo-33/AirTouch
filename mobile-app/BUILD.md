# AirTouch App 打包指南

## 方法 1: Expo Go 测试（最快）

### 无需打包，直接测试

```bash
cd mobile-app
npm start
```

然后：

1. 手机安装 **Expo Go** App
2. 扫描终端显示的二维码
3. 立即在手机上运行

**优点**: 快速、无需配置
**缺点**: 需要保持电脑运行、依赖 Expo Go

---

## 方法 2: 开发版 APK（推荐）

### 步骤 1: 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 步骤 2: 登录 Expo 账号

```bash
eas login
```

如果没有账号，访问 https://expo.dev/signup 注册（免费）

### 步骤 3: 配置项目

```bash
cd mobile-app
eas build:configure
```

### 步骤 4: 构建 Android APK

```bash
# 开发版（推荐，可以快速测试）
eas build -p android --profile preview

# 或生产版（需要签名）
eas build -p android --profile production
```

### 步骤 5: 下载并安装

1. 构建完成后，会显示下载链接
2. 在手机浏览器打开链接
3. 下载 APK 并安装

**时间**: 约 10-20 分钟
**优点**: 独立 APK，无需 Expo Go
**缺点**: 需要 Expo 账号

---

## 方法 3: 本地构建（高级）

### Android 本地构建

#### 前置要求

- Android Studio
- Java JDK 17
- Android SDK

#### 步骤

```bash
cd mobile-app

# 1. 预构建
npx expo prebuild

# 2. 进入 Android 目录
cd android

# 3. 构建 APK
./gradlew assembleRelease

# 4. APK 位置
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS 本地构建（需要 Mac）

```bash
cd mobile-app

# 1. 预构建
npx expo prebuild

# 2. 安装依赖
cd ios
pod install

# 3. 打开 Xcode
open AirTouch.xcworkspace

# 4. 在 Xcode 中构建
```

---

## 方法 4: 发布到应用商店

### Android (Google Play)

#### 1. 生成签名密钥

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore airtouch.keystore -alias airtouch -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. 配置 eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 3. 构建生产版

```bash
eas build -p android --profile production
```

#### 4. 上传到 Google Play Console

1. 访问 https://play.google.com/console
2. 创建应用
3. 上传 APK/AAB
4. 填写应用信息
5. 提交审核

### iOS (App Store)

需要：

- Apple Developer 账号（$99/年）
- Mac 电脑

```bash
eas build -p ios --profile production
```

---

## 快速开始（推荐流程）

### 第一次测试

```bash
cd mobile-app
npm start
# 使用 Expo Go 扫码测试
```

### 想要独立 APK

```bash
npm install -g eas-cli
eas login
cd mobile-app
eas build -p android --profile preview
```

### 正式发布

```bash
eas build -p android --profile production
# 上传到 Google Play
```

---

## 常见问题

### Q: 构建失败怎么办？

A: 检查：

1. `app.json` 配置是否正确
2. 所有依赖是否安装
3. 查看构建日志

### Q: 需要付费吗？

A:

- Expo 账号：免费
- EAS 构建：每月 30 次免费
- Google Play：$25 一次性费用
- App Store：$99/年

### Q: APK 太大怎么办？

A:

1. 使用 AAB 格式（自动优化）
2. 移除未使用的资源
3. 启用代码压缩

### Q: 如何更新 App？

A:

1. 修改 `app.json` 中的 `version`
2. 重新构建
3. 上传新版本

---

## 配置文件说明

### app.json

```json
{
  "expo": {
    "name": "AirTouch", // 应用名称
    "slug": "airtouch", // URL slug
    "version": "1.0.0", // 版本号
    "android": {
      "package": "com.yourname.airtouch" // 包名（需修改）
    }
  }
}
```

### eas.json（自动生成）

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

---

## 下一步

1. ✅ 测试 App 功能
2. ✅ 修改 `app.json` 中的包名和应用信息
3. ✅ 准备应用图标和截图
4. ✅ 构建 APK
5. ✅ 分发或上架

---

## 有用的命令

```bash
# 查看构建状态
eas build:list

# 取消构建
eas build:cancel

# 查看构建日志
eas build:view [BUILD_ID]

# 清理缓存
npm start -- --clear

# 检查配置
npx expo-doctor
```

---

**推荐**: 先用 Expo Go 测试，确认功能正常后再用 EAS 构建 APK！
