import { ArrowRight, Delete, Keyboard, Space } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface KeyboardControlProps {
  onType: (char: string) => void;
  onKeyDown?: (key: string) => void;
  onText?: (text: string) => void;
}

const KeyboardControl: React.FC<KeyboardControlProps> = ({ onType, onKeyDown, onText }) => {
  const [composing, setComposing] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastButtonClickTime = useRef<number>(0);
  const isComposing = useRef<boolean>(false);
  const lastSentText = useRef<string>('');
  const lastSentTime = useRef<number>(0);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 功能键点击（使用 keydown 消息）
  const handleFunctionKey = (key: string) => {
    const now = Date.now();
    if (now - lastButtonClickTime.current < 200) {
      return;
    }
    lastButtonClickTime.current = now;
    
    if (onKeyDown) {
      onKeyDown(key);
    } else {
      onType(key); // 兼容旧接口
    }
  };

  // 发送文本（带防抖）
  const sendText = (text: string) => {
    const now = Date.now();
    
    // 防止在 100ms 内发送相同的文本
    if (text === lastSentText.current && now - lastSentTime.current < 100) {
      console.log('[防抖] 跳过重复文本:', text);
      return;
    }
    
    lastSentText.current = text;
    lastSentTime.current = now;
    
    console.log('[发送文本]:', text);
    if (onText) {
      onText(text);
    } else {
      onType(text);
    }
  };

  // 处理输入法组合开始
  const handleCompositionStart = () => {
    console.log('[输入法] 组合开始');
    isComposing.current = true;
  };

  // 处理输入法组合更新（拼音输入中）
  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    const data = e.data;
    console.log('[输入法] 组合中:', data);
    setComposing(data);
  };

  // 处理输入法组合结束（选中中文后）
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const finalText = e.data;
    console.log('[输入法] 组合结束，最终文本:', finalText);
    
    isComposing.current = false;
    
    if (finalText) {
      sendText(finalText);
    }
    
    setComposing('');
    // 清空输入框
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }, 0);
  };

  // 处理直接输入（非输入法）
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    
    // 只处理非输入法的直接输入
    if (!isComposing.current && value) {
      console.log('[直接输入]:', value);
      sendText(value);
      
      // 清空输入框
      target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* 输入区域 - 固定在顶部 */}
      <div className="flex-shrink-0 p-4">
        <div 
          className={`w-full rounded-2xl border-2 p-6 flex flex-col items-center justify-center transition-all duration-300 ${isFocused ? 'border-neon-green bg-gray-800' : 'border-gray-600 bg-gray-900'}`}
          onClick={() => inputRef.current?.focus()}
        >
          <Keyboard className={`w-12 h-12 mb-3 ${isFocused ? 'text-neon-green' : 'text-gray-500'}`} />
          <h2 className="text-lg font-bold text-gray-300">
            {isFocused ? '输入模式已激活' : '点击开始输入'}
          </h2>
          <p className="text-gray-500 text-xs mt-1 text-center">
            {composing ? `输入中: ${composing}` : '在手机上输入的字符会实时发送到电脑'}
          </p>
        </div>
      </div>

      {/* 隐藏的输入框 */}
      <input
        ref={inputRef}
        type="text"
        className="fixed top-0 left-0 opacity-0 pointer-events-auto w-px h-px"
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* 功能键区域 - 可滚动 */}
      <div className="flex-1 flex flex-col justify-start p-4 pt-0 space-y-3 min-h-0">
        {/* 主要功能键 */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => handleFunctionKey('BACKSPACE')}
            className="p-3 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 touch-manipulation"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleFunctionKey('SPACE')}
            className="p-3 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 touch-manipulation"
          >
            <Space className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleFunctionKey('ENTER')}
            className="p-3 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg flex items-center justify-center active:bg-neon-green/30 touch-manipulation"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* 系统功能键 */}
        <div className="grid grid-cols-4 gap-2">
          {['Esc', 'Tab', 'Win', 'Alt'].map(key => (
            <button 
              key={key}
              onClick={() => handleFunctionKey(key.toUpperCase())}
              className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
            >
              {key}
            </button>
          ))}
        </div>

        {/* 方向键 */}
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button 
            onClick={() => handleFunctionKey('UP')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            ↑
          </button>
          <div></div>
          <button 
            onClick={() => handleFunctionKey('LEFT')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            ←
          </button>
          <button 
            onClick={() => handleFunctionKey('DOWN')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            ↓
          </button>
          <button 
            onClick={() => handleFunctionKey('RIGHT')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            →
          </button>
        </div>

        {/* 额外功能键 */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => handleFunctionKey('DELETE')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            Del
          </button>
          <button 
            onClick={() => handleFunctionKey('HOME')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            Home
          </button>
          <button 
            onClick={() => handleFunctionKey('END')}
            className="py-2.5 bg-gray-800 rounded-md text-xs font-mono border border-gray-700 active:bg-gray-700 touch-manipulation"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardControl;
