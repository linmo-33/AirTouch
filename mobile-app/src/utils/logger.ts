type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;
    private listeners: Set<(logs: LogEntry[]) => void> = new Set();
    private enabled = true; // 始终启用，因为日志很轻量

    log(level: LogLevel, message: string) {
        if (!this.enabled) return;

        const entry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            level,
            message,
        };

        this.logs.push(entry);

        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 只在有监听器时通知（避免不必要的数组复制）
        if (this.listeners.size > 0) {
            this.listeners.forEach(listener => listener([...this.logs]));
        }

        // 开发环境输出到控制台
        if (__DEV__) {
            console.log(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`);
        }
    }

    info(message: string) {
        this.log('info', message);
    }

    warn(message: string) {
        this.log('warn', message);
    }

    error(message: string) {
        this.log('error', message);
    }

    debug(message: string) {
        this.log('debug', message);
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    clear() {
        this.logs = [];
        this.listeners.forEach(listener => listener([]));
    }

    subscribe(listener: (logs: LogEntry[]) => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

export const logger = new Logger();
export type { LogEntry, LogLevel };

