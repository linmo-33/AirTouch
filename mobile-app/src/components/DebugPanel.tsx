import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LogEntry, logger } from '../utils/logger';

interface DebugPanelProps {
    visible: boolean;
    onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const unsubscribe = logger.subscribe(setLogs);
        setLogs(logger.getLogs());
        return () => {
            unsubscribe();
        };
    }, []);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return '#ef4444';
            case 'warn': return '#f59e0b';
            case 'info': return '#3b82f6';
            case 'debug': return '#6b7280';
            default: return '#9ca3af';
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>调试日志</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => logger.clear()}
                        >
                            <Text style={styles.clearText}>清空</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeText}>关闭</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.logContainer}>
                    {logs.length === 0 ? (
                        <Text style={styles.emptyText}>暂无日志</Text>
                    ) : (
                        logs.map((log, index) => (
                            <View key={index} style={styles.logEntry}>
                                <Text style={styles.timestamp}>{log.timestamp}</Text>
                                <Text style={[styles.level, { color: getLevelColor(log.level) }]}>
                                    [{log.level.toUpperCase()}]
                                </Text>
                                <Text style={styles.message}>{log.message}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

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
        paddingTop: 50,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f9fafb',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#374151',
        borderRadius: 6,
    },
    clearText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#00f3ff',
        borderRadius: 6,
    },
    closeText: {
        color: '#030712',
        fontSize: 14,
        fontWeight: '600',
    },
    logContainer: {
        flex: 1,
        padding: 12,
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
    },
    logEntry: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#111827',
        borderRadius: 6,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    timestamp: {
        color: '#6b7280',
        fontSize: 12,
        marginRight: 8,
        fontFamily: 'monospace',
    },
    level: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 8,
        fontFamily: 'monospace',
    },
    message: {
        color: '#d1d5db',
        fontSize: 12,
        flex: 1,
        fontFamily: 'monospace',
    },
});
