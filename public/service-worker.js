self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  if (event.request.destination === "audio") {
    event.respondWith(fetch(event.request));
  }
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
        client.postMessage({ action: 'PLAY' });
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

self.addEventListener('message', (event) => {
  if (event.data.type === 'PLAY') {
    self.registration.showNotification("Now Playing", {
      body: "Tap to return to the player",
      icon: "/assets/icons/icon-192x192.png",
      badge: "/assets/icons/icon-192x192.png",
      actions: [{ action: "open", title: "Open Player" }]
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Opens the app when clicking on the notification
  );
});

