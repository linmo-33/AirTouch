import { MACRO_DELAY } from '../constants';
import { websocketService } from '../services';
import { MouseButton, MouseData } from '../types';
import { delay } from '../utils';

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

    const handleAIMacro = async (macros: string[]) => {
        for (const macro of macros) {
            await delay(MACRO_DELAY);
            handleText(macro);
        }
    };

    return {
        handleMouseMove,
        handleMouseClick,
        handleScroll,
        handleType,
        handleKeyDown,
        handleText,
        handleAIMacro
    };
};
