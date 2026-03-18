/* ================================================
   EcoTrilhas Guapimirim — Service Worker
   Estratégia: Cache First para assets estáticos
                Network First para API
   ================================================ */

const CACHE_NAME = 'ecotrilhas-v1';
const CACHE_STATIC = 'ecotrilhas-static-v1';
const CACHE_API = 'ecotrilhas-api-v1';

// Arquivos essenciais que ficam em cache imediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

// ─── INSTALL: pré-cache dos assets estáticos ─────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando EcoTrilhas Service Worker...');
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: limpa caches antigos ──────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Ativando novo Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_STATIC && name !== CACHE_API)
          .map(name => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── FETCH: estratégia por tipo de requisição ────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outros domínios (ex: imagens do Unsplash)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        // Se imagem externa falhar offline, retorna placeholder SVG
        if (request.destination === 'image') {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
              <rect width="400" height="200" fill="#d8f3dc"/>
              <text x="200" y="100" text-anchor="middle" fill="#2d6a4f" font-size="40">🌿</text>
              <text x="200" y="140" text-anchor="middle" fill="#40916c" font-size="14">Imagem indisponível offline</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('', { status: 503 });
      })
    );
    return;
  }

  // Requisições de API → Network First (tenta rede, cai no cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Assets estáticos → Cache First (usa cache, atualiza em background)
  event.respondWith(cacheFirst(request));
});

// ─── Estratégia: Network First ───────────────────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.log('[SW] Offline — buscando do cache API:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;

    // Retorna resposta de erro amigável para API
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: 'Você está offline. Verifique sua conexão.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ─── Estratégia: Cache First ─────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Atualiza cache em background (stale-while-revalidate)
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_STATIC).then(cache => cache.put(request, response));
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Fallback para página offline
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('<h1>Offline</h1>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ─── Push Notifications (estrutura pronta para futuro) ───────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'EcoTrilhas';
  const options = {
    body: data.body || 'Nova atualização disponível!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
