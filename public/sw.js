const CACHE_NAME = 'growth-tracker-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          // Some files might fail, but continue
          console.log('Some assets were not cached')
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For Firebase and external API calls, use network first
  if (
    event.request.url.includes('firebase') ||
    event.request.url.includes('googleapis') ||
    event.request.method !== 'GET'
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then(c => c.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
    return
  }

  // For other requests, use cache first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
          return response
        })
      })
      .catch(() => {
        return new Response('Offline - Page not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        })
      })
  )
})
