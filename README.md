# AirTouch

通过 WiFi 将手机变成电脑的无线触控板和键盘。

## 快速开始

### 启动服务端

```bash
cd server
pip install -r requirements.txt
python pc_controller.py
```

### 启动移动端

```bash
cd mobile-app
npm install
npm start
```

使用 Expo Go 扫描二维码，或在 App 中输入服务端显示的 IP 地址连接。

## 功能

- 触控板：单指移动、双指滚动、左右键
- 键盘：文本输入、功能键、方向键
- 二维码扫描连接
- 低延迟二进制协议

## 技术栈

- 服务端：Python + websockets + pyautogui
- 客户端：React Native (Expo)

## 许可证

MIT
