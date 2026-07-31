
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

const messaging = firebase.messaging();

// Intercept showNotification to add custom actions without breaking Firebase SDK
const originalShowNotification = self.registration.showNotification;
self.registration.showNotification = function(title, options) {
  const data = options?.data?.FCM_MSG?.data || options?.data || {};
  const type = data.type || '';
  
  if (type === 'visitor' || type === 'visitor_request') {
    options.actions = [
      { action: 'approve', title: '✅ Approve Entry' },
      { action: 'reject', title: '❌ Reject' }
    ];
    options.requireInteraction = true;
  }
  
  return originalShowNotification.call(self.registration, title, options);
};

// DO NOT override 'push' event. Let Firebase SDK handle it so delivery receipts and internal pings work!

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const fcmData = event.notification.data?.FCM_MSG?.data || {};
  const notifData = Object.keys(fcmData).length > 0 ? fcmData : (event.notification.data || {});
  const visitorId = notifData.visitorId || notifData.id || event.notification.tag;
  const action = event.action;
  
  if ((action === 'approve' || action === 'reject') && visitorId && visitorId !== 'fcm_notif' && visitorId !== 'society' && visitorId !== 'visitor') {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // LAZY LOAD FIRESTORE
    const db = firebase.firestore();
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
        } else if (notifData.type === 'sos') {
          targetPath = '/help-desk/sos';
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

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
