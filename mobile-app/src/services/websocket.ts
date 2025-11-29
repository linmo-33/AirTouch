import { logger } from "../utils/logger";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

class WebSocketService {
  private socket: WebSocket | null = null;
  private ip: string = "";
  private useBinaryProtocol: boolean = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectOnClose: boolean = true;

  async connect(
    ip: string,
    onStatusChange: (status: ConnectionState) => void
  ): Promise<boolean> {
    this.ip = ip;
    logger.info(`开始连接 WebSocket: ws://${ip}:8765`);
    onStatusChange("connecting");

    try {
      this.socket = new WebSocket(`ws://${this.ip}:8765`);
      this.socket.binaryType = "arraybuffer";
      logger.debug("WebSocket 实例已创建，等待连接...");

      return new Promise((resolve) => {
        if (!this.socket) {
          logger.error("WebSocket 实例创建失败");
          return resolve(false);
        }

        // 设置连接超时
        const timeout = setTimeout(() => {
          logger.error("连接超时（5秒）");
          if (this.socket) {
            this.socket.close();
          }
          onStatusChange("error");
          resolve(false);
        }, 5000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          logger.info("WebSocket 连接成功");
          this.reconnectOnClose = true;
          this.startHeartbeat();
          onStatusChange("connected");
          resolve(true);
        };

        this.socket.onerror = (err) => {
          clearTimeout(timeout);
          logger.error(`WebSocket 错误: ${JSON.stringify(err)}`);
          onStatusChange("error");
          resolve(false);
        };

        this.socket.onclose = (event) => {
          clearTimeout(timeout);
          this.stopHeartbeat();
          logger.warn(
            `WebSocket 关闭 - Code: ${event.code}, Reason: ${
              event.reason || "无"
            }`
          );
          if (this.reconnectOnClose) {
            onStatusChange("disconnected");
          }
        };
      });
    } catch (e) {
      logger.error(`连接异常: ${e}`);
      onStatusChange("error");
      return false;
    }
  }

  disconnect() {
    this.reconnectOnClose = false;
    this.stopHeartbeat();
    if (this.socket) {
      logger.info("主动断开连接");
      this.socket.close();
    }
    this.socket = null;
  }

  private sendBinaryMouseMove(dx: number, dy: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const buffer = new ArrayBuffer(5);
      const view = new DataView(buffer);

      view.setUint8(0, 1);
      view.setInt16(1, Math.round(dx), false);
      view.setInt16(3, Math.round(dy), false);

      this.socket.send(buffer);
    }
  }

  private send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  sendMouseMovement(dx: number, dy: number) {
    if (this.useBinaryProtocol) {
      this.sendBinaryMouseMove(dx, dy);
    } else {
      this.send({ type: "move", dx, dy });
    }
  }

  sendScroll(dy: number) {
    this.send({ type: "scroll", dy: Math.round(dy) });
  }

  sendClick(button: string) {
    this.send({ type: "click", button: button.toLowerCase() });
  }

  sendKeyDown(key: string) {
    this.send({ type: "keydown", key });
  }

  sendText(content: string) {
    this.send({ type: "text", content });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    // 每30秒发送一次心跳，保持连接活跃
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.send({ type: "ping" });
          logger.debug("发送心跳");
        } catch (e) {
          logger.error(`心跳发送失败: ${e}`);
        }
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const websocketService = new WebSocketService();
