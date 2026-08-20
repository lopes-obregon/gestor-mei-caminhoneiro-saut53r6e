const CACHE_NAME = 'gestor-mei-caminhoneiro-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// Install: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and browser extensions / external services
  if (request.method !== 'GET') {
    return
  }

  // PocketBase API or external API requests: network-only or let browser handle
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // HTML page navigation: Network-first with cache fallback
  if (
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          }
          return networkResponse
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          const appShell = await caches.match('/index.html')
          return appShell || caches.match('/')
        }),
    )
    return
  }

  // Static assets (CSS, JS, images, fonts): Cache-first with network fallback
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|ico|json)$/i) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, update cache in background (stale-while-revalidate for assets)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse))
              }
            })
            .catch(() => {
              // Ignore background fetch errors for offline
            })
          return cachedResponse
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
            }
            return networkResponse
          })
          .catch(() => {
            // If asset fails and isn't cached, return 404 or empty fallback
            return new Response('Offline asset unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
            })
          })
      }),
    )
    return
  }

  // Default network-first fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        }
        return networkResponse
      })
      .catch(() => caches.match(request)),
  )
})
