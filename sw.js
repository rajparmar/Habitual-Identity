/* HabitTick Service Worker — cache-busting version */
const CACHE = 'habittick-v' + Date.now();
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  /* Skip waiting forces immediate activation — no stale cache */
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  /* Delete ALL old caches immediately on activate */
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  /* Network first — always try network, fall back to cache */
  /* This ensures new deployments are always picked up */
  e.respondWith(
    fetch(e.request).then(res => {
      /* Cache the fresh response */
      if(res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      /* Only use cache if network fails (offline) */
      caches.match(e.request)
    )
  );
});
