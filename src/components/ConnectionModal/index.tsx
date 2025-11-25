import { Html5Qrcode } from 'html5-qrcode';
import { Keyboard, MonitorSmartphone, QrCode, Wifi, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanError, setScanError] = useState<string>('');

  useEffect(() => {
    if (showScanner) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const startScanner = async () => {
    try {
      setScanError('');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onIpChange(decodedText.trim());
          setShowScanner(false);
        },
        () => {
          // 扫描失败，忽略
        }
      );
    } catch (err) {
      setScanError('无法启动摄像头，请检查权限设置');
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
      scannerRef.current = null;
    }
  };

  if (connectionState === ConnectionState.CONNECTED) return null;

  if (showScanner) {
    return (
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
          <button onClick={() => setShowScanner(false)} className="absolute right-4 top-4 text-gray-500 hover:text-white z-10">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-neon-blue" />
            扫描二维码
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            对准电脑终端显示的二维码
          </p>
          {scanError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              {scanError}
            </div>
          )}
          <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-neon-blue"></div>
        </div>
      </div>
    );
  }

  if (showIpInput) {
    return (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MonitorSmartphone className="w-6 h-6 text-neon-blue" />
            连接到电脑
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            请确保 Python 服务器已在电脑上运行
          </p>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 bg-gray-800 border border-gray-700 text-white font-medium py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              扫码
            </button>
            <div className="flex-1 bg-gray-800 border border-neon-blue text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2">
              <Keyboard className="w-5 h-5" />
              手动输入
            </div>
          </div>

          <input 
            type="text" 
            value={serverIp}
            onChange={(e) => onIpChange(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-mono mb-4 focus:border-neon-blue outline-none"
            placeholder="例如: 192.168.1.5"
          />
          <button 
            onClick={onConnect}
            disabled={!serverIp.trim()}
            className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            连接
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

  if (connectionState === ConnectionState.CONNECTING) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-950/80 backdrop-blur-sm z-20">
        <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-neon-blue shadow-2xl animate-pulse">
          <Wifi className="w-10 h-10 text-neon-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2">正在连接...</h2>
        <p className="text-gray-400 text-sm">连接到 {serverIp}</p>
      </div>
    );
  }

  if (connectionState === ConnectionState.ERROR) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-950/80 backdrop-blur-sm z-20">
        <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-red-500 shadow-2xl">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-red-500">连接失败</h2>
        <p className="text-gray-400 mb-6 max-w-xs text-sm">
          无法连接到 {serverIp}，请检查：<br/>
          • 服务器是否运行<br/>
          • IP 地址是否正确<br/>
          • 设备是否在同一局域网
        </p>
        <button 
          onClick={onShowInput}
          className="w-full max-w-xs py-4 font-bold rounded-xl transition-colors shadow-lg bg-neon-blue text-black hover:bg-cyan-400"
        >
          重新连接
        </button>
      </div>
    );
  }

  return null;
};

export default ConnectionModal;
