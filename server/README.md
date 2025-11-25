# AirTouch PC Controller

一个简单易用的 PC 远程控制服务器，支持通过手机控制电脑的鼠标、键盘等操作。

## 功能特点

- 🖱️ 鼠标控制（移动、点击、滚动）
- ⌨️ 键盘输入（文本输入、功能键）
- 📱 二维码扫描连接
- 🚀 低延迟二进制协议
- 🎨 简洁的 GUI 界面
- 📦 支持打包成独立 exe

## 快速开始

### 方式一：使用打包好的 exe（推荐）

1. 双击运行 `AirTouch.exe`
2. 点击"启动服务器"
3. 使用手机扫描二维码连接

### 方式二：从源码运行

```bash
# 安装依赖
pip install -r requirements.txt

# 运行程序
python pc_controller.py
```

## 打包说明

### Windows 系统

```bash
# 安装打包依赖
pip install -r requirements-dev.txt

# 执行打包（方式1：使用脚本）
build.bat

# 执行打包（方式2：手动命令）
pyinstaller --onefile --windowed --name "AirTouch" pc_controller.py
```

打包完成后，exe 文件位于 `dist/AirTouch.exe`

## 使用说明

1. **启动服务器**

   - 运行程序后点击"启动服务器"按钮
   - 查看显示的 IP 地址和二维码

2. **手机连接**

   - 确保手机和电脑在同一局域网
   - 使用手机扫描二维码或手动输入 IP 地址
   - 连接成功后即可控制电脑

3. **功能使用**
   - 触摸板：控制鼠标移动
   - 点击：单击、右键、双击
   - 滚动：上下滚动页面
   - 键盘：输入文本和功能键

## 技术栈

- Python 3.8+
- tkinter (GUI 界面)
- websockets (通信协议)
- pyautogui (系统控制)
- qrcode (二维码生成)

## 注意事项

- 默认端口：8765
- 仅支持一个客户端同时连接
- 首次运行可能需要允许防火墙访问
- 确保手机和电脑在同一局域网内

## 故障排除

### 无法连接

- 检查防火墙设置，允许端口 8765
- 确认手机和电脑在同一 WiFi 网络
- 尝试关闭 VPN 或代理

### 打包失败

- 确保 Python 版本 >= 3.8
- 升级 pyinstaller: `pip install --upgrade pyinstaller`
- 检查是否有杀毒软件拦截

### 运行错误

- 查看日志区域的错误信息
- 确保端口 8765 未被占用
- 重启程序或电脑

## 许可证

MIT License
