// sw.js - Precision Calc & Verification Log
// Auto Update Service Worker - Tidak perlu ganti versi manual

const CACHE_NAME = 'precision-calc-v' + Date.now();
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
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache asset satu per satu agar tidak gagal total
        return Promise.allSettled(
          ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              console.warn('[SW] Gagal cache:', asset, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME)
              .map(key => caches.delete(key))
        );
      })
      .then(() => {
        console.log('[SW] Activated, old caches cleared');
        return self.clients.claim();
      })
  );
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
          if (resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put('./index.html', clone);
            });
          }
          return resp;
        })
        .catch(() => {
          return caches.match('./index.html')
            .then(cached => cached || caches.match('./'));
        })
    );
    return;
  }
  
  // Strategi: Stale While Revalidate untuk asset statis
  // (Lebih cepat + selalu update di background)
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(resp => {
          if (resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, clone);
            });
          }
          return resp;
        })
        .catch(() => {
          // Fallback untuk image/icon
          if (req.url.includes('.png') || req.url.includes('.svg')) {
            return caches.match('./icon-192.png');
          }
          return cached;
        });
      
      // Kembalikan cache dulu, update di background
      return cached || fetchPromise;
    })
  );
});

// Message event - trigger skip waiting dari client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification
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

// Periodic sync (untuk update data - opsional)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-update') {
    event.waitUntil(
      // Cek update di sini
      Promise.resolve()
    );
  }
});