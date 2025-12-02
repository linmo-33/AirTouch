# AirTouch 🚀

将你的手机变成电脑的无线触控板和键盘，通过 WiFi 实现低延迟控制。

## ✨ 特性

### 触控板模式

- 🖱️ **单指移动** - 精确控制鼠标指针
- 👆 **单击触控板** - 快速点击触发左键
- 📜 **双指滚动** - 上下滑动页面
- 🎯 **左右键按钮** - 完整的鼠标功能
- ⚡ **智能加速** - 快速移动时自动加速，慢速移动精确控制
- 🎮 **低延迟** - 二进制传输，响应迅速

### 键盘模式

- ⌨️ **实时输入** - 手机输入实时同步到电脑
- 🔧 **功能键** - 支持 ESC、Tab、Win、Alt 等
- ⬆️ **方向键** - 完整的方向键支持
- 🔙 **特殊键** - Backspace、Enter、Space、Delete 等

### 连接功能

- 📱 **二维码扫描** - 快速连接，无需手动输入
- 🔄 **自动重连** - 熄屏后自动恢复连接
- 💓 **心跳检测** - 保持连接稳定

## 📦 快速开始

### 方式一：使用打包好的程序（推荐）

#### 服务端（Windows）

1. 下载 `AirTouch.exe`
2. 双击运行（会自动请求管理员权限）
3. 使用手机扫描二维码或记下 IP 地址

#### 移动端

1. 使用 Expo Go 扫描服务端二维码
2. 或手动输入服务端 IP 地址连接

### 方式二：从源码运行

#### 服务端

```bash
cd server

# 创建虚拟环境（推荐）
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# 安装依赖
pip install -r requirements.txt

# 以管理员权限运行（推荐）
run_admin.bat  # Windows

# 或普通运行
python pc_controller.py
```

#### 移动端

```bash
cd mobile-app

# 安装依赖
npm install

# 启动开发服务器
npm start
```

使用 Expo Go 扫描二维码即可在手机上运行。

## 🔨 打包

### 打包服务端为 exe

```bash
cd server
build.bat
```

生成的 `dist\AirTouch.exe` 可独立运行，无需 Python 环境。

### 打包移动端

```bash
cd mobile-app

# Android APK
eas build --platform android

# iOS
eas build --platform ios
```

## 📖 使用指南

### 首次连接

1. 确保手机和电脑在同一 WiFi 网络
2. 启动服务端程序
3. 使用手机扫描二维码或输入 IP 地址
4. 连接成功后即可使用

### 触控板操作

- **移动鼠标**：单指在触控区域滑动
- **左键点击**：快速点击触控区域
- **左键点击**：点击底部"左键"按钮
- **右键点击**：点击底部"右键"按钮
- **滚动页面**：双指上下滑动

### 键盘操作

1. 切换到"键盘"标签
2. 点击输入区域激活输入法
3. 在手机上输入，内容实时发送到电脑
4. 使用功能键按钮发送特殊按键

### 管理员权限

为了控制以管理员身份运行的程序（如任务管理器），服务端需要管理员权限：

- 使用 `run_admin.bat` 启动
- 或打包后的 `AirTouch.exe` 会自动请求权限

## 🛠️ 技术栈

### 服务端

- **Python 3.8+** - 主要编程语言
- **websockets** - WebSocket 服务器
- **pyautogui** - 鼠标键盘控制
- **pyperclip** - 剪贴板操作
- **qrcode** - 二维码生成
- **tkinter** - GUI 界面

### 移动端

- **React Native** - 跨平台移动开发
- **Expo** - 开发工具链
- **TypeScript** - 类型安全
- **WebSocket** - 实时通信

## 🔧 配置

### 调整灵敏度

**触控板灵敏度** (`mobile-app/src/components/TouchPad.tsx`):

```typescript
const MOUSE_SENSITIVITY = 1.5; // 基础灵敏度
const SCROLL_SENSITIVITY = 0.3; // 滚动灵敏度
const ACCELERATION_FACTOR = 1.8; // 加速因子
```

## 🐛 常见问题

### 无法连接

- 确认手机和电脑在同一 WiFi 网络
- 检查防火墙是否允许端口 8765
- 尝试关闭 VPN 或代理

### 无法控制某些程序

- 以管理员权限运行服务端
- Windows 安全策略可能阻止某些操作

### 熄屏后断开连接

- 程序已支持自动重连（最多尝试 3 次）
- 如仍有问题，请手动重新连接

### 触控板不够灵敏

- 调整 `MOUSE_SENSITIVITY` 参数
- 检查手机触摸屏是否正常

## 📝 开发计划

- [ ] 支持多点触控手势
- [ ] 添加音量控制
- [ ] 支持文件传输
- [ ] 添加快捷键自定义
- [ ] 支持 macOS 和 Linux

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有开源项目的贡献者！

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
