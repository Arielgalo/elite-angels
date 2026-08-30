/* Aura Experience — Service Worker (Fase 0: App Shell + stale-while-revalidate) */
const VER = 'aura-v16';
const SHELL = VER + '-shell';     // cascarón precacheado
const ASSETS = VER + '-assets';   // estáticos con SWR
const KEEP = [SHELL, ASSETS];

// App Shell: lo mínimo para pintar la app al instante (todo mismo-origen).
const SHELL_URLS = [
  '/css/styles.css',
  '/js/app.js', '/js/ea-supabase.js', '/js/pwa.js', '/js/theme.js', '/js/locations.js',
  '/assets/logo.svg', '/assets/icon-192.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_URLS).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// stale-while-revalidate: responde de caché al instante y actualiza en segundo plano.
function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Solo gestionamos mismo-origen. Las llamadas a Supabase pasan directo a la red
  // (NO se cachean: evita filtrar datos privados por usuario entre sesiones).
  if (url.origin !== self.location.origin) return;

  // Navegaciones (HTML) → network-first: siempre fresco, con respaldo offline del cascarón.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((m) => m || caches.match('/index.html') || new Response('', { status: 504 }))
      )
    );
    return;
  }

  // Estáticos mismo-origen (css/js/svg/img/fonts) → stale-while-revalidate.
  if (['style', 'script', 'worker', 'image', 'font'].includes(req.destination)) {
    e.respondWith(staleWhileRevalidate(req, ASSETS));
    return;
  }

  // Resto mismo-origen → red con respaldo de caché.
  e.respondWith(fetch(req).catch(() => caches.match(req).then((m) => m || new Response('', { status: 504 }))));
});

/* ── Web Push (sin cambios respecto a la versión previa) ── */
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data.json(); } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'Aura Experience';
  const opts = { body: d.body || '', icon: '/assets/icon-192.png', badge: '/assets/icon-192.png', image: d.image || undefined, data: { url: d.url || '/feed.html' }, vibrate: [80, 40, 80] };
  e.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/feed.html';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cl) => {
    for (const c of cl) { if ('focus' in c) { try { c.navigate(url); } catch (_) {} return c.focus(); } }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
