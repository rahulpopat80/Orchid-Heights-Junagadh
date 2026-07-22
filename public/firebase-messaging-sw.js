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

const messaging = firebase.messaging();
const db = firebase.firestore();

self.addEventListener('push', (event) => {
  event.stopImmediatePropagation(); // Prevents duplicates
  if (!event.data) return;
  
  let payload;
  try { payload = event.data.json(); } catch (e) { return; }

  const msg = payload.message || payload;
  const actualData = msg.data || payload.data || {};
  const actualNotif = msg.notification || payload.notification || {};
  
  const title = actualNotif.title || actualData.title || 'Orchid Heights';
  const body = actualNotif.body || actualData.body || 'New notification.';
  const type = actualData.type || 'society';
  const visitorId = actualData.visitorId || actualData.id || null;

  const bodyLower = body.toLowerCase();
  // STRICT RULE: No buttons for Exits or Pre-entries
  const isActionableRequest = type === 'visitor' && !bodyLower.includes('exit') && !bodyLower.includes('pre-entry') && !bodyLower.includes('left');

  const notifOptions = {
    body: body,
    icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png', // Strict Logo
    badge: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    tag: visitorId || type || 'orchid_notif',
    data: { ...actualData, clickType: type, visitorId },
    requireInteraction: isActionableRequest,
    vibrate: [200, 100, 200]
  };

  if (isActionableRequest) {
    notifOptions.actions = [
      { action: 'approve', title: 'Approve Entry' },
      { action: 'reject', title: 'Decline' }
    ];
  }

  event.waitUntil(self.registration.showNotification(title, notifOptions));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const notifData = event.notification.data || {};
  const type = notifData.clickType || '';
  const visitorId = notifData.visitorId;

  // If they clicked Approve/Decline, send message to frontend for the 5-second Undo
  if (event.action === 'approve' || event.action === 'reject') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach(client => {
          client.postMessage({ 
            type: 'VISITOR_ACTION_UNDOABLE', 
            visitorId, 
            status: event.action === 'approve' ? 'approved' : 'rejected' 
          });
        });
      })
    );
    return;
  }

  // EXACT ROUTING LOGIC
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      let targetPath = '/home';
      
      if (type.includes('visitor')) targetPath = '/gate-visitors';
      else if (type === 'notice' || type === 'announcement') targetPath = '/help-desk/noticies';
      else if (type === 'financial') targetPath = '/help-desk/financial-ledger';
      else if (type.includes('complaint')) targetPath = '/complaints';
      else if (type.includes('amenity') || type.includes('gym') || type.includes('movie')) targetPath = '/amenities';

      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetPath);
          return client.focus();
        }
      }
      return clients.openWindow(targetPath);
    })
  );
});
