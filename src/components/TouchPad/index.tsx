import React, { useRef, useState } from 'react';
import { MOUSE_SENSITIVITY, TAP_THRESHOLD_DISTANCE, TAP_THRESHOLD_TIME } from '../../constants';
import { MouseButton, MouseData } from '../../types';

interface TouchPadProps {
  onMove: (data: MouseData) => void;
  onClick: (btn: MouseButton) => void;
  onScroll: (dy: number) => void;
}

const TouchPad: React.FC<TouchPadProps> = ({ onMove, onClick, onScroll }) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const prevPos = useRef<{ x: number, y: number } | null>(null);
  const [cursorParams, setCursorParams] = useState({ x: 0, y: 0, visible: false });
  const tapStartRef = useRef<{time: number, x: number, y: number} | null>(null);
  const lastScrollY = useRef<number | null>(null);
  const lastClickTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    prevPos.current = { x: touch.clientX, y: touch.clientY };
    setActive(true);
    
    const rect = padRef.current?.getBoundingClientRect();
    if(rect) {
      setCursorParams({ 
        x: touch.clientX - rect.left, 
        y: touch.clientY - rect.top, 
        visible: true 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!prevPos.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - prevPos.current.x;
    const dy = touch.clientY - prevPos.current.y;

    onMove({ dx: dx * MOUSE_SENSITIVITY, dy: dy * MOUSE_SENSITIVITY });

    prevPos.current = { x: touch.clientX, y: touch.clientY };

    const rect = padRef.current?.getBoundingClientRect();
    if(rect) {
      setCursorParams({ 
        x: touch.clientX - rect.left, 
        y: touch.clientY - rect.top, 
        visible: true 
      });
    }
  };

  const handleTouchEnd = () => {
    setActive(false);
    prevPos.current = null;
    setCursorParams(p => ({ ...p, visible: false }));
  };

  const handleTapStart = (e: React.TouchEvent) => {
    handleTouchStart(e);
    tapStartRef.current = {
      time: Date.now(),
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTapEnd = (e: React.TouchEvent) => {
    handleTouchEnd();
    if (tapStartRef.current) {
      const dt = Date.now() - tapStartRef.current.time;
      const touch = e.changedTouches[0];
      const dist = Math.sqrt(
        Math.pow(touch.clientX - tapStartRef.current.x, 2) + 
        Math.pow(touch.clientY - tapStartRef.current.y, 2)
      );

      if (dt < TAP_THRESHOLD_TIME && dist < TAP_THRESHOLD_DISTANCE) {
        onClick(MouseButton.LEFT);
      }
    }
  };

  const handleScrollMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (lastScrollY.current !== null) {
      const dy = touch.clientY - lastScrollY.current;
      onScroll(dy);
    }
    lastScrollY.current = touch.clientY;
  };
  
  const handleScrollEnd = () => {
    lastScrollY.current = null;
  };

  return (
    <div className="flex flex-col h-full w-full gap-4 p-4">
      <div 
        ref={padRef}
        className={`flex-1 relative rounded-3xl border border-gray-700 bg-gray-800/50 backdrop-blur-md overflow-hidden transition-colors duration-200 ${active ? 'border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]' : ''}`}
        onTouchStart={handleTapStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTapEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-gray-500 font-mono text-sm tracking-widest">触控区域</span>
        </div>

        {cursorParams.visible && (
          <>
            <div 
              className="absolute w-12 h-12 rounded-full bg-neon-blue/20 blur-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: cursorParams.x, top: cursorParams.y }}
            />
            <div 
              className="absolute w-4 h-4 rounded-full bg-neon-blue pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-neon-blue"
              style={{ left: cursorParams.x, top: cursorParams.y }}
            />
          </>
        )}
      </div>

      <div className="h-32 flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <button 
            className="flex-1 bg-gray-750 active:bg-neon-blue/20 active:border-neon-blue border border-gray-700 rounded-xl flex items-center justify-center font-bold text-gray-400 transition-all active:scale-95 touch-manipulation"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              const now = Date.now();
              if (now - lastClickTime.current > 150) {
                lastClickTime.current = now;
                onClick(MouseButton.LEFT);
              }
            }}
          >
            L
          </button>
          <button 
            className="flex-1 bg-gray-750 active:bg-neon-blue/20 active:border-neon-blue border border-gray-700 rounded-xl flex items-center justify-center font-bold text-gray-400 transition-all active:scale-95 touch-manipulation"
            onTouchStart={(e) => { 
              e.preventDefault(); 
              const now = Date.now();
              if (now - lastClickTime.current > 150) {
                lastClickTime.current = now;
                onClick(MouseButton.RIGHT);
              }
            }}
          >
            R
          </button>
        </div>

        <div 
          className="w-16 bg-gray-900 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden active:border-neon-green/50"
          onTouchStart={(e) => { lastScrollY.current = e.touches[0].clientY; }}
          onTouchMove={handleScrollMove}
          onTouchEnd={handleScrollEnd}
          style={{ touchAction: 'none' }}
        >
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          <div className="space-y-3 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-1 bg-gray-400 rounded-full" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default TouchPad;
