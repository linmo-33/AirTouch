import { useState } from 'react';
import { ConnectionState } from '../types';
import { websocketService } from '../services';
import { DEFAULT_SERVER_IP } from '../constants';

export const useConnection = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [serverIp, setServerIp] = useState(DEFAULT_SERVER_IP);
    const [showIpInput, setShowIpInput] = useState(false);

    const handleConnect = () => {
        setShowIpInput(true);
    };

    const confirmConnect = async () => {
        setShowIpInput(false);
        await websocketService.connect(serverIp, setConnectionState);
    };

    const handleDisconnect = () => {
        websocketService.disconnect();
        setConnectionState(ConnectionState.DISCONNECTED);
    };

    return {
        connectionState,
        serverIp,
        setServerIp,
        showIpInput,
        setShowIpInput,
        handleConnect,
        confirmConnect,
        handleDisconnect
    };
};
