/**
 * Orchid Heights - Ultimate Service Worker
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHHKnOR_UkAjDQ8wFdBpVALYrY1rPK3Es",
  authDomain: "orchidheights-d46f2.firebaseapp.com",
  projectId: "orchidheights-d46f2",
  storageBucket: "orchidheights-d46f2.firebasestorage.app",
  messagingSenderId: "408063641296",
  appId: "1:408063641296:web:c0d1b7e79c69681704c0d5"
});

// Init messaging so frontend getToken() works correctly to refresh expired tokens
const messaging = firebase.messaging();

// MANUALLY INTERCEPT PUSH TO BYPASS ANDROID DOZE MODE
self.addEventListener('push', function(event) {
  event.stopImmediatePropagation(); // STOP Firebase SDK from swallowing the event
  
  if (!event.data) return;
  
  let payload = {};
  try { payload = event.data.json(); } catch(e) { return; }

  // Extract pure data payload
  const data = payload.data || payload.notification || {};
  if (!data.title && !data.body) return;

  const options = {
    body: data.body || 'New update from Orchid Heights.',
    icon: data.icon || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    badge: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    tag: data.visitorId || data.type || Date.now().toString(),
    data: data,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300] // Aggressive vibration pattern wakes device
  };

  if (data.type === 'visitor' || data.type === 'visitor_request') {
    options.actions = [
      { action: 'approve', title: '✅ Approve Entry' },
      { action: 'reject', title: '❌ Reject' }
    ];
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Orchid Heights', options));
});

// HANDLE BACKGROUND CLICKS USING FAST REST API
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  const action = event.action;
  const visitorId = data.visitorId;

  if ((action === 'approve' || action === 'reject') && visitorId) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // FAST FIREBASE REST API (Zero SDK delay, updates in milliseconds)
    const projectId = 'orchidheights-d46f2';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/visitors/${visitorId}?updateMask.fieldPaths=status&updateMask.fieldPaths=respondedTime&updateMask.fieldPaths=respondedBy`;
    
    const patchPayload = {
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
        body: JSON.stringify(patchPayload)
      }).then(() => clients.matchAll({ type: 'window', includeUncontrolled: true }))
        .then(clientList => {
          clientList.forEach(c => c.postMessage({ type: 'VISITOR_ACTION', visitorId, status }));
        }).catch(err => console.error('SW Error:', err))
    );
  } else {
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

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
