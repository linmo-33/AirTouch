// AirTouch Service Worker
const CACHE_NAME = 'airtouch-v1.1.0'; // 更新版本号强制刷新缓存
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/logo.svg',
    '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    // 跳过等待，立即激活新的 Service Worker
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 缓存已打开');
                return cache.addAll(urlsToCache);
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 立即接管所有页面
            return self.clients.claim();
        })
    );
});

// 拦截请求 - 使用 Network First 策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 对于 HTML 和 JS 文件，优先使用网络（Network First）
    if (request.method === 'GET' &&
        (url.pathname.endsWith('.html') ||
            url.pathname.endsWith('.js') ||
            url.pathname === '/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 网络请求成功，更新缓存
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 网络失败，返回缓存
                    return caches.match(request);
                })
        );
    } else {
        // 其他资源使用 Cache First
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request).then((response) => {
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    });
                })
        );
    }
});
