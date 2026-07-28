/**
 * Firebase Messaging Service Worker
 * Orchid Heights Apartment Management System
 */

// ─── NOTIFICATION PUSH HANDLER (Attach FIRST) ──────────────────────────────
self.addEventListener('push', function(event) {
  // Stop Firebase SDK from handling this push to avoid duplicates
  event.stopImmediatePropagation();
  
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    console.error('[SW] Push event data is not JSON:', e);
    return;
  }

  console.log('[SW] Push received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};
  
  const title = notification.title || data.title || '🏢 Orchid Heights';
  const body = notification.body || data.body || 'New notification received.';
  const icon = notification.icon || data.icon || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png';
  
  const type = data.type || 'society';
  const visitorId = data.visitorId || data.id || null;
  const tag = notification.tag || visitorId || type || 'orchid_notif';

  const options = {
    body: body,
    icon: icon,
    badge: notification.badge || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
    tag: tag,
    data: data,
    requireInteraction: type === 'visitor' || type === 'visitor_request' || type === 'sos',
    vibrate: [200, 100, 200]
  };

  if (type === 'visitor' || type === 'visitor_request') {
    options.actions = [
      { action: 'approve', title: '✅ Approve Entry' },
      { action: 'reject', title: '❌ Reject' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── NOTIFICATION CLICK HANDLER ──────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.stopImmediatePropagation();
  event.notification.close();
  
  const fcmData = event.notification.data?.FCM_MSG?.data || {};
  const notifData = Object.keys(fcmData).length > 0 ? fcmData : (event.notification.data || {});
  
  const visitorId = notifData.visitorId || notifData.id || event.notification.tag;
  const action = event.action;

  console.log(`[SW] Notification clicked. Action: "${action}", VisitorId: "${visitorId}"`);

  if ((action === 'approve' || action === 'reject') && visitorId && visitorId !== 'fcm_notif' && visitorId !== 'society' && visitorId !== 'visitor') {
    const status = action === 'approve' ? 'approved' : 'rejected';
    console.log(`[SW] Processing visitor ${action} for ID: ${visitorId}`);

    const visitorRef = db.collection('visitors').doc(visitorId);

    const updatePromise = db.runTransaction((transaction) => {
      return transaction.get(visitorRef).then((visitorDoc) => {
        if (!visitorDoc.exists) return;
        const visitorData = visitorDoc.data();
        if (visitorData.status !== 'pending') return;

        const respondedTime = new Date().toISOString();
        const respondedBy = 'Resident (Notification)';

        transaction.set(visitorRef, {
          ...visitorData,
          status: status,
          respondedTime: respondedTime,
          respondedBy: respondedBy,
          rejectReason: ''
        });

        transaction.set(db.collection('notifications').doc(visitorId), {
          status: status,
          respondedTime: respondedTime,
          respondedBy: respondedBy
        }, { merge: true });
      });
    }).catch(err => {
      console.error('[SW] Transaction failed:', err);
    });

    const broadcastPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach(client => {
        client.postMessage({ type: 'VISITOR_ACTION', visitorId, status });
      });
    });

    event.waitUntil(Promise.all([updatePromise, broadcastPromise]));
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        let targetPath = '/home';
        if (visitorId && visitorId !== 'fcm_notif' && visitorId !== 'society' && visitorId !== 'visitor') {
          targetPath = '/gate-visitors';
        } else if (notifData.type === 'visitor' || notifData.type === 'visitor_request') {
          targetPath = '/gate-visitors';
        } else if (notifData.type === 'notice' || notifData.type === 'announcement') {
          targetPath = '/help-desk/noticies';
        } else if (notifData.type === 'complaint') {
          targetPath = '/complaints';
        } else if (notifData.type === 'financial') {
          targetPath = '/help-desk/financial-ledger';
        }
        
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetPath).catch(() => {});
            return client.focus();
          }
        }
        return clients.openWindow(targetPath);
      })
    );
  }
});

// ─── 1. LOAD FIREBASE SDKS ─────────────────────────

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

// ─── INSTALL & ACTIVATE ──────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker version...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated. Taking control of all clients...');
  event.waitUntil(clients.claim());
});
