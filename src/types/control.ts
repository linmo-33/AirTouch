export enum ControlMode {
    TRACKPAD = 'TRACKPAD',
    KEYBOARD = 'KEYBOARD',
    AI_COMMAND = 'AI_COMMAND'
}

export interface MouseData {
    dx: number;
    dy: number;
}

export interface ScrollData {
    dy: number;
}

export enum MouseButton {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    MIDDLE = 'MIDDLE'
}

export interface AICommandResponse {
    actionDescription: string;
    macros: string[];
}
