import React, { useState } from 'react';
import AICommandPanel from './components/AICommandPanel';
import ConnectionModal from './components/ConnectionModal';
import Header from './components/Header';
import KeyboardControl from './components/KeyboardControl';
import Navigation from './components/Navigation';
import TouchPad from './components/TouchPad';
import { useConnection, useController } from './hooks';
import { ControlMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<ControlMode>(ControlMode.TRACKPAD);
  
  const {
    connectionState,
    serverIp,
    setServerIp,
    showIpInput,
    setShowIpInput,
    handleConnect,
    confirmConnect,
    handleDisconnect
  } = useConnection();

  const {
    handleMouseMove,
    handleMouseClick,
    handleScroll,
    handleType,
    handleKeyDown,
    handleText,
    handleAIMacro
  } = useController();

  return (
    <div className="h-[100dvh] w-full bg-gray-950 flex flex-col overflow-hidden font-sans text-gray-100">
      <Header 
        connectionState={connectionState}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="flex-1 relative overflow-hidden">
        <ConnectionModal
          showIpInput={showIpInput}
          serverIp={serverIp}
          connectionState={connectionState}
          onClose={() => setShowIpInput(false)}
          onIpChange={setServerIp}
          onConnect={confirmConnect}
          onShowInput={handleConnect}
        />

        <div className="h-full w-full">
          {mode === ControlMode.TRACKPAD && (
            <TouchPad 
              onMove={handleMouseMove} 
              onClick={handleMouseClick} 
              onScroll={handleScroll} 
            />
          )}
          {mode === ControlMode.KEYBOARD && (
            <KeyboardControl 
              onType={handleType} 
              onKeyDown={handleKeyDown}
              onText={handleText}
            />
          )}
          {mode === ControlMode.AI_COMMAND && (
            <AICommandPanel onExecuteMacro={handleAIMacro} />
          )}
        </div>
      </main>

      <Navigation mode={mode} onModeChange={setMode} />
    </div>
  );
};

export default App;
