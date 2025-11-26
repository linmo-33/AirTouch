import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface KeyboardControlProps {
    onKeyDown: (key: string) => void;
    onText: (text: string) => void;
}

export const KeyboardControl: React.FC<KeyboardControlProps> = ({ onKeyDown, onText }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [inputKey, setInputKey] = useState(0);
    const inputRef = useRef<TextInput>(null);
    const lastSentText = useRef<string>('');
    const lastSentTime = useRef<number>(0);
    const lastButtonClickTime = useRef<number>(0);
    const lastInputValue = useRef<string>('');

    // 发送文本（带防抖，与 Web 版一致）
    const sendText = (text: string) => {
        const now = Date.now();

        if (text === lastSentText.current && now - lastSentTime.current < 100) {
            return;
        }

        lastSentText.current = text;
        lastSentTime.current = now;
        onText(text);
    };

    // 功能键点击
    const handleFunctionKey = (key: string) => {
        const now = Date.now();
        if (now - lastButtonClickTime.current < 200) {
            return;
        }
        lastButtonClickTime.current = now;
        onKeyDown(key);
    };

    // 处理文本输入
    const handleChangeText = (text: string) => {
        setInputValue(text);

        // 只发送新增的部分
        if (text.length > lastInputValue.current.length) {
            const newText = text.slice(lastInputValue.current.length);
            sendText(newText);
        }

        lastInputValue.current = text;
    };

    // 处理失去焦点
    const handleBlur = () => {
        setIsFocused(false);
        // 清空输入框，确保下次可以正常调起键盘
        lastInputValue.current = '';
        setInputValue('');
        // 重新挂载 TextInput 以重置状态
        setInputKey(prev => prev + 1);
    };

    // 处理点击输入区域
    const handleInputAreaPress = () => {
        // 使用 setTimeout 确保在下一个事件循环中执行
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    return (
        <ScrollView style={styles.container}>
            {/* 输入区域 */}
            <View style={[styles.inputArea, isFocused && styles.inputAreaActive]}>
                <TextInput
                    key={inputKey}
                    ref={inputRef}
                    style={styles.transparentInput}
                    value={inputValue}
                    onChangeText={handleChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    keyboardType="default"
                    caretHidden={true}
                    multiline={false}
                    placeholder=""
                />
                <View style={styles.inputOverlay} pointerEvents="none">
                    <Text style={[styles.inputTitle, isFocused && styles.inputTitleActive]}>
                        {isFocused ? '输入模式已激活' : '点击开始输入'}
                    </Text>
                    <Text style={styles.inputHint}>
                        在手机上输入的字符会实时发送到电脑
                    </Text>
                </View>
            </View>

            {/* 功能键 */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonLarge]}
                        onPress={() => handleFunctionKey('BACKSPACE')}
                    >
                        <Text style={styles.buttonText}>⌫</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonLarge]}
                        onPress={() => handleFunctionKey('SPACE')}
                    >
                        <Text style={styles.buttonText}>Space</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonLarge, styles.buttonPrimary]}
                        onPress={() => handleFunctionKey('ENTER')}
                    >
                        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>↵</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    {['ESC', 'TAB', 'WIN', 'ALT'].map((key) => (
                        <TouchableOpacity
                            key={key}
                            style={styles.button}
                            onPress={() => handleFunctionKey(key)}
                        >
                            <Text style={styles.buttonTextSmall}>{key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 方向键 */}
                <View style={styles.arrowContainer}>
                    <View style={styles.arrowRow}>
                        <View style={styles.arrowSpacer} />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleFunctionKey('UP')}
                        >
                            <Text style={styles.buttonText}>↑</Text>
                        </TouchableOpacity>
                        <View style={styles.arrowSpacer} />
                    </View>
                    <View style={styles.arrowRow}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleFunctionKey('LEFT')}
                        >
                            <Text style={styles.buttonText}>←</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleFunctionKey('DOWN')}
                        >
                            <Text style={styles.buttonText}>↓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleFunctionKey('RIGHT')}
                        >
                            <Text style={styles.buttonText}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.row}>
                    {['DELETE', 'HOME', 'END'].map((key) => (
                        <TouchableOpacity
                            key={key}
                            style={styles.button}
                            onPress={() => handleFunctionKey(key)}
                        >
                            <Text style={styles.buttonTextSmall}>{key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    inputArea: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#374151',
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    inputAreaActive: {
        borderColor: '#10b981',
        backgroundColor: '#1f2937',
    },
    inputTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9ca3af',
        marginBottom: 8,
    },
    inputTitleActive: {
        color: '#10b981',
    },
    inputHint: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    transparentInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: 'transparent',
        backgroundColor: 'transparent',
    },
    inputOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#374151',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonLarge: {
        minHeight: 56,
    },
    buttonPrimary: {
        backgroundColor: '#10b98120',
        borderColor: '#10b981',
    },
    buttonText: {
        color: '#9ca3af',
        fontSize: 18,
        fontWeight: '600',
    },
    buttonTextSmall: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    buttonTextPrimary: {
        color: '#10b981',
    },
    arrowContainer: {
        gap: 8,
    },
    arrowRow: {
        flexDirection: 'row',
        gap: 8,
    },
    arrowSpacer: {
        flex: 1,
    },
});
