import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';

interface TouchPadProps {
    onMove: (dx: number, dy: number) => void;
    onScroll: (dy: number) => void;
    onLeftClick: () => void;
}

const MOUSE_SENSITIVITY = 1.5; // 基础灵敏度
const SCROLL_SENSITIVITY = 0.3; // 滚动灵敏度
const MOVE_THRESHOLD = 0.1; // 移动阈值（降低以提高响应）
const ACCELERATION_FACTOR = 1.8; // 加速因子

export const TouchPad: React.FC<TouchPadProps> = ({ onMove, onScroll, onLeftClick }) => {
    const [active, setActive] = useState(false);
    const [sensitivity, setSensitivity] = useState(MOUSE_SENSITIVITY);
    const prevPos = useRef<{ x: number; y: number } | null>(null);
    const twoFingerState = useRef<{ lastY: number } | null>(null);
    const tapStartTime = useRef<number>(0);
    const tapStartPos = useRef<{ x: number; y: number } | null>(null);
    const hasMoved = useRef<boolean>(false);

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
                    // 单指：记录起始位置和时间（用于检测点击）
                    const touch = touches[0];
                    prevPos.current = {
                        x: touch.pageX,
                        y: touch.pageY,
                    };
                    tapStartTime.current = Date.now();
                    tapStartPos.current = {
                        x: touch.pageX,
                        y: touch.pageY,
                    };
                    hasMoved.current = false;
                    twoFingerState.current = null;
                    //console.log('👆 单指模式');
                } else if (touches.length === 2) {
                    // 双指：记录起始位置
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    twoFingerState.current = { lastY: avgY };
                    prevPos.current = null; // 清除单指状态
                    tapStartTime.current = 0; // 清除点击检测
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

                    // 降低阈值，提高响应速度
                    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
                        // 计算移动距离，用于加速度
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // 加速度曲线：快速移动时增加灵敏度
                        let finalSensitivity = sensitivity;
                        if (distance > 10) {
                            // 距离越大，加速越明显
                            finalSensitivity *= Math.min(ACCELERATION_FACTOR, 1 + (distance / 50));
                        }

                        onMove(dx * finalSensitivity, dy * finalSensitivity);
                        hasMoved.current = true; // 标记已移动
                    }

                    // 更新上一帧位置
                    prevPos.current = { x: touch.pageX, y: touch.pageY };
                } else if (touches.length === 2 && twoFingerState.current) {
                    // 双指滚动
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    const deltaY = avgY - twoFingerState.current.lastY;

                    if (Math.abs(deltaY) > 0.5) {
                        // 优化滚动灵敏度
                        onScroll(-deltaY * SCROLL_SENSITIVITY);
                    }

                    twoFingerState.current.lastY = avgY;
                }
            },

            onPanResponderRelease: (evt) => {
                // 检测是否为点击（tap）
                if (tapStartTime.current > 0 && tapStartPos.current && !hasMoved.current) {
                    const tapDuration = Date.now() - tapStartTime.current;
                    const touch = evt.nativeEvent.changedTouches[0];

                    if (touch) {
                        const dx = Math.abs(touch.pageX - tapStartPos.current.x);
                        const dy = Math.abs(touch.pageY - tapStartPos.current.y);

                        // 如果点击时间短于 200ms 且移动距离小于 10px，视为点击
                        if (tapDuration < 200 && dx < 10 && dy < 10) {
                            onLeftClick();
                        }
                    }
                }

                setActive(false);
                prevPos.current = null;
                twoFingerState.current = null;
                tapStartTime.current = 0;
                tapStartPos.current = null;
                hasMoved.current = false;
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
            <Text style={styles.tip}>💡 单击触控板=左键点击 | 双指上下滑动=滚动</Text>
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
