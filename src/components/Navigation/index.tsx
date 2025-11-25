import React from 'react';
import { MousePointer2, Keyboard as KeyboardIcon, Sparkles } from 'lucide-react';
import { ControlMode } from '../../types';

interface NavigationProps {
  mode: ControlMode;
  onModeChange: (mode: ControlMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ mode, onModeChange }) => {
  return (
    <nav className="h-20 px-6 pb-4 pt-2 border-t border-gray-800 bg-gray-900 flex justify-around items-center">
      <button 
        onClick={() => onModeChange(ControlMode.TRACKPAD)}
        className={`flex flex-col items-center gap-1 transition-colors ${mode === ControlMode.TRACKPAD ? 'text-neon-blue' : 'text-gray-600 hover:text-gray-400'}`}
      >
        <MousePointer2 className="w-6 h-6" />
        <span className="text-[10px] font-bold tracking-wider">鼠标</span>
      </button>

      <button 
        onClick={() => onModeChange(ControlMode.KEYBOARD)}
        className={`flex flex-col items-center gap-1 transition-colors ${mode === ControlMode.KEYBOARD ? 'text-neon-green' : 'text-gray-600 hover:text-gray-400'}`}
      >
        <KeyboardIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold tracking-wider">键盘</span>
      </button>

      <button 
        onClick={() => onModeChange(ControlMode.AI_COMMAND)}
        className={`flex flex-col items-center gap-1 transition-colors ${mode === ControlMode.AI_COMMAND ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
      >
        <Sparkles className="w-6 h-6" />
        <span className="text-[10px] font-bold tracking-wider">AI 控制</span>
      </button>
    </nav>
  );
};

export default Navigation;
