# AirTouch - 隔空触控

通过 WiFi 将手机变成电脑的无线触控板和键盘。

## ✨ 特性

- 🖱️ **触控板** - 单指移动、轻触点击、左右键
- ⌨️ **键盘** - 完整虚拟键盘输入
- 🖐️ **多指手势** - 双指滚动/缩放、三指任务切换
- 📡 **局域网连接** - 无需互联网，数据不上传

## 🚀 快速开始

### 1. 启动服务

```bash
# 安装依赖
cd server
pip install -r requirements.txt

# 启动后端
python pc_controller.py

# 启动前端（新终端）
pnpm install
pnpm dev
```

### 2. 连接（手机）

1. 手机浏览器访问显示的地址（如 `http://192.168.x.x:3000`）
2. 输入电脑 IP 或扫描二维码
3. 点击"连接"

**注意：** 手机和电脑需在同一 WiFi 网络

## 🎮 手势操作

### 触控板模式
- 单指移动 → 鼠标移动
- 单指轻触 → 左键点击
- 双指滑动 → 页面滚动
- 双指捏合 → 缩放
- 三指上滑 → 任务视图 (Win+Tab)
- 三指下滑 → 显示桌面 (Win+D)
- 三指左右滑 → 切换任务 (Alt+Tab)

### 键盘模式
- 虚拟键盘输入
- 支持特殊按键和快捷键

## 🐛 故障排除

**无法连接？**
1. 确保手机和电脑在同一 WiFi
2. 关闭 Windows 防火墙
3. 检查 IP 地址是否正确


## 🔧 技术栈

- 前端：React + TypeScript + Vite + TailwindCSS
- 后端：Python + WebSocket + PyAutoGUI

## 📝 许可证

MIT License
