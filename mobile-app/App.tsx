import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardControl } from './src/components/KeyboardControl';
import { QRScanner } from './src/components/QRScanner';
import { SplashScreen } from './src/components/SplashScreen';
import { TouchPad } from './src/components/TouchPad';
import { websocketService } from './src/services/websocket';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type ControlMode = 'trackpad' | 'keyboard';

export default function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [serverIp, setServerIp] = useState('192.168.1.5');
  const [showInput, setShowInput] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [mode, setMode] = useState<ControlMode>('trackpad');
  const [showSplash, setShowSplash] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    setErrorMessage('');
    const success = await websocketService.connect(serverIp, setConnectionState);
    if (success) {
      setShowInput(false);
    } else {
      setErrorMessage('连接失败，请检查：\n1. 电脑服务端是否运行\n2. IP地址是否正确\n3. 手机和电脑是否在同一网络');
    }
  };

  const handleDisconnect = () => {
    websocketService.disconnect();
    setShowInput(true);
  };

  const handleMouseMove = (dx: number, dy: number) => {
    websocketService.sendMouseMovement(dx, dy);
  };

  const handleScroll = (dy: number) => {
    websocketService.sendScroll(dy);
  };

  const handleClick = (button: string) => {
    websocketService.sendClick(button);
  };

  const handleKeyDown = (key: string) => {
    websocketService.sendKeyDown(key);
  };

  const handleText = (text: string) => {
    websocketService.sendText(text);
  };

  const handleQRScan = async (ip: string) => {
    setShowScanner(false);
    setServerIp(ip);
    setErrorMessage('');
    const success = await websocketService.connect(ip, setConnectionState);
    if (success) {
      setShowInput(false);
    } else {
      setErrorMessage('连接失败，请检查：\n1. 电脑服务端是否运行\n2. IP地址是否正确\n3. 手机和电脑是否在同一网络');
    }
  };

  // 显示启动页面
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AirTouch</Text>
          {connectionState === 'connected' && (
            <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
              <Text style={styles.disconnectText}>断开</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QR Scanner */}
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Connection Modal */}
        {showInput && !showScanner && (
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>连接到电脑</Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              value={serverIp}
              onChangeText={(text) => {
                setServerIp(text);
                setErrorMessage('');
              }}
              placeholder="输入电脑 IP 地址"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.connectBtn, connectionState === 'connecting' && styles.connectBtnDisabled]}
              onPress={handleConnect}
              disabled={connectionState === 'connecting'}
            >
              <Text style={styles.connectText}>
                {connectionState === 'connecting' ? '连接中...' : '连接'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => {
                setShowScanner(true);
                setErrorMessage('');
              }}
            >
              <Text style={styles.scanText}>扫描二维码</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        {connectionState === 'connected' && (
          <>
            {mode === 'trackpad' ? (
              <>
                <TouchPad onMove={handleMouseMove} onScroll={handleScroll} />

                {/* Mouse Buttons */}
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleClick('left')}
                  >
                    <Text style={styles.buttonText}>左键</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleClick('right')}
                  >
                    <Text style={styles.buttonText}>右键</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <KeyboardControl onKeyDown={handleKeyDown} onText={handleText} />
            )}

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, mode === 'trackpad' && styles.navButtonActive]}
                onPress={() => setMode('trackpad')}
              >
                <Text style={[styles.navText, mode === 'trackpad' && styles.navTextActive]}>
                  触控板
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, mode === 'keyboard' && styles.navButtonActive]}
                onPress={() => setMode('keyboard')}
              >
                <Text style={[styles.navText, mode === 'keyboard' && styles.navTextActive]}>
                  键盘
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  disconnectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  disconnectText: {
    color: '#fff',
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#f9fafb',
    fontSize: 16,
    marginBottom: 16,
  },
  connectBtn: {
    backgroundColor: '#00f3ff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  connectBtnDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.6,
  },
  connectText: {
    color: '#030712',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#030712',
  },
  navButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  navButtonActive: {
    borderTopWidth: 2,
    borderTopColor: '#00f3ff',
  },
  navText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#00f3ff',
  },
  scanBtn: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  scanText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});
