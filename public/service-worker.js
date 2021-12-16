const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/manifest.json",
  "/js/index.js",
  "/js/idb.js",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png"
];

// cache resources
self.addEventListener("install", function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
      })
    );

    self.skipWaiting();
  });

// delete outdated caches
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// respond with cached resources
self.addEventListener("fetch", function (e) {
  console.log("fetch request : " + e.request.url);
  // respondWith method will intercept the fetch request
  e.respondWith(
      // .match() will determine if the resource already exists in caches
    caches.match(e.request).then(function (request) {
        // if it does, log the url to the console w/ a message
      if (request) {
        console.log("responding with cache : " + e.request.url);
        //  & then return the cached resource
        return request;
        // if it's not in caches, allow the resource to be retrieved from the online network
      } else {
        console.log("file is not cached, fetching : " + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

