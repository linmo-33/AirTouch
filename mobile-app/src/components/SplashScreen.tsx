import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 入场动画
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // 持续的光晕脉动效果
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 轻微旋转动画
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // 2秒后退出
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onFinish();
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* 外层光晕 */}
                <Animated.View
                    style={[
                        styles.glowOuter,
                        {
                            opacity: glowOpacity,
                            transform: [{ scale: glowScale }],
                        },
                    ]}
                />

                {/* 旋转的装饰环 */}
                <Animated.View
                    style={[
                        styles.rotatingRing,
                        {
                            transform: [{ rotate }],
                        },
                    ]}
                >
                    <View style={styles.ringSegment1} />
                    <View style={styles.ringSegment2} />
                </Animated.View>

                {/* 主图标 */}
                <View style={styles.iconCircle}>
                    <View style={styles.innerCircle} />
                    <View style={styles.centerDot} />
                </View>

                {/* 应用名称 */}
                <Text style={styles.appName}>AirTouch</Text>
                <Text style={styles.tagline}>隔空触控</Text>

                {/* 底部装饰线 */}
                <View style={styles.decorLine} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    glowOuter: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#00f3ff',
        top: -40,
    },
    rotatingRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringSegment1: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: '#00f3ff',
        borderStyle: 'solid',
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        opacity: 0.4,
    },
    ringSegment2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#0ea5e9',
        borderStyle: 'solid',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
        opacity: 0.3,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#00f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        shadowColor: '#00f3ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    innerCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    centerDot: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        opacity: 0.9,
    },
    appName: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#00f3ff',
        marginBottom: 12,
        letterSpacing: 3,
        textShadowColor: 'rgba(0, 243, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    tagline: {
        fontSize: 16,
        color: '#9ca3af',
        letterSpacing: 6,
        marginBottom: 30,
    },
    decorLine: {
        width: 60,
        height: 3,
        backgroundColor: '#00f3ff',
        borderRadius: 2,
        opacity: 0.6,
    },
});
