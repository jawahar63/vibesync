self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle fetch requests
});

// Handle Media Session API actions
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  if (event.data.type === 'PLAY') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'PLAY' });
      });
    });
  }

  if (event.data.type === 'PAUSE') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'PAUSE' });
      });
    });
  }
});
