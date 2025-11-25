import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';

interface TouchPadProps {
    onMove: (dx: number, dy: number) => void;
    onScroll: (dy: number) => void;
}

const MOUSE_SENSITIVITY = 1;

export const TouchPad: React.FC<TouchPadProps> = ({ onMove, onScroll }) => {
    const [active, setActive] = useState(false);
    const prevPos = useRef<{ x: number; y: number } | null>(null);
    const twoFingerState = useRef<{ lastY: number } | null>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false, // 不允许其他手势中断

            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;

                // 只在状态改变时更新（避免不必要的重渲染）
                if (!active) {
                    setActive(true);
                }

                if (touches.length === 1) {
                    // 单指：记录起始位置
                    prevPos.current = {
                        x: touches[0].pageX,
                        y: touches[0].pageY,
                    };
                    twoFingerState.current = null;
                    //console.log('👆 单指模式');
                } else if (touches.length === 2) {
                    // 双指：记录起始位置
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    twoFingerState.current = { lastY: avgY };
                    prevPos.current = null; // 清除单指状态
                    //console.log(`📜 双指滚动模式: avgY=${avgY.toFixed(1)}`);
                }
            },

            onPanResponderMove: (evt) => {
                const touches = evt.nativeEvent.touches;

                // 动态检测手指数量变化
                if (touches.length === 2 && !twoFingerState.current) {
                    // 从单指切换到双指
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    twoFingerState.current = { lastY: avgY };
                    prevPos.current = null;
                    //console.log(`📜 切换到双指滚动模式: avgY=${avgY.toFixed(1)}`);
                    return;
                }

                if (touches.length === 1 && prevPos.current && !twoFingerState.current) {
                    // 单指移动：计算相对位移
                    const touch = touches[0];
                    const dx = touch.pageX - prevPos.current.x;
                    const dy = touch.pageY - prevPos.current.y;

                    // 直接发送，简单高效
                    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                        onMove(dx * MOUSE_SENSITIVITY, dy * MOUSE_SENSITIVITY);
                    }

                    // 更新上一帧位置
                    prevPos.current = { x: touch.pageX, y: touch.pageY };
                } else if (touches.length === 2 && twoFingerState.current) {
                    // 双指滚动
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    const deltaY = avgY - twoFingerState.current.lastY;

                    if (Math.abs(deltaY) > 1) {
                        //console.log(`📜 滚动: deltaY=${deltaY.toFixed(1)}`);
                        onScroll(-deltaY);
                    }

                    twoFingerState.current.lastY = avgY;
                }
            },

            onPanResponderRelease: () => {
                setActive(false);
                prevPos.current = null;
                twoFingerState.current = null;
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            <View
                style={[styles.touchArea, active && styles.touchAreaActive]}
                {...panResponder.panHandlers}
            >
                <Text style={styles.hint}>触控区域</Text>
            </View>
            <Text style={styles.tip}>💡 双指上下滑动滚动</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    touchArea: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchAreaActive: {
        borderColor: '#00f3ff',
        shadowColor: '#00f3ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    hint: {
        color: '#6b7280',
        fontSize: 14,
        opacity: 0.5,
    },
    tip: {
        color: '#6b7280',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
