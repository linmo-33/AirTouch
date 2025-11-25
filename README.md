# AirTouch - 隔空触控

一个基于 Web 的远程电脑控制应用，通过 WiFi 连接，让你的手机变成智能触控板、键盘和 AI 命令控制器。

## 功能特性

- 🖱️ **触控板模式**：精准的鼠标移动、点击和滚动控制
- ⌨️ **键盘模式**：完整的文字输入和快捷键支持
- ✨ **AI 命令模式**：使用 Gemini AI 将自然语言转换为 PC 操作
- 📱 **移动优化**：专为触摸屏设计的流畅界面
- 🔒 **本地网络**：通过 WiFi 在局域网内安全连接

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Python WebSocket Server
- **AI**: Google Gemini API
- **UI**: Tailwind CSS + Lucide Icons

## 快速开始

### 1. 安装前端依赖

```bash
pnpm install
```

### 2. 配置 Gemini API Key

在 `.env.local` 文件中设置你的 API Key：

```
GEMINI_API_KEY=your_api_key_here
```

获取 API Key: https://aistudio.google.com/app/apikey

### 3. 启动前端应用

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动

### 4. 安装并启动 Python 服务器

```bash
cd server
pip install -r requirements.txt
python pc_controller.py
```

服务器将在端口 8765 启动

### 5. 连接

1. 确保手机和 PC 在同一局域网
2. 在手机浏览器访问 `http://[PC_IP]:3000`
3. 输入 PC 的 IP 地址连接
4. 开始隔空控制！

## 项目结构

```
airtouch/
├── components/              # React 组件
│   ├── AICommandPanel.tsx  # AI 命令面板
│   ├── KeyboardControl.tsx # 键盘控制
│   └── TouchPad.tsx        # 触控板
├── services/               # 服务层
│   ├── geminiService.ts    # Gemini AI 服务
│   └── websocketService.ts # WebSocket 通信
├── server/                 # Python 服务器
│   ├── pc_controller.py    # 主服务器文件
│   ├── requirements.txt    # Python 依赖
│   └── README.md          # 服务器文档
├── App.tsx                # 主应用组件
├── types.ts               # TypeScript 类型定义
└── index.tsx              # 应用入口
```

## 使用说明

### 触控板模式
- 单指滑动：移动鼠标
- 单击触控区域：左键点击
- 使用底部按钮：L（左键）、R（右键）
- 右侧滑动条：滚动页面

### 键盘模式
- 点击输入区域激活手机键盘
- 输入的文字会实时发送到 PC
- 支持特殊按键：Esc、Tab、Win、Alt 等

### AI 命令模式
- 输入自然语言命令，如 "打开记事本"
- Gemini AI 会将命令转换为键盘操作
- 自动执行生成的按键序列

## 注意事项

- 仅在可信任的本地网络使用
- 不要将服务器暴露到公网
- 确保防火墙允许端口 8765 的连接
- 建议在同一 WiFi 网络下使用以获得最佳性能

## 开发

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 类型检查
pnpm type-check
```

## 部署到 Vercel

### 1. 准备工作

确保你有 Vercel 账号：https://vercel.com

### 2. 部署前端

**方式一：通过 Vercel CLI**

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login

# 部署
vercel
```

**方式二：通过 GitHub（推荐）**

1. 将代码推送到 GitHub
2. 在 Vercel 控制台导入项目
3. Vercel 会自动检测 Vite 配置

### 3. 配置环境变量

在 Vercel 项目设置中添加：
- `GEMINI_API_KEY`: 你的 Gemini API Key

### 4. 运行 Python 服务器

前端部署后，在你的 PC 上运行：

```bash
cd server
python pc_controller.py
```

### 5. 使用

1. 在手机浏览器访问：`https://airtouch.vercel.app`
2. 输入你的 PC 局域网 IP 地址
3. 开始隔空控制！

## 部署架构

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   手机浏览器  │ ─HTTPS─→ │ Vercel (前端) │         │  你的 PC     │
│  AirTouch   │         │   AirTouch   │         │             │
│             │ ←─────────────────────────WebSocket─→ Python   │
│             │         局域网连接        │             │  Server    │
└─────────────┘                         └─────────────┘
```

- **前端**：部署在 Vercel，全球可访问
- **后端**：运行在你的 PC 上，局域网连接
- **安全**：WebSocket 连接仅限局域网
- **体验**：隔空触控，如同近在咫尺

## 注意事项

- 确保手机和 PC 在同一 WiFi 网络
- Python 服务器需要在 PC 上持续运行
- 防火墙需要允许端口 8765
- 如果使用移动数据，需要配置端口转发（不推荐）

## License

MIT
