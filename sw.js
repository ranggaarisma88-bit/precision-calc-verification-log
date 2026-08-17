// sw.js - Precision Calc & Verification Log
// Auto Update Service Worker - Tidak perlu ganti versi manual

const CACHE_NAME = 'precision-calc-v' + Date.now(); // Cache selalu baru setiap deploy
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// Install event - cache semua asset utama
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.error('[SW] Cache error:', err);
        // Lanjutkan meskipun ada yang gagal
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => {
      console.log('[SW] Activated, old caches cleared');
    })
  );
  self.clients.claim();
});

// Fetch event - strategi cerdas berdasarkan tipe request
self.addEventListener('fetch', event => {
  const req = event.request;
  
  // Skip non-GET requests
  if (req.method !== 'GET') return;
  
  // Skip chrome-extension dan non-http
  if (!req.url.startsWith('http')) return;
  
  // Strategi: Network First untuk HTML (selalu dapat versi terbaru)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(resp => {
          // Update cache dengan versi terbaru
          if (resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put('./index.html', clone);
            });
          }
          return resp;
        })
        .catch(() => {
          // Fallback ke cache saat offline
          return caches.match('./index.html').then(cached => {
            if (cached) return cached;
            return caches.match('./');
          });
        })
    );
    return;
  }
  
  // Strategi: Cache First untuk asset statis (cepat)
  // Cache akan terupdate otomatis karena CACHE_NAME berubah setiap deploy
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      
      return fetch(req).then(resp => {
        // Hanya cache response yang valid
        if (resp.status === 200 || resp.type === 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone);
          });
        }
        return resp;
      }).catch(() => {
        // Fallback untuk image/icon
        if (req.url.includes('.png') || req.url.includes('.svg')) {
          return caches.match('./icon-192.png');
        }
      });
    })
  );
});

// Message event - trigger skip waiting dari client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification (optional - bisa diaktifkan nanti)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Update available',
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
  event.waitUntil(
    clients.openWindow('./')
  );
});