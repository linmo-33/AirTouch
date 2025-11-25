// PWA 安装和更新管理

export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker 注册成功:', registration);

            // 检查更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 新版本可用
                            console.log('🆕 新版本可用，请刷新页面');
                            showUpdateNotification();
                        }
                    });
                }
            });
        } catch (error) {
            console.error('❌ Service Worker 注册失败:', error);
        }
    }
};

const showUpdateNotification = () => {
    // 可以在这里显示更新提示
    if (confirm('发现新版本，是否立即更新？')) {
        window.location.reload();
    }
};

// 检查是否可以安装 PWA
export const checkInstallPrompt = () => {
    let deferredPrompt: any = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('💡 PWA 可以安装');
        showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA 已安装');
        deferredPrompt = null;
    });
};

const showInstallButton = (prompt: any) => {
    // 可以在这里显示安装按钮
    // 示例：创建一个安装按钮
    const installButton = document.createElement('button');
    installButton.textContent = '安装 AirTouch';
    installButton.className = 'install-button';
    installButton.onclick = async () => {
        if (prompt) {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            console.log(`用户选择: ${outcome}`);
            if (outcome === 'accepted') {
                console.log('✅ 用户接受安装');
            }
        }
    };
    // 可以将按钮添加到页面中
};

// 检测是否在 PWA 模式下运行
export const isPWA = (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
};

// 获取网络状态
export const getNetworkStatus = (): boolean => {
    return navigator.onLine;
};

// 监听网络状态变化
export const watchNetworkStatus = (callback: (online: boolean) => void) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
};
