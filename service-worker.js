const CACHE_NAME = 'daka-pwa-v1';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 清理旧缓存（可选）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 请求拦截：优先网络，失败再用缓存
self.addEventListener('fetch', (event) => {
  const request = event.request;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 把成功的请求放入缓存（简单处理）
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, respClone);
        });
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || Promise.reject('no-match'))
      )
  );
});
