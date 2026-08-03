const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const targetSeed = `        await setDoc(doc(db, 'owners', id), owner, { merge: true });
        const password = 'admin@123';
        // Only set default password if it doesn't already exist
        const pwdRef = doc(db, 'passwords', id);
        const pwdSnap = await getDoc(pwdRef);
        if (!pwdSnap.exists()) {
          await setDoc(pwdRef, { wing: owner.wing, flatNo: owner.flatNo, password });
        }`;

// We need to fetch the owner first and merge preserving the fields!
const replaceSeed = `        
        const ownerRef = doc(db, 'owners', id);
        const ownerSnap = await getDoc(ownerRef);
        if (ownerSnap.exists()) {
          const currentData = ownerSnap.data();
          await setDoc(ownerRef, { ...owner, ...currentData, devices: currentData.devices || [], members: currentData.members || owner.members, vehicles: currentData.vehicles || [] }, { merge: true });
        } else {
          await setDoc(ownerRef, owner);
        }

        const password = 'admin@123';
        const pwdRef = doc(db, 'passwords', id);
        const pwdSnap = await getDoc(pwdRef);
        if (!pwdSnap.exists()) {
          await setDoc(pwdRef, { wing: owner.wing, flatNo: owner.flatNo, password });
        }`;

if (content.includes(targetSeed)) {
    content = content.replace(targetSeed, replaceSeed);
    fs.writeFileSync('src/lib/firebase.ts', content);
    console.log("Updated seedDatabaseIfNeeded in firebase.ts to preserve existing user fields.");
} else {
    console.log("Target not found in firebase.ts!");
}
