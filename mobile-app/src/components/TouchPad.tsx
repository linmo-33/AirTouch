import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

interface TouchPadProps {
    onMove: (dx: number, dy: number) => void;
    onScroll: (dy: number) => void;
    onLeftClick: () => void;
}

const SCROLL_SENSITIVITY = 1.0; // 提高滚动灵敏度
const MOVE_THRESHOLD = 0.1;
const DEADZONE = 0.5; // 死区阈值，过滤微小抖动

export const TouchPad: React.FC<TouchPadProps> = ({ onMove, onScroll, onLeftClick }) => {
    const [active, setActive] = useState(false);
    const prevPos = useRef<{ x: number; y: number } | null>(null);
    const accumulatedX = useRef<number>(0);
    const accumulatedY = useRef<number>(0);
    const pendingDx = useRef<number>(0);
    const pendingDy = useRef<number>(0);
    const pendingScroll = useRef<number>(0); // 滚动累加器
    const twoFingerState = useRef<{ lastY: number } | null>(null);
    const tapStartTime = useRef<number>(0);
    const tapStartPos = useRef<{ x: number; y: number } | null>(null);
    const hasMoved = useRef<boolean>(false);

    // 节流发送：60Hz 定时器（稳定网络流）
    useEffect(() => {
        const sendInterval = setInterval(() => {
            // 发送鼠标移动
            if (pendingDx.current !== 0 || pendingDy.current !== 0) {
                onMove(pendingDx.current, pendingDy.current);
                pendingDx.current = 0;
                pendingDy.current = 0;
            }

        }, 16); // 16ms ≈ 60Hz

        return () => clearInterval(sendInterval);
    }, [onMove, onScroll]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,

            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;

                if (!active) {
                    setActive(true);
                }

                if (touches.length === 1) {
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
                    accumulatedX.current = 0;
                    accumulatedY.current = 0;
                } else if (touches.length === 2) {
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    twoFingerState.current = { lastY: avgY };
                    prevPos.current = null;
                    tapStartTime.current = 0;
                }
            },

            onPanResponderMove: (evt) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 2 && !twoFingerState.current) {
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    twoFingerState.current = { lastY: avgY };
                    prevPos.current = null;
                    return;
                }

                if (touches.length === 1 && prevPos.current && !twoFingerState.current) {
                    const touch = touches[0];
                    const dx = touch.pageX - prevPos.current.x;
                    const dy = touch.pageY - prevPos.current.y;

                    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
                        // 计算移动距离
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // 分段加速度曲线
                        let sensitivity: number;
                        if (distance < 3) {
                            sensitivity = 1.0;
                        } else if (distance < 8) {
                            sensitivity = 1.5;
                        } else if (distance < 15) {
                            sensitivity = 2.0;
                        } else {
                            sensitivity = 2.5;
                        }

                        // 应用灵敏度
                        const rawDx = dx * sensitivity;
                        const rawDy = dy * sensitivity;

                        // 亚像素累积
                        accumulatedX.current += rawDx;
                        accumulatedY.current += rawDy;

                        const sendDx = Math.round(accumulatedX.current);
                        const sendDy = Math.round(accumulatedY.current);

                        // 累加到待发送队列（不立即发送，由定时器统一发送）
                        if (Math.abs(sendDx) > DEADZONE || Math.abs(sendDy) > DEADZONE) {
                            pendingDx.current += sendDx;
                            pendingDy.current += sendDy;
                            accumulatedX.current -= sendDx;
                            accumulatedY.current -= sendDy;
                            hasMoved.current = true;
                        }
                    }

                    prevPos.current = { x: touch.pageX, y: touch.pageY };
                } else if (touches.length === 2 && twoFingerState.current) {
                    const avgY = (touches[0].pageY + touches[1].pageY) / 2;
                    const deltaY = avgY - twoFingerState.current.lastY;

                    if (Math.abs(deltaY) > 0.3) {
                        // 累加到滚动队列，不立即发送
                        const scrollAmount = -deltaY * SCROLL_SENSITIVITY;
                        pendingScroll.current += scrollAmount;
                    }

                    twoFingerState.current.lastY = avgY;
                }
            },

            onPanResponderRelease: (evt) => {
                if (tapStartTime.current > 0 && tapStartPos.current && !hasMoved.current) {
                    const tapDuration = Date.now() - tapStartTime.current;
                    const touch = evt.nativeEvent.changedTouches[0];

                    if (touch) {
                        const dx = Math.abs(touch.pageX - tapStartPos.current.x);
                        const dy = Math.abs(touch.pageY - tapStartPos.current.y);

                        if (tapDuration < 200 && dx < 10 && dy < 10) {
                            onLeftClick();
                        }
                    }
                }

                setActive(false);
                prevPos.current = null;
                accumulatedX.current = 0;
                accumulatedY.current = 0;
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
