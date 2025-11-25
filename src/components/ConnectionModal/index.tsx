import React from 'react';
import { X, MonitorSmartphone, Wifi } from 'lucide-react';
import { ConnectionState } from '../../types';

interface ConnectionModalProps {
  showIpInput: boolean;
  serverIp: string;
  connectionState: ConnectionState;
  onClose: () => void;
  onIpChange: (ip: string) => void;
  onConnect: () => void;
  onShowInput: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  showIpInput,
  serverIp,
  connectionState,
  onClose,
  onIpChange,
  onConnect,
  onShowInput
}) => {
  if (connectionState === ConnectionState.CONNECTED) return null;

  if (showIpInput) {
    return (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MonitorSmartphone className="w-6 h-6 text-neon-blue" />
            输入电脑 IP 地址
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            请确保 Python 服务器已在电脑上运行
          </p>
          <input 
            type="text" 
            value={serverIp}
            onChange={(e) => onIpChange(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-mono mb-4 focus:border-neon-blue outline-none"
            placeholder="例如: 192.168.1.5"
          />
          <button 
            onClick={onConnect}
            className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            通过 WiFi 连接
          </button>
        </div>
      </div>
    );
  }

  if (connectionState === ConnectionState.DISCONNECTED) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-950/80 backdrop-blur-sm z-20">
        <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-800 shadow-2xl">
          <Wifi className="w-10 h-10 text-neon-blue" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">连接到电脑</h2>
        
        <p className="text-gray-400 mb-6 max-w-xs text-sm">
          在电脑上运行 Python 服务器，输入 IP 地址，通过 WiFi 进行控制
        </p>

        <button 
          onClick={onShowInput}
          className="w-full max-w-xs py-4 font-bold rounded-xl transition-colors shadow-lg bg-neon-blue text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
        >
          连接服务器
        </button>
      </div>
    );
  }

  return null;
};

export default ConnectionModal;
