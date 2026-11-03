// sw.js - Precision Calc & Verification Log
// SUPER AGRESIF - Paksa update semua file

const CACHE_NAME = 'precision-calc-v2-' + Date.now();
const ASSETS = [
  './',
  './index.html',
  './script.js',     // Wajib ada agar JS bisa jalan offline
  './style.css',     // Wajib ada agar tampilan tidak berantakan offline
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// Install: Hapus SEMUA cache lama, lalu cache asset baru
self.addEventListener('install', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => caches.open(CACHE_NAME))
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(asset => cache.add(asset).catch(err => {
            console.warn('[SW] Gagal cache:', asset, err);
          }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Bersihkan cache lama & klaim semua client
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fetch: Network first untuk SEMUA, tanpa cache fallback
self.addEventListener('fetch', event => {
  const req = event.request;
  
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  
  // Network first untuk semua
  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});

// Message: SKIP_WAITING
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Push notification
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

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});

// Update otomatis saat halaman dibuka
self.addEventListener('message', event => {
  if (event.data === 'CHECK_UPDATE') {
    self.update();
  }
});