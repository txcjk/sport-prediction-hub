const CACHE = 'sph-v1';
const ASSETS = ['/'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache external API calls
  if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) return;

  // Versioned build assets (hashed filenames) → Cache First
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetchAndCache(request))
    );
    return;
  }

  // Navigation → Network First (fresh data, fallback to cache)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => { cachePut(request, res); return res.clone(); })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else → Cache First
  event.respondWith(
    caches.match(request).then(cached => cached || fetchAndCache(request))
  );
});

function fetchAndCache(request) {
  return fetch(request).then(res => {
    if (res.ok) cachePut(request, res);
    return res.clone();
  });
}

function cachePut(request, response) {
  if (response.status === 206) return;
  const clone = response.clone();
  caches.open(CACHE).then(cache => cache.put(request, clone));
}
