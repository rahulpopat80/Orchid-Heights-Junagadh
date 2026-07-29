const fs = require('fs');

// ============================================================================
// 1. BULLETPROOF SERVICE WORKER (Handles SDK + Background Waking)
// ============================================================================
const swJs = `/**
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
    const url = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/(default)/documents/visitors/\${visitorId}?updateMask.fieldPaths=status&updateMask.fieldPaths=respondedTime&updateMask.fieldPaths=respondedBy\`;
    
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
`;

fs.writeFileSync('public/firebase-messaging-sw.js', swJs);
console.log('✅ Service Worker rewritten to combine SDK Token Minting + Doze Mode Bypass.');

// ============================================================================
// 2. BACKEND LISTENER (Uses Absolute URLs so Node.js doesn't crash)
// ============================================================================
const serverNotifsJs = `import { db, collection, onSnapshot, getDocs } from './firebase';

const SERVER_URL = 'http://localhost:3000';

// Absolute URL Fetch for Node.js Backend Pushing
async function internalSendPush(payload) {
  try {
    await fetch(\`\${SERVER_URL}/api/fcm\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload })
    });
  } catch (error) {
    console.error('[Server Push] Failed to execute local push route:', error);
  }
}

async function serverPushToFlat(wing, flatNo, data) {
  try {
    const ownersSnap = await getDocs(collection(db, 'owners'));
    let flatOwner = null;
    ownersSnap.forEach(doc => {
      const o = doc.data();
      if (o.wing === wing && o.flatNo === flatNo) flatOwner = o;
    });
    if (!flatOwner || !flatOwner.devices) return;
    
    flatOwner.devices.forEach(device => {
      if (device.deviceId) {
        internalSendPush({ token: device.deviceId, ...data });
      }
    });
  } catch (err) { console.error('serverPushToFlat Error:', err); }
}

async function serverBroadcast(data) {
  try {
    const ownersSnap = await getDocs(collection(db, 'owners'));
    ownersSnap.forEach(doc => {
      const owner = doc.data();
      if (owner.devices) {
        owner.devices.forEach(device => {
          if (device.deviceId) internalSendPush({ token: device.deviceId, ...data });
        });
      }
    });
  } catch (err) { console.error('serverBroadcast Error:', err); }
}

export function startServerNotificationService() {
  console.log('⚡ [Server] Global Real-Time Push Engine Started!');
  const bootTime = Date.now();

  const isNew = (isoString) => isoString && new Date(isoString).getTime() > (bootTime - 10000);

  // 1. VISITORS
  onSnapshot(collection(db, 'visitors'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && data.status === 'pending' && isNew(data.requestTime)) {
        serverPushToFlat(data.wing, data.flatNo, {
          title: \`🚨 Visitor at Gate: \${data.fullName}\`,
          body: \`\${data.fullName} is requesting entry. Purpose: \${data.reason}\`,
          type: 'visitor_request',
          visitorId: change.doc.id
        });
      }
      if (change.type === 'modified') {
         if (data.exited && isNew(data.exitTime)) {
            serverPushToFlat(data.wing, data.flatNo, {
              title: '🚶 Visitor Exited',
              body: \`\${data.fullName} has exited Orchid Heights.\`,
              type: 'system'
            });
         }
         if (data.status === 'approved' && isNew(data.respondedTime) && data.isPreEntry) {
            serverPushToFlat(data.wing, data.flatNo, {
                title: '✅ Pre-Entry Verified',
                body: \`\${data.fullName} has arrived and is verified at the gate.\`,
                type: 'system'
            });
         }
      }
    });
  });

  // 2. SOS ALERTS
  onSnapshot(collection(db, 'sos_alerts'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.timestamp)) {
         serverBroadcast({
            title: \`🆘 EMERGENCY: Flat \${data.flatId}\`,
            body: \`Emergency alert triggered by Flat \${data.flatId}! Security dispatch immediately.\`,
            type: 'sos'
         });
      }
    });
  });

  // 3. GYM & THEATRE LOGS
  onSnapshot(collection(db, 'gym_theatre_logs'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      const [wing, flatNo] = data.flatId.split('-');
      if (change.type === 'added' && isNew(data.checkInTime)) {
         serverPushToFlat(wing, parseInt(flatNo), {
            title: \`🎫 \${data.amenity} Access\`,
            body: \`\${data.memberName || 'A household member'} entered the \${data.amenity}.\`,
            type: 'system'
         });
      }
      if (change.type === 'modified' && data.checkOutTime && isNew(data.checkOutTime)) {
         serverPushToFlat(wing, parseInt(flatNo), {
            title: \`🚪 \${data.amenity} Check-out\`,
            body: \`\${data.memberName || 'A household member'} exited the \${data.amenity}.\`,
            type: 'system'
         });
      }
    });
  });

  // 4. COMPLAINTS
  onSnapshot(collection(db, 'complaints'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      const [wing, flatNo] = data.flatId?.split('-') || [];
      if(!wing || !flatNo) return;

      if (change.type === 'added' && isNew(data.createdAt)) {
         serverBroadcast({
            title: \`🛠️ New Complaint Raised\`,
            body: \`Flat \${data.flatId} submitted a new complaint: "\${data.title}"\`,
            type: 'system'
         });
      }
      if (change.type === 'modified') {
         if (data.status === 'resolved' && isNew(data.resolvedAt)) {
             serverPushToFlat(wing, parseInt(flatNo), {
                title: \`✅ Complaint Resolved\`,
                body: \`Your ticket "\${data.title}" was resolved. Notes: \${data.processNotes || 'None'}\`,
                type: 'system'
             });
         } else if (data.status === 'in-progress' && isNew(data.updatedAt)) {
             serverPushToFlat(wing, parseInt(flatNo), {
                title: \`⏳ Complaint In-Progress\`,
                body: \`Your ticket "\${data.title}" is now being actively worked on.\`,
                type: 'system'
             });
         }
      }
    });
  });
  
  // 5. AMENITIES BOOKINGS
  onSnapshot(collection(db, 'amenities_bookings'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         const [wing, flatNo] = data.flatId.split('-');
         serverPushToFlat(wing, parseInt(flatNo), {
            title: \`📅 Booking Received\`,
            body: \`Your booking request for \${data.propertyName} is submitted and awaiting approvals.\`,
            type: 'system'
         });
      }
    });
  });

  // 6. NOTICES
  onSnapshot(collection(db, 'announcements'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.timestamp)) {
         serverBroadcast({
            title: \`📢 New Notice Posted\`,
            body: data.text.substring(0, 80) + '...',
            type: 'notice'
         });
      }
    });
  });

  // 7. MOVIES
  onSnapshot(collection(db, 'movies_schedule'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         serverBroadcast({
            title: \`🎬 Movie Scheduled: \${data.title}\`,
            body: \`Playing on \${data.date} at \${data.timing}\`,
            type: 'system'
         });
      }
    });
  });

  // 8. FINANCIAL LEDGERS
  onSnapshot(collection(db, 'financial_reports'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         serverBroadcast({
            title: \`📊 New Ledger Uploaded\`,
            body: \`\${data.title} (\${data.month} \${data.year}) is now available.\`,
            type: 'system'
         });
      }
    });
  });
}
`;

fs.writeFileSync('src/lib/server-notifications.ts', serverNotifsJs);
console.log('✅ Server Backend Engine rewritten. Fixed Node.js crash bugs using absolute URLs.');
console.log('\n🚀 ULTIMATE FIX COMPLETE. RESTART YOUR NODE.JS SERVER NOW! 🚀\n');
