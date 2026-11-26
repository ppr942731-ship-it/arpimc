const CACHE = 'arpimc-zone-categories-preview-v14';

const CORE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/wa-template.js',
  '/owner-panel.js',
  '/preview.js',
  '/fallback-data.js',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon.svg',
  '/icons/icon-96.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        console.warn('Precache dilewati:', path, error);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('arpimc-zone-') && key !== CACHE) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fresh = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fresh;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  const isHtml = request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html');
  const isJavaScript = url.pathname.endsWith('.js');
  const isJson = url.pathname.endsWith('.json');
  const isCss = url.pathname.endsWith('.css');

  if (isHtml || isJavaScript || isJson) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCss) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
