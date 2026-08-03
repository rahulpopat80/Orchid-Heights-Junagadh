const fs = require('fs');
let content = fs.readFileSync('src/lib/fallback.ts', 'utf8');

const targetFallback = `export function resetDatabaseToDefaultLocal(): boolean {
  localStorage.removeItem('orchid_local_owners');
  localStorage.removeItem('orchid_local_passwords');
  localStorage.removeItem('orchid_local_visitors');
  localStorage.removeItem('orchid_local_announcements');
  localStorage.removeItem('orchid_local_complaints');
  localStorage.removeItem('orchid_local_financial_reports');
  localStorage.removeItem('orchid_local_essential_contacts');
  localStorage.removeItem('orchid_local_society_notifications');`;

const replaceFallback = `export function resetDatabaseToDefaultLocal(): boolean {
  // DO NOT remove 'orchid_local_owners' and 'orchid_local_passwords' to preserve user data
  localStorage.removeItem('orchid_local_visitors');
  localStorage.removeItem('orchid_local_announcements');
  localStorage.removeItem('orchid_local_complaints');
  localStorage.removeItem('orchid_local_financial_reports');
  // Keep essential contacts intact optionally, but we'll remove it per old logic or keep it. Let's keep it safe.
  localStorage.removeItem('orchid_local_society_notifications');
  
  // Re-seed owners but merge with existing to preserve passwords and devices
  const existingOwners = getLocalOwners();
  const defaultOwners = require('./initialOwners').initialOwners;
  const mergedOwners = existingOwners.map(eo => {
    const defaultOwner = defaultOwners.find(do1 => do1.wing === eo.wing && do1.flatNo === eo.flatNo);
    if (defaultOwner) {
      return { ...eo, ...defaultOwner, devices: eo.devices, members: eo.members, vehicles: eo.vehicles };
    }
    return eo;
  });
  saveLocalOwners(mergedOwners);
  `;

if (content.includes(targetFallback)) {
    content = content.replace(targetFallback, replaceFallback);
    fs.writeFileSync('src/lib/fallback.ts', content);
    console.log("Updated resetDatabaseToDefaultLocal in fallback.ts");
} else {
    console.log("Target not found in fallback.ts!");
}
