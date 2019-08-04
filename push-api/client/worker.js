self.addEventListener("push", event => { //Listening for a push event to be called. Displays notification with info defined in app.js
    console.log('Push event commenced.');
    const data = event.data.json()
    const body = {
        body: data.body,
        icon: data.icon
    }
    event.waitUntil(self.registration.showNotification(data.title, body));
});
self.addEventListener('notificationclick', event => { //Listening for the client to click on notification. Redirects to a given link
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    event.waitUntil(clients.openWindow('https://nest.com'));
  });