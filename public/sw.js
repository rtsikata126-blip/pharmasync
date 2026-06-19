/* Service Worker for PharmaSync - handles push events */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'Medication Reminder' }; }
  const title = data.title || 'Medication Reminder';
  const options = {
    body: data.body || '',
    tag: data.tag || 'pharmasync-reminder',
    data: data.data || {},
    renotify: true,
    actions: [
      { action: 'taken', title: 'Taken' },
      { action: 'snooze', title: 'Snooze 10m' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notif = event.notification;
  event.waitUntil((async () => {
    notif.close();
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (all.length > 0) {
      const c = all[0];
      c.focus();
      // Post message to client so it can record taken/snooze
      c.postMessage({ type: 'notification-action', action, data: notif.data });
    } else {
      clients.openWindow('/');
    }
  })());
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // here you could re-subscribe and send to server
});
