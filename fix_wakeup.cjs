const fs = require('fs');

// 1. ULTRA-LIGHTWEIGHT VANILLA SERVICE WORKER (Zero Firebase SDK Bloat)
const swJs = `self.addEventListener('push', function(event) {
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
    const url = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/(default)/documents/visitors/\${visitorId}?updateMask.fieldPaths=status&updateMask.fieldPaths=respondedTime&updateMask.fieldPaths=respondedBy\`;
    
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
`;

fs.writeFileSync('public/firebase-messaging-sw.js', swJs);
console.log('✅ public/firebase-messaging-sw.js rewritten to ultra-fast Vanilla JS.');

// 2. REWRITE API/FCM.JS TO INJECT HIGH URGENCY HEADERS
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

    // CRITICAL: Force Data-Only Payload with High Priority WebPush Headers 
    // to break through Android Doze Mode
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
      webpush: { 
        headers: { 
          Urgency: "high", 
          TTL: "86400" 
        } 
      }
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
}
`;

fs.writeFileSync('api/fcm.js', fcmJs);
console.log('✅ api/fcm.js updated with strict Data-Only WebPush Urgency Headers.');
console.log('\n🚀 FULLY COMPLETE. RESTART SERVER & CLEAR SITE CACHE! 🚀\n');
