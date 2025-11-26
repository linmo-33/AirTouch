#!/usr/bin/env python3
"""
AirTouch PC Controller Server
WebSocket server that receives commands from the mobile app and controls the PC
"""

import asyncio
import json
import os
import socket
import struct
import sys
import threading
import tkinter as tk
from tkinter import ttk, scrolledtext
from typing import Dict, Any, Optional
from io import StringIO
import websockets
import pyautogui
import pyperclip
import qrcode
from PIL import Image, ImageTk

# 配置 PyAutoGUI - 极致性能
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0  # 移除延迟，保证鼠标移动丝滑

# 日志开关
ENABLE_LOGGING = True

def get_resource_path(relative_path):
    """获取资源文件的绝对路径（支持打包后的环境）"""
    try:
        # PyInstaller 创建临时文件夹，路径存储在 _MEIPASS 中
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

class PCController:
    def __init__(self, host='0.0.0.0', port=8765, log_callback=None):
        self.host = host
        self.port = port
        self.current_client: Optional[websockets.WebSocketServerProtocol] = None
        self.log_callback = log_callback
        self.is_running = False
        self.server = None
        
    def get_local_ip(self) -> str:
        """获取本机局域网 IP 地址"""
        try:
            # 使用公网 DNS 获取本地 IP（不会真正连接）
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            # 备用方案：获取主机名对应的 IP
            try:
                hostname = socket.gethostname()
                ip = socket.gethostbyname(hostname)
                return ip
            except:
                return '127.0.0.1'
    
    def log(self, message: str):
        """输出日志"""
        if self.log_callback:
            self.log_callback(message)
        else:
            print(message)
    
    def generate_qrcode(self, url: str):
        """生成二维码图片"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        return img
    
    async def handle_client(self, websocket):
        """处理客户端连接（仅允许一个客户端）"""
        client_ip = websocket.remote_address[0]
        
        # 如果已有客户端连接，拒绝新连接
        if self.current_client is not None:
            self.log(f"⚠️  拒绝连接: {client_ip} (已有客户端连接)")
            await websocket.close(1008, "Server busy: only one client allowed")
            return
        
        self.current_client = websocket
        self.log(f"✅ 客户端已连接: {client_ip}")
        if self.log_callback:
            self.log_callback(f"CLIENT_CONNECTED:{client_ip}")
        
        try:
            async for message in websocket:
                # 判断消息类型：二进制或文本
                if isinstance(message, bytes):
                    await self.process_binary_command(message)
                else:
                    await self.process_command(message)
        except websockets.exceptions.ConnectionClosed:
            self.log(f"🔌 客户端断开: {client_ip}")
        except Exception as e:
            if ENABLE_LOGGING:
                self.log(f"❌ 错误: {e}")
        finally:
            self.current_client = None
            self.log("📭 等待新客户端连接...")
            if self.log_callback:
                self.log_callback("CLIENT_DISCONNECTED")
    
    async def process_binary_command(self, message: bytes):
        """处理二进制命令（用于高频鼠标移动）"""
        try:
            if len(message) == 5:
                # 解析二进制包: 大端序 (Big-Endian)
                # Byte 0: 消息类型 (Uint8)
                # Byte 1-2: X 轴位移 (Int16)
                # Byte 3-4: Y 轴位移 (Int16)
                msg_type, dx, dy = struct.unpack('>Bhh', message)
                
                if msg_type == 1:  # 鼠标移动
                    pyautogui.moveRel(dx, dy, _pause=False)
        except Exception as e:
            if ENABLE_LOGGING:
                self.log(f"❌ 二进制命令错误: {e}")
    
    async def process_command(self, message: str):
        """处理 JSON 文本命令"""
        try:
            data: Dict[str, Any] = json.loads(message)
            cmd_type = data.get('type')
            
            if cmd_type == 'move':
                # 兼容旧的 JSON 格式鼠标移动
                dx = data.get('dx', 0)
                dy = data.get('dy', 0)
                pyautogui.moveRel(dx, dy, _pause=False)
                
            elif cmd_type == 'click':
                button = data.get('button', 'left')
                pyautogui.click(button=button)
                
            elif cmd_type == 'scroll':
                dy = data.get('dy', 0)
                pyautogui.scroll(int(dy))
                
            elif cmd_type == 'keydown':
                # 物理按键模拟（功能键、快捷键）
                key = data.get('key', '')
                if key:
                    self.handle_keydown(key)
                    
            elif cmd_type == 'text':
                # 文本内容注入（使用剪贴板）
                content = data.get('content', '')
                if content:
                    self.handle_text(content)
                    
        except Exception as e:
            if ENABLE_LOGGING:
                self.log(f"❌ 错误: {e}")
    
    def handle_keydown(self, key: str):
        """处理物理按键（功能键）"""
        special_keys_map = {
            'BACKSPACE': 'backspace',
            'ENTER': 'enter',
            'ESC': 'esc',
            'TAB': 'tab',
            'WIN': 'win',
            'ALT': 'alt',
            'CTRL': 'ctrl',
            'SHIFT': 'shift',
            'SPACE': 'space',
            'DELETE': 'delete',
            'HOME': 'home',
            'END': 'end',
            'PAGEUP': 'pageup',
            'PAGEDOWN': 'pagedown',
            'UP': 'up',
            'DOWN': 'down',
            'LEFT': 'left',
            'RIGHT': 'right',
        }
        
        key_upper = key.upper()
        
        if key_upper in special_keys_map:
            pyautogui.press(special_keys_map[key_upper])
        else:
            if ENABLE_LOGGING:
                self.log(f"⚠️  未知按键: {key}")
    
    def handle_text(self, content: str):
        """处理文本内容（使用剪贴板粘贴）"""
        try:
            # 保存当前剪贴板内容
            old_clipboard = pyperclip.paste()
            # 将文本复制到剪贴板
            pyperclip.copy(content)
            # 模拟 Ctrl+V 粘贴
            pyautogui.hotkey('ctrl', 'v')
            # 短暂延迟确保粘贴完成
            import time
            time.sleep(0.05)
            # 恢复剪贴板
            pyperclip.copy(old_clipboard)
        except Exception as e:
            if ENABLE_LOGGING:
                self.log(f"❌ 文本输入错误: {e}")
    
    async def start_server(self):
        """启动 WebSocket 服务器"""
        ip = self.get_local_ip()
        self.is_running = True
        
        self.log("=" * 60)
        self.log("  🚀 AirTouch Server")
        self.log("=" * 60)
        self.log(f"  📡 局域网地址: {ip}:{self.port}")
        self.log(f"  🔗 WebSocket: ws://{ip}:{self.port}")
        self.log("=" * 60)
        self.log("  ✅ 服务器运行中，等待客户端连接...")
        self.log("  💡 提示：")
        self.log("     • 仅允许一个客户端连接")
        self.log("     • 支持二进制协议（低延迟鼠标移动）")
        self.log("     • 手机和电脑需在同一局域网")
        self.log("     • 检查防火墙是否允许端口 8765")
        self.log("=" * 60)
        
        self.server = await websockets.serve(self.handle_client, self.host, self.port)
        
        try:
            while self.is_running:
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            pass  # 正常取消
        finally:
            try:
                self.server.close()
                await self.server.wait_closed()
            except:
                pass  # 忽略关闭时的错误
    
    def stop_server(self):
        """停止服务器"""
        self.is_running = False

class AirTouchGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("AirTouch PC Controller")
        self.root.geometry("700x750")
        self.root.resizable(False, False)
        
        # 设置窗口图标
        try:
            icon_path = get_resource_path('icon.ico')
            icon_img = Image.open(icon_path)
            icon_photo = ImageTk.PhotoImage(icon_img)
            self.root.iconphoto(True, icon_photo)
        except Exception as e:
            pass  # 如果图标加载失败，继续运行
        
        self.controller = None
        self.server_thread = None
        self.loop = None
        self.client_connected = False
        
        # 配置样式
        self.setup_styles()
        self.setup_ui()
        
    def setup_styles(self):
        """配置样式"""
        style = ttk.Style()
        style.theme_use('clam')
        
    def setup_ui(self):
        """设置UI界面"""
        # 标题栏
        title_frame = tk.Frame(self.root, bg="#1976D2", height=70)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(
            title_frame, 
            text="🚀 AirTouch PC Controller", 
            font=("Segoe UI", 20, "bold"),
            bg="#1976D2",
            fg="white"
        ) 
        title_label.pack(pady=18)
        
        # 主容器
        main_frame = tk.Frame(self.root, padx=25, pady=20, bg="#f8f9fa")
        main_frame.pack(fill=tk.BOTH, expand=True)
        self.root.configure(bg="#f8f9fa")
        
        # 服务器信息卡片（单行显示）
        info_card = tk.Frame(main_frame, bg="white", relief=tk.FLAT, bd=0)
        info_card.pack(fill=tk.X, pady=(0, 15))
        
        info_inner = tk.Frame(info_card, bg="white", padx=20, pady=12)
        info_inner.pack(fill=tk.BOTH, expand=True)
        
        # 单行状态显示
        status_row = tk.Frame(info_inner, bg="white")
        status_row.pack(fill=tk.X)
        
        # IP地址
        tk.Label(
            status_row, 
            text="📡 IP:", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#666"
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        self.ip_label = tk.Label(
            status_row, 
            text="未启动", 
            font=("Segoe UI", 10, "bold"),
            bg="white",
            fg="#333"
        )
        self.ip_label.pack(side=tk.LEFT, padx=(0, 20))
        
        # 分隔符
        tk.Label(
            status_row, 
            text="|", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#ddd"
        ).pack(side=tk.LEFT, padx=(0, 20))
        
        # 状态
        tk.Label(
            status_row, 
            text="状态:", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#666"
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        self.status_label = tk.Label(
            status_row, 
            text="● 未运行", 
            font=("Segoe UI", 10, "bold"),
            bg="white",
            fg="#dc3545"
        )
        self.status_label.pack(side=tk.LEFT, padx=(0, 20))
        
        # 分隔符
        tk.Label(
            status_row, 
            text="|", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#ddd"
        ).pack(side=tk.LEFT, padx=(0, 20))
        
        # 客户端连接状态
        tk.Label(
            status_row, 
            text="客户端:", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#666"
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        self.client_label = tk.Label(
            status_row, 
            text="未连接", 
            font=("Segoe UI", 10),
            bg="white",
            fg="#999"
        )
        self.client_label.pack(side=tk.LEFT)
        
        # 二维码和按钮组合区域
        qr_button_card = tk.Frame(main_frame, bg="white", relief=tk.FLAT, bd=0)
        qr_button_card.pack(fill=tk.X, pady=(0, 15))
        
        qr_button_inner = tk.Frame(qr_button_card, bg="white", padx=20, pady=15)
        qr_button_inner.pack(fill=tk.BOTH, expand=True)
        
        # 左侧：二维码区域
        qr_left = tk.Frame(qr_button_inner, bg="white")
        qr_left.pack(side=tk.LEFT, padx=(0, 20))
        
        qr_title = tk.Label(
            qr_left, 
            text="📱 扫描连接", 
            font=("Segoe UI", 11, "bold"),
            bg="white",
            fg="#333"
        )
        qr_title.pack(anchor=tk.W, pady=(0, 10))
        
        # 二维码容器（带边框）
        qr_container = tk.Frame(qr_left, bg="white", relief=tk.SOLID, bd=1, highlightbackground="#e0e0e0", highlightthickness=1)
        qr_container.pack()
        
        self.qr_label = tk.Label(
            qr_container, 
            text="启动服务器后\n显示二维码", 
            font=("Segoe UI", 9),
            fg="#999",
            bg="white",
            width=24,
            height=12,
            justify=tk.CENTER
        )
        self.qr_label.pack(padx=15, pady=15)
        
        # 右侧：控制按钮和提示
        qr_right = tk.Frame(qr_button_inner, bg="white")
        qr_right.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 控制按钮标题
        btn_title = tk.Label(
            qr_right, 
            text="⚙️ 服务器控制", 
            font=("Segoe UI", 11, "bold"),
            bg="white",
            fg="#333"
        )
        btn_title.pack(anchor=tk.W, pady=(0, 10))
        
        # 启动按钮
        self.start_button = tk.Button(
            qr_right,
            text="▶  启动服务器",
            command=self.start_server,
            bg="#28a745",
            fg="white",
            font=("Segoe UI", 11, "bold"),
            height=2,
            cursor="hand2",
            relief=tk.FLAT,
            activebackground="#218838",
            activeforeground="white",
            bd=0
        )
        self.start_button.pack(fill=tk.X, pady=(0, 10))
        
        # 停止按钮
        self.stop_button = tk.Button(
            qr_right,
            text="⏹  停止服务器",
            command=self.stop_server,
            bg="#dc3545",
            fg="white",
            font=("Segoe UI", 11, "bold"),
            height=2,
            state=tk.DISABLED,
            cursor="hand2",
            relief=tk.FLAT,
            activebackground="#c82333",
            activeforeground="white",
            bd=0
        )
        self.stop_button.pack(fill=tk.X, pady=(0, 15))
        
        # 使用提示
        tips_frame = tk.Frame(qr_right, bg="#f0f8ff", relief=tk.FLAT, bd=0)
        tips_frame.pack(fill=tk.X)
        
        tips_inner = tk.Frame(tips_frame, bg="#f0f8ff", padx=12, pady=10)
        tips_inner.pack(fill=tk.X)
        
        tk.Label(
            tips_inner,
            text="💡 使用提示",
            font=("Segoe UI", 9, "bold"),
            bg="#f0f8ff",
            fg="#0066cc"
        ).pack(anchor=tk.W)
        
        tips_text = [
            "• 手机和电脑需在同一WiFi",
            "• 使用手机扫描二维码连接",
            "• 仅支持一个客户端连接"
        ]
        
        for tip in tips_text:
            tk.Label(
                tips_inner,
                text=tip,
                font=("Segoe UI", 8),
                bg="#f0f8ff",
                fg="#555",
                anchor=tk.W
            ).pack(anchor=tk.W, pady=1)
        

        
        # 日志卡片
        log_card = tk.Frame(main_frame, bg="white", relief=tk.FLAT, bd=0)
        log_card.pack(fill=tk.BOTH, expand=True)
        
        log_inner = tk.Frame(log_card, bg="white", padx=20, pady=15)
        log_inner.pack(fill=tk.BOTH, expand=True)
        
        log_title = tk.Label(
            log_inner, 
            text="📋 运行日志", 
            font=("Segoe UI", 11, "bold"),
            bg="white",
            fg="#333"
        )
        log_title.pack(anchor=tk.W, pady=(0, 10))
        
        self.log_text = scrolledtext.ScrolledText(
            log_inner,
            height=16,
            font=("Consolas", 9),
            bg="#f8f9fa",
            fg="#333",
            wrap=tk.WORD,
            relief=tk.FLAT,
            bd=1,
            padx=10,
            pady=10
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # 底部信息
        footer_frame = tk.Frame(self.root, bg="#f8f9fa", height=35)
        footer_frame.pack(fill=tk.X)
        footer_frame.pack_propagate(False)
        
        footer = tk.Label(
            footer_frame,
            text="AirTouch v1.0  |  确保手机和电脑在同一局域网  |  默认端口: 8765",
            font=("Segoe UI", 8),
            fg="#999",
            bg="#f8f9fa"
        )
        footer.pack(pady=10)
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def log(self, message: str):
        """添加日志"""
        # 处理特殊消息（客户端连接状态）
        if message.startswith("CLIENT_CONNECTED:"):
            ip = message.split(":")[1]
            self.client_label.config(text=f"✓ 已连接 ({ip})", fg="#28a745")
            self.client_connected = True
            return
        elif message == "CLIENT_DISCONNECTED":
            self.client_label.config(text="未连接", fg="#999")
            self.client_connected = False
            return
        
        # 正常日志输出
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update()
    
    def start_server(self):
        """启动服务器"""
        self.start_button.config(state=tk.DISABLED, bg="#6c757d")
        self.stop_button.config(state=tk.NORMAL, bg="#dc3545")
        self.status_label.config(text="● 运行中", fg="#28a745")
        
        # 创建控制器
        self.controller = PCController(log_callback=self.log)
        ip = self.controller.get_local_ip()
        self.ip_label.config(text=f"{ip}:8765")
        
        # 生成并显示二维码
        try:
            qr_img = self.controller.generate_qrcode(ip)
            qr_img = qr_img.resize((200, 200), Image.Resampling.LANCZOS)
            qr_photo = ImageTk.PhotoImage(qr_img)
            self.qr_label.config(
                image=qr_photo, 
                text="",
                bg="white",
                width=200,
                height=200
            )
            self.qr_label.image = qr_photo
        except Exception as e:
            self.log(f"❌ 二维码生成失败: {e}")
        
        # 清空日志
        self.log_text.delete(1.0, tk.END)
        
        # 在新线程中启动服务器
        self.server_thread = threading.Thread(target=self.run_server, daemon=True)
        self.server_thread.start()
    
    def run_server(self):
        """在线程中运行服务器"""
        try:
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            self.loop.run_until_complete(self.controller.start_server())
        except asyncio.CancelledError:
            pass  # 正常取消，不报错
        except Exception as e:
            # 忽略事件循环停止的错误
            if "Event loop stopped" not in str(e):
                self.log(f"❌ 服务器错误: {e}")
        finally:
            # 清理所有待处理的任务
            try:
                if not self.loop.is_closed():
                    pending = asyncio.all_tasks(self.loop)
                    for task in pending:
                        task.cancel()
                    if pending:
                        self.loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
                    self.loop.close()
            except:
                pass
    
    def stop_server(self):
        """停止服务器"""
        # 先停止控制器
        if self.controller:
            self.controller.stop_server()
        
        # 停止事件循环
        if self.loop and not self.loop.is_closed():
            try:
                # 使用线程安全的方式停止循环
                if self.loop.is_running():
                    self.loop.call_soon_threadsafe(self.loop.stop)
            except:
                pass
        
        # 等待服务器线程结束
        if self.server_thread and self.server_thread.is_alive():
            self.server_thread.join(timeout=3)
        
        # 更新UI状态
        self.start_button.config(state=tk.NORMAL, bg="#28a745")
        self.stop_button.config(state=tk.DISABLED, bg="#6c757d")
        self.status_label.config(text="● 已停止", fg="#dc3545")
        self.client_label.config(text="未连接", fg="#999")
        self.ip_label.config(text="未启动")
        
        # 清除二维码
        self.qr_label.config(
            image="",
            text="启动服务器后\n显示二维码",
            bg="white",
            width=24,
            height=12
        )
        
        self.log("👋 服务器已停止")
    
    def on_closing(self):
        """关闭窗口"""
        if self.stop_button['state'] == tk.NORMAL:
            self.stop_server()
        self.root.destroy()
    
    def run(self):
        """运行GUI"""
        self.root.mainloop()

def main():
    """主函数"""
    app = AirTouchGUI()
    app.run()

if __name__ == '__main__':
    main()
