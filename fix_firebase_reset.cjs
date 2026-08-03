const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const targetReset = `export async function resetDatabaseToDefault(): Promise<boolean> {
  if (isQuotaExceeded) return fallback.resetDatabaseToDefaultLocal();
  try {
    const snap = await getDocs(collection(db, 'owners'));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'owners', d.id));
      await deleteDoc(doc(db, 'passwords', d.id));
    }
    const visitorsSnap = await getDocs(collection(db, 'visitors'));
    for (const d of visitorsSnap.docs) await deleteDoc(doc(db, 'visitors', d.id));
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    for (const d of notificationsSnap.docs) await deleteDoc(doc(db, 'notifications', d.id));
  } catch (error) {`;

const replaceReset = `export async function resetDatabaseToDefault(): Promise<boolean> {
  if (isQuotaExceeded) return fallback.resetDatabaseToDefaultLocal();
  try {
    // DO NOT DELETE 'owners' and 'passwords' collections entirely!
    // We only want to delete transactional data, but keep resident accounts, devices, and passwords intact.
    
    // Clear all visitors
    const visitorsSnap = await getDocs(collection(db, 'visitors'));
    for (const d of visitorsSnap.docs) await deleteDoc(doc(db, 'visitors', d.id));
    
    // Clear notifications
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    for (const d of notificationsSnap.docs) await deleteDoc(doc(db, 'notifications', d.id));
    
    // Clear society_notifications
    const socNotifSnap = await getDocs(collection(db, 'society_notifications'));
    for (const d of socNotifSnap.docs) await deleteDoc(doc(db, 'society_notifications', d.id));

    // Clear complaints
    const complaintsSnap = await getDocs(collection(db, 'complaints'));
    for (const d of complaintsSnap.docs) await deleteDoc(doc(db, 'complaints', d.id));

    // Clear amenities bookings
    const amenitiesSnap = await getDocs(collection(db, 'amenities_bookings'));
    for (const d of amenitiesSnap.docs) await deleteDoc(doc(db, 'amenities_bookings', d.id));

  } catch (error) {`;

if (content.includes(targetReset)) {
    content = content.replace(targetReset, replaceReset);
    
    // Also, we need to fix seedDatabaseIfNeeded to use { merge: true }
    const targetSeed = `        await setDoc(doc(db, 'owners', id), owner);
        const password = 'admin@123';
        await setDoc(doc(db, 'passwords', id), { wing: owner.wing, flatNo: owner.flatNo, password });`;
    
    const replaceSeed = `        await setDoc(doc(db, 'owners', id), owner, { merge: true });
        const password = 'admin@123';
        // Only set default password if it doesn't already exist
        const pwdRef = doc(db, 'passwords', id);
        const pwdSnap = await getDoc(pwdRef);
        if (!pwdSnap.exists()) {
          await setDoc(pwdRef, { wing: owner.wing, flatNo: owner.flatNo, password });
        }`;
        
    content = content.replace(targetSeed, replaceSeed);
    
    fs.writeFileSync('src/lib/firebase.ts', content);
    console.log("Updated resetDatabaseToDefault in firebase.ts");
} else {
    console.log("Target not found in firebase.ts!");
}
