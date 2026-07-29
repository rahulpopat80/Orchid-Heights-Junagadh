self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  let payload = {};
  try { payload = event.data.json(); } catch(e) { return; }

  // Extract data payload (Data-only payloads bypass Firebase swallowing)
  const data = payload.data || payload.notification || {};
  
  if (!data.title && !data.body) return;

  const options = {
    body: data.body || 'New update from Orchid Heights.',
    icon: data.icon || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    badge: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    tag: data.visitorId || data.type || Date.now().toString(),
    data: data,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300] // Aggressive vibration pattern
  };

  // Add Action buttons only for gate requests
  if (data.type === 'visitor' || data.type === 'visitor_request') {
    options.actions = [
      { action: 'approve', title: '✅ Approve Entry' },
      { action: 'reject', title: '❌ Reject' }
    ];
  }

  // Wakes the screen and shows notification instantly
  event.waitUntil(self.registration.showNotification(data.title || 'Orchid Heights', options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  const action = event.action;
  const visitorId = data.visitorId;

  if ((action === 'approve' || action === 'reject') && visitorId) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // 🔥 VANILLA FIRESTORE REST API 🔥
    // Zero SDK needed. Updates the database instantly in milliseconds.
    const projectId = 'orchidheights-d46f2';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/visitors/${visitorId}?updateMask.fieldPaths=status&updateMask.fieldPaths=respondedTime&updateMask.fieldPaths=respondedBy`;
    
    const payload = {
      fields: {
        status: { stringValue: status },
        respondedTime: { stringValue: new Date().toISOString() },
        respondedBy: { stringValue: "Resident (Quick Action)" }
      }
    };

    event.waitUntil(
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => clients.matchAll({ type: 'window', includeUncontrolled: true }))
        .then(clientList => {
          clientList.forEach(c => c.postMessage({ type: 'VISITOR_ACTION', visitorId, status }));
        }).catch(err => console.error('SW Error:', err))
    );
  } else {
    // Normal click - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate('/home').catch(()=>{});
            return client.focus();
          }
        }
        return clients.openWindow('/home');
      })
    );
  }
});

// Force immediate activation
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
