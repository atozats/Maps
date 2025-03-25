/* eslint-disable no-restricted-globals */
// This is a minimal service worker with no offline caching
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
});

// Minimal fetch handler
self.addEventListener('fetch', (event) => {
    // This empty fetch handler is needed to make the app installable
    // but doesn't implement any caching
    event.respondWith(fetch(event.request));
});