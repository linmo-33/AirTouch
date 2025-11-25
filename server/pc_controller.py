#!/usr/bin/env python3
"""
AirTouch PC Controller Server
WebSocket server that receives commands from the mobile app and controls the PC
"""

import asyncio
import json
import socket
from typing import Dict, Any, Set
import websockets
import pyautogui
import pyperclip
import qrcode

# 配置 PyAutoGUI
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.01

# 日志开关
ENABLE_LOGGING = False

class PCController:
    def __init__(self, host='0.0.0.0', port=8765):
        self.host = host
        self.port = port
        self.clients: Set = set()
        
    def get_local_ip(self) -> str:
        """获取本机局域网 IP 地址"""
        try:
            # 连接到局域网网关获取本地 IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("192.168.1.1", 80))
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
    
    def generate_qrcode(self, url: str):
        """生成二维码并在终端显示"""
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make()
        qr.print_ascii(invert=True)
    
    async def handle_client(self, websocket):
        """处理客户端连接"""
        client_ip = websocket.remote_address[0]
        self.clients.add(websocket)
        print(f"✅ 客户端已连接: {client_ip}")
        
        try:
            async for message in websocket:
                await self.process_command(message)
        except websockets.exceptions.ConnectionClosed:
            if ENABLE_LOGGING:
                print(f"🔌 客户端断开: {client_ip}")
        except Exception as e:
            if ENABLE_LOGGING:
                print(f"❌ 错误: {e}")
        finally:
            self.clients.remove(websocket)
    
    async def process_command(self, message: str):
        """处理客户端命令"""
        try:
            data: Dict[str, Any] = json.loads(message)
            cmd_type = data.get('type')
            
            if cmd_type == 'move':
                dx = data.get('dx', 0)
                dy = data.get('dy', 0)
                pyautogui.moveRel(dx, dy)
                
            elif cmd_type == 'click':
                button = data.get('button', 'left')
                pyautogui.click(button=button)
                if ENABLE_LOGGING:
                    print(f"👆 点击: {button}")
                
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
                print(f"❌ 错误: {e}")
    
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
            if ENABLE_LOGGING:
                print(f"⌨️  按键: {key_upper}")
        else:
            if ENABLE_LOGGING:
                print(f"⚠️  未知按键: {key}")
    
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
            if ENABLE_LOGGING:
                print(f"📝 文本: '{content}'")
        except Exception as e:
            if ENABLE_LOGGING:
                print(f"❌ 文本输入错误: {e}")
    
    async def start_server(self):
        """启动 WebSocket 服务器"""
        ip = self.get_local_ip()
        ws_url = f"ws://{ip}:{self.port}"
        
        print("=" * 60)
        print("  🚀 AirTouch Server")
        print("=" * 60)
        print(f"  📡 局域网地址: {ip}:{self.port}")
        print(f"  🔗 WebSocket: {ws_url}")
        print("=" * 60)
        print("\n  📱 扫描二维码连接:")
        print()
        
        # 生成并显示二维码
        self.generate_qrcode(ip)
        
        print()
        print("=" * 60)
        print("  ✅ 服务器运行中，等待客户端连接...")
        print("  💡 提示：手机和电脑需在同一局域网")
        print("  ⛔ 按 Ctrl+C 停止服务器")
        print("=" * 60)
        
        async with websockets.serve(self.handle_client, self.host, self.port):
            await asyncio.Future()

def main():
    """主函数"""
    controller = PCController()
    
    try:
        asyncio.run(controller.start_server())
    except KeyboardInterrupt:
        print("\n\n👋 服务器已停止")
    except Exception as e:
        print(f"\n❌ 服务器错误: {e}")

if __name__ == '__main__':
    main()
