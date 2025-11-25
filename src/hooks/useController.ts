import { websocketService } from '../services';
import { MouseButton, MouseData } from '../types';

export const useController = () => {
    const handleMouseMove = (data: MouseData) => {
        websocketService.sendMouseMovement(data.dx, data.dy);
    };

    const handleMouseClick = (btn: MouseButton) => {
        websocketService.sendClick(btn.toString());
    };

    const handleScroll = (dy: number) => {
        websocketService.sendScroll(dy);
    };

    const handleType = (char: string) => {
        websocketService.sendKey(char);
    };

    const handleKeyDown = (key: string) => {
        websocketService.sendKeyDown(key);
    };

    const handleText = (text: string) => {
        websocketService.sendText(text);
    };

    return {
        handleMouseMove,
        handleMouseClick,
        handleScroll,
        handleType,
        handleKeyDown,
        handleText
    };
};
