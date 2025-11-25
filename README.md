# AirTouch - 远程键鼠控制

通过 WiFi 将手机变成电脑的无线触控板和键盘。

## 项目结构

```
AirTouch/
├── server/              # Python 服务端
│   ├── pc_controller.py # WebSocket 服务器
│   ├── requirements.txt # Python 依赖
│   └── README.md
├── mobile-app/          # React Native 客户端
│   ├── src/
│   │   ├── components/  # 触控板、键盘组件
│   │   └── services/    # WebSocket 服务
│   ├── App.tsx
│   └── package.json
└── README.md
```

## 快速开始

### 1. 启动服务端

```bash
cd server
pip install -r requirements.txt
python pc_controller.py
```

服务端会显示局域网 IP 地址和二维码。

### 2. 启动移动端

```bash
cd mobile-app
npm install
npm start
```

使用 Expo Go App 扫描二维码，或运行：

- Android: `npm run android`
- iOS: `npm run ios`

### 3. 连接

在手机 App 中输入服务端显示的 IP 地址，点击连接。

## 功能特性

### 触控板模式

- ✅ 单指移动控制鼠标
- ✅ 双指滚动
- ✅ 左键/右键点击
- ✅ 二进制协议（极低延迟）
- ✅ RAF 节流（60fps）

### 键盘模式

- ✅ 文本输入（支持中文输入法）
- ✅ 功能键（ESC、Tab、Win、Alt 等）
- ✅ 方向键
- ✅ 特殊键（Delete、Home、End 等）

## 技术架构

### 服务端

- **语言**: Python 3.x
- **核心库**: websockets, pyautogui, pyperclip
- **协议**: WebSocket (二进制 + JSON)
- **性能**: 零延迟配置 (`pyautogui.PAUSE = 0`)

### 客户端

- **框架**: React Native (Expo)
- **手势**: PanResponder (原生性能)
- **协议**: 二进制协议（5 字节鼠标移动）
- **优化**: RAF 节流、相对位移计算

## 二进制协议

鼠标移动使用 5 字节二进制包（Big-Endian）：

```
[0]     消息类型 (Uint8)  -> 1 = 鼠标移动
[1-2]   X 轴位移 (Int16)  -> -32768 ~ 32767
[3-4]   Y 轴位移 (Int16)  -> -32768 ~ 32767
```

其他操作使用 JSON 格式：

```json
{"type": "click", "button": "left"}
{"type": "scroll", "dy": 10}
{"type": "keydown", "key": "ENTER"}
{"type": "text", "content": "你好"}
```

## 性能优化

### 客户端

- RAF 节流：每帧最多发送一次（~60fps）
- 相对位移：只发送增量，不发送累积值
- 二进制协议：5 字节 vs 30 字节（6 倍压缩）

### 服务端

- 单客户端限制：避免资源竞争
- 零延迟配置：`pyautogui.PAUSE = 0`
- 异步处理：高并发支持

## 网络要求

- 手机和电脑必须在同一局域网
- Windows 需要允许防火墙端口 8765
- 推荐使用 5GHz WiFi（更低延迟）

## 故障排查

### 无法连接

1. 检查手机和电脑是否在同一 WiFi
2. 检查防火墙是否允许端口 8765
3. 确认服务端正在运行

### 鼠标移动卡顿

1. 检查 WiFi 信号强度
2. 关闭其他占用网络的应用
3. 尝试重启服务端

### 输入法问题

- 使用界面上的功能键，不要依赖手机输入法的删除键

## 开发

### 添加新功能

1. 服务端：在 `pc_controller.py` 的 `process_command` 中添加新命令
2. 客户端：在 `websocket.ts` 中添加发送方法
3. UI：在对应组件中调用

### 调试

- 服务端：设置 `ENABLE_LOGGING = True`
- 客户端：查看 Metro 控制台日志

## 许可证

MIT License

## 致谢

- [pyautogui](https://pyautogui.readthedocs.io/) - 跨平台键鼠控制
- [Expo](https://expo.dev/) - React Native 开发框架
- [websockets](https://websockets.readthedocs.io/) - Python WebSocket 库
