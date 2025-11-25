import { DEFAULT_SERVER_PORT, SCROLL_SENSITIVITY } from '../constants';
import { ConnectionState } from '../types';

class WebsocketService {
    private socket: WebSocket | null = null;
    private ip: string = '';

    async connect(ip: string, onStatusChange: (status: ConnectionState) => void): Promise<boolean> {
        this.ip = ip;
        onStatusChange(ConnectionState.CONNECTING);

        try {
            this.socket = new WebSocket(`ws://${this.ip}:${DEFAULT_SERVER_PORT}`);

            return new Promise((resolve) => {
                if (!this.socket) return resolve(false);

                this.socket.onopen = () => {
                    console.log('WebSocket Connected');
                    onStatusChange(ConnectionState.CONNECTED);
                    resolve(true);
                };

                this.socket.onerror = (err) => {
                    console.error('WebSocket Error', err);
                    onStatusChange(ConnectionState.ERROR);
                    resolve(false);
                };

                this.socket.onclose = () => {
                    console.log('WebSocket Closed');
                    onStatusChange(ConnectionState.DISCONNECTED);
                };
            });
        } catch (e) {
            console.error(e);
            onStatusChange(ConnectionState.ERROR);
            return false;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.socket = null;
    }

    private send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    sendMouseMovement(dx: number, dy: number) {
        this.send({ type: 'move', dx, dy });
    }

    sendScroll(dy: number) {
        this.send({ type: 'scroll', dy: dy * SCROLL_SENSITIVITY });
    }

    sendClick(button: string) {
        this.send({ type: 'click', button: button.toLowerCase() });
    }

    sendKey(key: string) {
        this.send({ type: 'type', key });
    }

    sendKeyDown(key: string) {
        this.send({ type: 'keydown', key });
    }

    sendText(content: string) {
        this.send({ type: 'text', content });
    }
}

export const websocketService = new WebsocketService();
