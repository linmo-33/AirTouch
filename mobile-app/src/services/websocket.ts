type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

class WebSocketService {
  private socket: WebSocket | null = null;
  private ip: string = "";
  private useBinaryProtocol: boolean = true;

  async connect(
    ip: string,
    onStatusChange: (status: ConnectionState) => void
  ): Promise<boolean> {
    this.ip = ip;
    onStatusChange("connecting");

    try {
      this.socket = new WebSocket(`ws://${this.ip}:8765`);
      this.socket.binaryType = "arraybuffer";

      return new Promise((resolve) => {
        if (!this.socket) return resolve(false);

        this.socket.onopen = () => {
          console.log("WebSocket Connected (Binary Protocol)");
          onStatusChange("connected");
          resolve(true);
        };

        this.socket.onerror = (err) => {
          console.error("WebSocket Error", err);
          onStatusChange("error");
          resolve(false);
        };

        this.socket.onclose = () => {
          console.log("WebSocket Closed");
          onStatusChange("disconnected");
        };
      });
    } catch (e) {
      console.error(e);
      onStatusChange("error");
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
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
}

export const websocketService = new WebSocketService();
