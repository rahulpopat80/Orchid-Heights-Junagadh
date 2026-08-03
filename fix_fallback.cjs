const fs = require('fs');
let content = fs.readFileSync('src/lib/fallback.ts', 'utf8');

const target = `  const currentOwner = owners[idx];
  const { nameEn, nameGu, phone, secondaryContact, members, vehicles, password } = payload;
  const updated = {
    ...currentOwner,
    ...(nameEn !== undefined && { nameEn }),
    ...(nameGu !== undefined && { nameGu }),
    ...(phone !== undefined && { phone }),
    ...(secondaryContact !== undefined && { secondaryContact }),
    ...(members !== undefined && { members: members.slice(0, 2) }),
    ...(vehicles !== undefined && { vehicles }),
    ...(payload.notificationsEnabled !== undefined && { notificationsEnabled: payload.notificationsEnabled })
  };`;

const replace = `  const currentOwner = owners[idx];
  const { nameEn, nameGu, phone, secondaryContact, members, vehicles, password, devices } = payload;
  const updated = {
    ...currentOwner,
    ...(nameEn !== undefined && { nameEn }),
    ...(nameGu !== undefined && { nameGu }),
    ...(phone !== undefined && { phone }),
    ...(secondaryContact !== undefined && { secondaryContact }),
    ...(members !== undefined && { members: members.slice(0, 5) }),
    ...(vehicles !== undefined && { vehicles }),
    ...(devices !== undefined && { devices }),
    ...(payload.notificationsEnabled !== undefined && { notificationsEnabled: payload.notificationsEnabled })
  };
  
  if (devices === undefined && currentOwner.devices) {
    updated.devices = currentOwner.devices;
  }`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync('src/lib/fallback.ts', content);
    console.log("Updated fallback.ts");
} else {
    console.log("Target not found!");
}
