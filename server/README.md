# AirTouch PC 服务器

Python WebSocket 服务器，用于从移动端应用控制你的电脑。

## ✨ 功能特性

- 🌐 自动检测并显示所有可用 IP 地址
- 📱 二维码快速连接（可选）
- 🎨 美化的终端输出
- 📊 实时状态显示（连接数、命令统计）
- 📝 完善的日志系统
- ⚙️ 配置文件支持
- 🔒 连接数限制

## 📦 安装

### 1. 安装 Python

确保已安装 Python 3.8 或更高版本：
```bash
python --version
```

### 2. 安装依赖

```bash
cd server
pip install -r requirements.txt
```

依赖包：
- `websockets` - WebSocket 服务器
- `pyautogui` - 控制鼠标和键盘
- `rich` - 美化终端输出
- `qrcode` - 生成二维码（可选）

## 🚀 使用方法

### 启动服务器

```bash
python pc_controller.py
```

服务器会自动：
1. 显示 AirTouch Logo
2. 检测并显示所有可用 IP 地址
3. 生成二维码（如果启用）
4. 实时显示连接状态

### 连接到服务器

1. 在手机浏览器打开 AirTouch 应用
2. 输入服务器显示的 IP 地址
3. 或扫描二维码快速连接

## ⚙️ 配置

编辑 `config.json` 文件：

```json
{
  "server": {
    "host": "0.0.0.0",    // 监听地址
    "port": 8765          // 监听端口
  },
  "security": {
    "password": "",       // 连接密码（暂未实现）
    "max_connections": 5  // 最大连接数
  },
  "logging": {
    "level": "INFO",      // 日志级别
    "file": "logs/airtouch.log"
  },
  "features": {
    "show_qrcode": true,  // 显示二维码
    "auto_start": false   // 开机自启动（暂未实现）
  }
}
```

## 📊 支持的命令

- 🖱️ 鼠标移动
- 👆 鼠标点击（左键、右键、中键）
- 📜 滚动
- ⌨️ 键盘输入
- 🔑 特殊按键（Enter、Backspace、Esc 等）

## 📝 日志

日志文件位置：`logs/airtouch.log`

日志级别：
- `DEBUG` - 详细调试信息
- `INFO` - 一般信息
- `WARNING` - 警告信息
- `ERROR` - 错误信息

## 🔧 故障排除

### 无法启动服务器

1. 检查端口是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr :8765
   
   # Mac/Linux
   lsof -i :8765
   ```

2. 尝试更改端口（编辑 `config.json`）

### 无法连接

1. 确保手机和电脑在同一 WiFi 网络
2. 检查防火墙设置，允许端口 8765
3. 确认 IP 地址正确

### 控制不响应

1. 检查 PyAutoGUI 是否正常工作
2. 查看日志文件了解详细错误
3. 确保没有其他程序干扰

## 🔒 安全提示

- ⚠️ 仅在可信任的局域网使用
- ⚠️ 不要将服务器暴露到公网
- ⚠️ 建议设置防火墙规则
- ⚠️ 定期检查日志文件

## 🛠️ 开发

### 添加新功能

1. 在 `process_command` 方法中添加新的命令类型
2. 在前端添加对应的发送逻辑
3. 更新文档

### 调试模式

设置日志级别为 `DEBUG`：
```json
{
  "logging": {
    "level": "DEBUG"
  }
}
```

## 📚 相关链接

- [AirTouch 主项目](../)
- [PyAutoGUI 文档](https://pyautogui.readthedocs.io/)
- [Websockets 文档](https://websockets.readthedocs.io/)

---

**AirTouch - 隔空触控**
让你的手机变成智能触控板 🚀
