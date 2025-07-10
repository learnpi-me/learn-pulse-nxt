self.addEventListener("push", (event) => {
  const data = event.data.json();

  const notificationOptions = {
      body: data.body,
      icon: data.icon || "/generated-icon.png",
      badge: "/generated-icon.png",
      data: data.data || {},
      requireInteraction: true,
      actions: [
          {
              action: "open",
              title: "Open",
          },
          {
              action: "close",
              title: "Close",
          },
      ],
  };

  event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
      clients.openWindow(event.notification.data.url);
  }
});