const CACHE_NAME = "aqliya-v1"

const STATIC_ASSETS = [
  "/",
  "/about",
  "/products",
  "/products/audit",
  "/products/decision",
  "/products/local-content",
  "/products/sales",
  "/products/simulation",
  "/how-we-work",
  "/contact",
  "/auditos",
  "/custom-product",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        if (event.request.method === "GET") {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone())
            return fetchResponse
          })
        }
        return fetchResponse
      })
    }).catch(() => {
      if (event.request.mode === "navigate") {
        return caches.match("/")
      }
      return new Response("Offline", { status: 503 })
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
})
