/**
 * Firebase Messaging Service Worker
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHHKnOR_UkAjDQ8wFdBpVALYrY1rPK3Es",
  authDomain: "orchidheights-d46f2.firebaseapp.com",
  projectId: "orchidheights-d46f2",
  storageBucket: "orchidheights-d46f2.firebasestorage.app",
  messagingSenderId: "408063641296",
  appId: "1:408063641296:web:c0d1b7e79c69681704c0d5"
});

self.addEventListener('push', function(event) {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch(e) { return; }

  const data = payload.data || {};
  
  // Prevent visual notifications for internal Firebase tokens
  if (!data.title && !data.body) return;

  const options = {
    body: data.body || 'New update from Orchid Heights.',
    icon: data.icon || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    badge: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    tag: data.visitorId || data.type || Date.now().toString(),
    data: data,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300]
  };

  if (data.type === 'visitor' || data.type === 'visitor_request') {
    options.actions = [
      { action: 'approve', title: '✅ Approve Entry' },
      { action: 'reject', title: '❌ Reject' }
    ];
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Orchid Heights', options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  const action = event.action;
  const visitorId = data.visitorId;

  if ((action === 'approve' || action === 'reject') && visitorId) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const db = firebase.firestore();
    const visitorRef = db.collection('visitors').doc(visitorId);

    event.waitUntil(
      db.runTransaction(t => t.get(visitorRef).then(doc => {
        if (doc.exists && doc.data().status === 'pending') {
          t.update(visitorRef, { status, respondedTime: new Date().toISOString(), respondedBy: 'Resident (Quick Action)' });
        }
      })).then(() => clients.matchAll({ type: 'window' })).then(clientList => {
        clientList.forEach(c => c.postMessage({ type: 'VISITOR_ACTION', visitorId, status }));
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
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
