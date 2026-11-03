// sw.js - Precision Calc & Verification Log
// Versi stabil: cache-first untuk aset, network-first untuk HTML
// Naikkan VERSION setiap deploy agar SW baru ter-install.

const VERSION = 'v4';                          // ← NAIKKAN SETIAP DEPLOY
const CACHE_NAME = 'precision-calc-' + VERSION;
const PRECACHE = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png'
];

/* ==================== INSTALL ==================== */
// Isi cache baru DULU. Cache lama TIDAK dihapus di sini
// agar kalau install gagal, app tetap jalan dari cache lama.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

/* ==================== ACTIVATE ==================== */
// Hapus cache LAMA milik app ini saja (prefix precision-calc-).
// Cache SW lain di origin yang sama tidak disentuh.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k.startsWith('precision-calc-'))
                    .filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ==================== FETCH ==================== */
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    if (!req.url.startsWith('http')) return;

    const url = new URL(req.url);

    // 1) Navigasi HTML → network-first, fallback ke cache index
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then(resp => {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put('./index.html', clone));
                    return resp;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // 2) Aset same-origin → cache-first (CEPAT) + revalidate di background
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(req).then(cached => {
                if (cached) {
                    // refresh cache di background
                    fetch(req).then(resp => {
                        if (resp && resp.status === 200) {
                            caches.open(CACHE_NAME).then(c => c.put(req, resp));
                        }
                    }).catch(() => {});
                    return cached;
                }
                return fetch(req).then(resp => {
                    if (resp && resp.status === 200) {
                        const clone = resp.clone();
                        caches.open(CACHE_NAME).then(c => c.put(req, clone));
                    }
                    return resp;
                });
            })
        );
        return;
    }

    // 3) Third-party → network biasa (jangan cache)
    event.respondWith(fetch(req).catch(() => caches.match(req)));
});

/* ==================== MESSAGE ==================== */
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/* ==================== PUSH ==================== */
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Precision Calc Update',
        icon: './icon-192.png',
        badge: './icon-192.png'
    };
    event.waitUntil(
        self.registration.showNotification('Precision Calc', options)
    );
});

/* ==================== NOTIFICATION CLICK ==================== */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(self.registration.scope));
});