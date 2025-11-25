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
  const lastClickTime = useRef<number>(0);
  
  // 多指手势状态
  const gestureState = useRef<{
    fingers: number;
    startDistance: number;
    lastDistance: number;
    startPositions: Array<{x: number, y: number}>;
    lastPositions: Array<{x: number, y: number}>;
  } | null>(null);

  const calculateDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchPositions = (touches: TouchList) => {
    return Array.from(touches).map(t => ({ x: t.clientX, y: t.clientY }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const fingerCount = e.touches.length;
    
    if (fingerCount === 1) {
      // 单指：鼠标移动
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
    } else if (fingerCount >= 2) {
      // 多指手势
      gestureState.current = {
        fingers: fingerCount,
        startDistance: calculateDistance(e.touches),
        lastDistance: calculateDistance(e.touches),
        startPositions: getTouchPositions(e.touches),
        lastPositions: getTouchPositions(e.touches)
      };
      setActive(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const fingerCount = e.touches.length;

    if (fingerCount === 1 && prevPos.current && !gestureState.current) {
      // 单指移动：鼠标移动
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
    } else if (fingerCount >= 2 && gestureState.current) {
      // 多指手势
      const currentPositions = getTouchPositions(e.touches);
      const avgDx = currentPositions.reduce((sum, pos, i) => 
        sum + (pos.x - gestureState.current!.lastPositions[i]?.x || 0), 0) / fingerCount;
      const avgDy = currentPositions.reduce((sum, pos, i) => 
        sum + (pos.y - gestureState.current!.lastPositions[i]?.y || 0), 0) / fingerCount;

      if (fingerCount === 2) {
        // 双指手势
        const currentDistance = calculateDistance(e.touches);
        const distanceChange = currentDistance - gestureState.current.lastDistance;

        if (Math.abs(distanceChange) > 5) {
          // 捏合/放大手势
          onScroll(distanceChange > 0 ? 3 : -3); // Ctrl+滚轮缩放
        } else if (Math.abs(avgDy) > Math.abs(avgDx) && Math.abs(avgDy) > 2) {
          // 双指上下滑动：滚动
          onScroll(avgDy * 0.5);
        }

        gestureState.current.lastDistance = currentDistance;
      } else if (fingerCount === 3) {
        // 三指手势
        if (Math.abs(avgDy) > Math.abs(avgDx) && Math.abs(avgDy) > 10) {
          // 三指上下滑动
          if (avgDy < 0) {
            // 三指上滑：任务视图 (Win+Tab)
            onScroll(-999); // 特殊值表示 Win+Tab
          } else {
            // 三指下滑：显示桌面 (Win+D)
            onScroll(999); // 特殊值表示 Win+D
          }
          gestureState.current = null; // 手势完成，重置
        } else if (Math.abs(avgDx) > Math.abs(avgDy) && Math.abs(avgDx) > 10) {
          // 三指左右滑动：切换任务 (Alt+Tab)
          if (avgDx > 0) {
            onScroll(888); // 特殊值表示 Alt+Tab (下一个)
          } else {
            onScroll(-888); // 特殊值表示 Alt+Shift+Tab (上一个)
          }
          gestureState.current = null;
        }
      }

      gestureState.current.lastPositions = currentPositions;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setActive(false);
      prevPos.current = null;
      gestureState.current = null;
      setCursorParams(p => ({ ...p, visible: false }));
    } else if (e.touches.length === 1) {
      // 还剩一个手指，重置为单指模式
      gestureState.current = null;
      const touch = e.touches[0];
      prevPos.current = { x: touch.clientX, y: touch.clientY };
    }
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
    handleTouchEnd(e);
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

      <div className="h-24 flex gap-4">
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
          左键
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
          右键
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-500 pb-2">
        <p>💡 双指滑动滚动 · 三指上滑任务视图 · 三指下滑显示桌面</p>
      </div>
    </div>
  );
};

export default TouchPad;
