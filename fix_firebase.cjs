const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const target = `    const { nameEn, nameGu, phone, secondaryContact, members, vehicles, password } = payload;
    const updated: any = { ...currentOwner };
    if (nameEn !== undefined) updated.nameEn = nameEn;
    if (nameGu !== undefined) updated.nameGu = nameGu;
    if (phone !== undefined) updated.phone = phone;
    if (secondaryContact !== undefined) updated.secondaryContact = secondaryContact;
    if (members !== undefined) updated.members = members.slice(0, 5);
    if (vehicles !== undefined) updated.vehicles = vehicles;
    if (payload.notificationsEnabled !== undefined) updated.notificationsEnabled = payload.notificationsEnabled;

    await setDoc(ownerRef, updated);`;

const replace = `    const { nameEn, nameGu, phone, secondaryContact, members, vehicles, password, devices } = payload;
    const updated: any = { ...currentOwner };
    if (nameEn !== undefined) updated.nameEn = nameEn;
    if (nameGu !== undefined) updated.nameGu = nameGu;
    if (phone !== undefined) updated.phone = phone;
    if (secondaryContact !== undefined) updated.secondaryContact = secondaryContact;
    if (members !== undefined) updated.members = members.slice(0, 5);
    if (vehicles !== undefined) updated.vehicles = vehicles;
    if (devices !== undefined) updated.devices = devices;
    if (payload.notificationsEnabled !== undefined) updated.notificationsEnabled = payload.notificationsEnabled;
    
    // Explicitly preserve current devices if they exist and are not passed in payload
    if (devices === undefined && currentOwner.devices) {
      updated.devices = currentOwner.devices;
    }

    await setDoc(ownerRef, updated, { merge: true });`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync('src/lib/firebase.ts', content);
    console.log("Updated updateOwnerDetails in firebase.ts");
} else {
    console.log("Target not found!");
}
