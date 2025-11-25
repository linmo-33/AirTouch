// AirTouch Service Worker
const CACHE_NAME = 'airtouch-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/logo.svg',
    '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
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
        })
    );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 缓存命中，返回缓存
                if (response) {
                    return response;
                }

                // 否则发起网络请求
                return fetch(event.request).then((response) => {
                    // 检查是否是有效响应
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 克隆响应
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});
