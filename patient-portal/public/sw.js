/* Service Worker for PharmaSync Patient Portal */
const CACHE_NAME = 'pharmasync-patient-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn('Some static assets could not be cached');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest' ||
    url.pathname.match(/\.(js|css|woff2?|png|svg|ico|webmanifest)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document' || request.mode === 'navigate') {
      return new Response(
        '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — PharmaSync</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f8fc;color:#1e293b;text-align:center;padding:20px}h1{font-size:1.5rem;margin-bottom:8px}p{color:#64748b;line-height:1.5}</style></head><body><div><h1>You\'re offline</h1><p>PharmaSync needs an internet connection to load. Please check your connection and try again.</p></div></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

/* Push notification handling */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'Medication Reminder' }; }
  const title = data.title || 'Medication Reminder';
  const options = {
    body: data.body || '',
    tag: data.tag || 'pharmasync-reminder',
    data: data.data || {},
    renotify: true,
    actions: [
      { action: 'taken', title: 'Taken' },
      { action: 'snooze', title: 'Snooze 10m' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notif = event.notification;
  event.waitUntil((async () => {
    notif.close();
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (all.length > 0) {
      const c = all[0];
      c.focus();
      c.postMessage({ type: 'notification-action', action, data: notif.data });
    } else {
      clients.openWindow('/');
    }
  })());
});
