import React from 'react';
import { Wifi } from 'lucide-react';
import { ConnectionState } from '../../types';

interface HeaderProps {
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ connectionState, onConnect, onDisconnect }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connectionState === ConnectionState.CONNECTED ? 'bg-neon-green shadow-[0_0_8px_#0aff0a]' : 'bg-red-500'}`} />
        <h1 className="font-bold text-lg tracking-wide text-gray-200">
          AirTouch <span className="text-xs font-normal text-gray-500">v1.0</span>
        </h1>
      </div>
      
      <button
        onClick={connectionState === ConnectionState.CONNECTED ? onDisconnect : onConnect}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
          connectionState === ConnectionState.CONNECTED 
            ? 'bg-neon-green/10 text-neon-green border-neon-green/30' 
            : connectionState === ConnectionState.CONNECTING 
              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
        }`}
      >
        {connectionState === ConnectionState.CONNECTED ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>已连接</span>
          </>
        ) : connectionState === ConnectionState.CONNECTING ? (
          <span className="animate-pulse">连接中...</span>
        ) : (
          <>
            <Wifi className="w-3 h-3" />
            <span>连接</span>
          </>
        )}
      </button>
    </header>
  );
};

export default Header;
