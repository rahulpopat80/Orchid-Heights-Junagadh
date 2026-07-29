import { db, collection, onSnapshot, sendFCMPushToFlat, sendFCMBroadcast } from './firebase';

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
          title: `🚨 Visitor at Gate: ${data.fullName}`,
          body: `${data.fullName} is requesting entry. Purpose: ${data.reason}`,
          type: 'visitor_request',
          visitorId: change.doc.id
        }).catch(() => {});
      }
      
      if (change.type === 'modified') {
         if (data.exited && isNew(data.exitTime)) {
            sendFCMPushToFlat(data.wing, data.flatNo, {
              title: '🚶 Visitor Exited',
              body: `${data.fullName} has exited Orchid Heights.`,
              type: 'system'
            }).catch(() => {});
         }
         if (data.status === 'approved' && isNew(data.respondedTime) && data.isPreEntry) {
             sendFCMBroadcast({
                title: '✅ Pre-Entry Verified',
                body: `${data.fullName} for Flat ${data.wing}-${data.flatNo} has arrived and is verified at the gate.`,
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
            title: `🆘 EMERGENCY: Flat ${data.flatId}`,
            body: `Emergency alert triggered by Flat ${data.flatId}! Security dispatch immediately.`,
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
            title: `🎫 ${data.amenity} Access`,
            body: `${data.memberName || 'A household member'} has entered the ${data.amenity}.`,
            type: 'system'
         }).catch(() => {});
      }
      
      if (change.type === 'modified' && data.checkOutTime && isNew(data.checkOutTime)) {
         sendFCMPushToFlat(wing, flatNo, {
            title: `🚪 ${data.amenity} Check-out`,
            body: `${data.memberName || 'A household member'} has exited the ${data.amenity}.`,
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
            title: `🛠️ New Complaint Raised`,
            body: `Flat ${data.flatId} submitted a new complaint: "${data.title}"`,
            type: 'system'
         }).catch(() => {});
      }

      if (change.type === 'modified') {
         if (data.status === 'resolved' && isNew(data.resolvedAt)) {
             sendFCMPushToFlat(wing, flatNo, {
                title: `✅ Complaint Resolved`,
                body: `Your ticket "${data.title}" was resolved. Notes: ${data.processNotes || 'None'}`,
                type: 'system'
             }).catch(() => {});
         } else if (data.status === 'in-progress' && isNew(data.updatedAt)) {
             sendFCMPushToFlat(wing, flatNo, {
                title: `⏳ Complaint In-Progress`,
                body: `Your ticket "${data.title}" is now being actively worked on.`,
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
            title: `📅 Booking Received`,
            body: `Your booking request for ${data.propertyName} is submitted and awaiting approvals.`,
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
            title: `📢 New Notice Posted`,
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
            title: `🎬 Movie Scheduled: ${data.title}`,
            body: `Playing on ${data.date} at ${data.timing}`,
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
            title: `📊 New Ledger Uploaded`,
            body: `${data.title} (${data.month} ${data.year}) is now available.`,
            type: 'system'
         }).catch(() => {});
      }
    });
  });

}
