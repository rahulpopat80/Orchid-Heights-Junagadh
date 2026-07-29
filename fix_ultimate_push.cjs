const fs = require('fs');

// ---------------------------------------------------------
// 1. REWRITE API/FCM.JS FOR HIGH URGENCY DOZE-BYPASS
// ---------------------------------------------------------
const fcmJs = `import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { projectId, accessToken, payload } = req.body;
    projectId = projectId || 'orchidheights-d46f2';

    if (!payload) return res.status(400).json({ error: 'Missing payload' });

    if (!accessToken) {
      try {
        let auth = null;
        if (fs.existsSync('./service-account.json')) {
          auth = new GoogleAuth({ credentials: JSON.parse(fs.readFileSync('./service-account.json', 'utf8')), scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          auth = new GoogleAuth({ credentials: typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : process.env.FIREBASE_SERVICE_ACCOUNT, scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
        }
        if (auth) accessToken = (await (await auth.getClient()).getAccessToken()).token;
      } catch (e) { console.warn('OAuth minting error', e); }
    }

    if (!accessToken) return res.status(500).json({ error: 'Missing OAuth token' });

    // CRITICAL FIX: DATA-ONLY PAYLOAD. 
    // Do NOT use the 'notification' object here, otherwise Android blocks background execution!
    const fcmMessage = {
      token: payload.token,
      topic: payload.topic,
      data: {
        title: String(payload.title || payload.notification?.title || "Orchid Heights"),
        body: String(payload.body || payload.notification?.body || "New alert received."),
        type: String(payload.type || payload.data?.type || "system"),
        visitorId: String(payload.visitorId || payload.data?.visitorId || ""),
        icon: String(payload.icon || payload.notification?.icon || "https://i.ibb.co/zT5tpcdY/1000296229-1.png")
      },
      android: { priority: "high" },
      webpush: { headers: { Urgency: "high", TTL: "86400" } }
    };

    if (!fcmMessage.token) delete fcmMessage.token;
    if (!fcmMessage.topic) delete fcmMessage.topic;

    const response = await fetch(\`https://fcm.googleapis.com/v1/projects/\${projectId}/messages:send\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: \`Bearer \${accessToken}\` },
      body: JSON.stringify({ message: fcmMessage })
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}`;

if (!fs.existsSync('api')) fs.mkdirSync('api');
fs.writeFileSync('api/fcm.js', fcmJs);
console.log('✅ api/fcm.js updated for High Urgency WebPush delivery.');

// ---------------------------------------------------------
// 2. REWRITE SERVICE WORKER TO HANDLE DATA-ONLY NOTIFICATIONS
// ---------------------------------------------------------
const swJs = `/**
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
`;

fs.writeFileSync('public/firebase-messaging-sw.js', swJs);
console.log('✅ public/firebase-messaging-sw.js updated for background PWA drawing.');

// ---------------------------------------------------------
// 3. CREATE SERVER-SIDE FIRESTORE LISTENER ENGINE
// ---------------------------------------------------------
const serverNotifsJs = `import { db, collection, onSnapshot, sendFCMPushToFlat, sendFCMBroadcast } from './firebase';

export function startServerNotificationService() {
  console.log('⚡ [Server] Starting Global Real-Time Push Notification Engine...');
  const bootTime = Date.now();

  // Helper: Prevents sending notifications for old records when server reboots
  const isNew = (isoString) => {
    if (!isoString) return false;
    return new Date(isoString).getTime() > (bootTime - 10000); 
  };

  // 1. Visitors: Pending Requests & Exits & Pre-Entry Verified
  onSnapshot(collection(db, 'visitors'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      
      if (change.type === 'added' && data.status === 'pending' && isNew(data.requestTime)) {
        sendFCMPushToFlat(data.wing, data.flatNo, {
          title: \`🚨 Visitor at Gate: \${data.fullName}\`,
          body: \`\${data.fullName} is requesting entry. Purpose: \${data.reason}\`,
          type: 'visitor_request',
          visitorId: change.doc.id
        }).catch(() => {});
      }
      
      if (change.type === 'modified') {
         if (data.exited && isNew(data.exitTime)) {
            sendFCMPushToFlat(data.wing, data.flatNo, {
              title: '🚶 Visitor Exited',
              body: \`\${data.fullName} has exited Orchid Heights.\`,
              type: 'system'
            }).catch(() => {});
         }
         if (data.status === 'approved' && isNew(data.respondedTime) && data.isPreEntry) {
             sendFCMBroadcast({
                title: '✅ Pre-Entry Verified',
                body: \`\${data.fullName} for Flat \${data.wing}-\${data.flatNo} has arrived and is verified at the gate.\`,
                type: 'system'
             }).catch(() => {});
         }
      }
    });
  });

  // 2. SOS Alerts: Triggered & Resolved
  onSnapshot(collection(db, 'sos_alerts'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.timestamp)) {
         sendFCMBroadcast({
            title: \`🆘 EMERGENCY: Flat \${data.flatId}\`,
            body: \`Emergency alert triggered by Flat \${data.flatId}! Security dispatch immediately.\`,
            type: 'sos'
         }).catch(() => {});
      }
      if (change.type === 'removed') {
         const wing = data.flatId.split('-')[0];
         const flatNo = parseInt(data.flatId.split('-')[1]);
         sendFCMPushToFlat(wing, flatNo, {
            title: '✅ SOS Resolved',
            body: 'Your emergency alert has been marked as resolved.',
            type: 'system'
         }).catch(() => {});
      }
    });
  });

  // 3. Gym & Theatre Logs: Enter & Exit
  onSnapshot(collection(db, 'gym_theatre_logs'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      const wing = data.flatId.split('-')[0];
      const flatNo = parseInt(data.flatId.split('-')[1]);

      if (change.type === 'added' && isNew(data.checkInTime)) {
         sendFCMPushToFlat(wing, flatNo, {
            title: \`🎫 \${data.amenity} Access\`,
            body: \`\${data.memberName || 'A household member'} has entered the \${data.amenity}.\`,
            type: 'system'
         }).catch(() => {});
      }
      
      if (change.type === 'modified' && data.checkOutTime && isNew(data.checkOutTime)) {
         sendFCMPushToFlat(wing, flatNo, {
            title: \`🚪 \${data.amenity} Check-out\`,
            body: \`\${data.memberName || 'A household member'} has exited the \${data.amenity}.\`,
            type: 'system'
         }).catch(() => {});
      }
    });
  });

  // 4. Complaints Tracker
  onSnapshot(collection(db, 'complaints'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      const wing = data.flatId?.split('-')[0];
      const flatNo = parseInt(data.flatId?.split('-')[1]);
      if(!wing || !flatNo) return;

      if (change.type === 'added' && isNew(data.createdAt)) {
         sendFCMBroadcast({
            title: \`🛠️ New Complaint Raised\`,
            body: \`Flat \${data.flatId} submitted a new complaint: "\${data.title}"\`,
            type: 'system'
         }).catch(() => {});
      }

      if (change.type === 'modified') {
         if (data.status === 'resolved' && isNew(data.resolvedAt)) {
             sendFCMPushToFlat(wing, flatNo, {
                title: \`✅ Complaint Resolved\`,
                body: \`Your ticket "\${data.title}" was resolved. Notes: \${data.processNotes || 'None'}\`,
                type: 'system'
             }).catch(() => {});
         } else if (data.status === 'in-progress' && isNew(data.updatedAt)) {
             sendFCMPushToFlat(wing, flatNo, {
                title: \`⏳ Complaint In-Progress\`,
                body: \`Your ticket "\${data.title}" is now being actively worked on.\`,
                type: 'system'
             }).catch(() => {});
         }
      }
    });
  });
  
  // 5. Amenities Bookings
  onSnapshot(collection(db, 'amenities_bookings'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         const wing = data.flatId.split('-')[0];
         const flatNo = parseInt(data.flatId.split('-')[1]);
         sendFCMPushToFlat(wing, flatNo, {
            title: \`📅 Booking Received\`,
            body: \`Your booking request for \${data.propertyName} is submitted and awaiting approvals.\`,
            type: 'system'
         }).catch(() => {});
      }
    });
  });

  // 6. Announcements / Notices
  onSnapshot(collection(db, 'announcements'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.timestamp)) {
         sendFCMBroadcast({
            title: \`📢 New Notice Posted\`,
            body: data.text.substring(0, 80) + '...',
            type: 'notice'
         }).catch(() => {});
      }
    });
  });

  // 7. Movies Scheduled
  onSnapshot(collection(db, 'movies_schedule'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         sendFCMBroadcast({
            title: \`🎬 Movie Scheduled: \${data.title}\`,
            body: \`Playing on \${data.date} at \${data.timing}\`,
            type: 'system'
         }).catch(() => {});
      }
    });
  });

  // 8. Financial Ledgers
  onSnapshot(collection(db, 'financial_reports'), (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.type === 'added' && isNew(data.createdAt)) {
         sendFCMBroadcast({
            title: \`📊 New Ledger Uploaded\`,
            body: \`\${data.title} (\${data.month} \${data.year}) is now available.\`,
            type: 'system'
         }).catch(() => {});
      }
    });
  });

}
`;

fs.writeFileSync('src/lib/server-notifications.ts', serverNotifsJs);
console.log('✅ src/lib/server-notifications.ts written. Global Event Engine Active.');

console.log('\n🚀 ALL DONE. PLEASE RESTART YOUR NODE.JS SERVER NOW! 🚀\n');
