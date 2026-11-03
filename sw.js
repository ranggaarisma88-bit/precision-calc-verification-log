// Gunakan versi statis, JANGAN pakai Date.now()
// Naikkan angka versi ini setiap kali Anda melakukan deploy besar
const CACHE_NAME = 'signal-conv-v1'; 

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

/* ==================== INSTALL ==================== */
self.addEventListener('install', event => {
  // JANGAN pakai self.skipWaiting() di sini jika menggunakan Network-First.
  // Biarkan SW baru menunggu sampai aman.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Gunakan allSettled agar kalau 1 icon gagal, script & css tetap tersimpan
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.warn('Gagal cache:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

/* ==================== ACTIVATE ==================== */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Langsung ambil alih tab
});

/* ==================== FETCH ==================== */
self.addEventListener('fetch', event => {
  const req = event.request;

  // 1. Abaikan request selain GET (misal POST ke database)
  if (req.method !== 'GET') return;

  // 2. Abaikan request Firebase / Firestore / API luar agar data selalu realtime
  if (req.url.includes('firestore.googleapis.com') || 
      req.url.includes('firebaseio.com') ||
      req.url.includes('identitytoolkit')) {
    return; 
  }

  // 3. STRATEGI NETWORK-FIRST untuk HTML, JS, CSS (Sesuai contoh Anda)
  // Aplikasi akan SELALU ambil file terbaru dari internet.
  // Kalau internet mati, baru ambil dari cache.
  if (req.mode === 'navigate' || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          // Simpan file terbaru ke cache secara background
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return resp;
        })
        .catch(() => {
          // Jika offline, pakai cache. Jika cache kosong, tampilkan index.html
          return caches.match(req).then(cached => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // 4. STRATEGI CACHE-FIRST untuk gambar/CDN (biar cepat & hemat kuota)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return resp;
      }).catch(() => {
        // Fallback jika gambar gagal load saat offline
        return new Response('', { status: 404, statusText: 'Offline' });
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});