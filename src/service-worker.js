self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ action: event.data.type });
    });
  });
});

// Prevent YouTube iframe from suspending
self.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'PAUSE' });
      });
    });
  } else {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'PLAY' });
      });
    });
  }
});
