// Offline support. Pages come from the network first and fall back to the copy kept from the
// last visit; built assets in /_astro/ never change once published, so the cache serves them.
// Progress is not here: it lives in localStorage and works offline on its own.

const PAGES = 'wcl-pages-v1';
const ASSETS = 'wcl-assets-v1';
const START_PAGES = ['/en/', '/fr/'];
// Built files never depend on the requesting origin, so a Vary header must not hide them.
const MATCH = { ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.addAll(START_PAGES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== PAGES && key !== ASSETS).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_astro/')) event.respondWith(cacheFirst(request));
  else if (request.mode === 'navigate') event.respondWith(networkFirst(request));
});

// The first visit loads before the worker controls the page: the page sends what it loaded so
// that visit works offline too.
self.addEventListener('message', (event) => {
  const { type, urls } = event.data ?? {};
  if (type !== 'cache' || !Array.isArray(urls)) return;
  event.waitUntil(Promise.all(urls.map((url) => keep(new Request(url)))));
});

async function keep(request) {
  const { pathname } = new URL(request.url);
  const cache = await caches.open(pathname.startsWith('/_astro/') ? ASSETS : PAGES);
  if (await cache.match(request, MATCH)) return;
  const response = await fetch(request).catch(() => null);
  if (response?.ok) await cache.put(request, response);
}

async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSETS);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached =
      (await caches.match(request, MATCH)) ?? (await caches.match(START_PAGES[0], MATCH));
    return cached ?? Response.error();
  }
}
