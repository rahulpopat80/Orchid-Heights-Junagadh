const fs = require('fs');

// Fix ResidentDashboard
let resContent = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');
// unsubLogs removal
resContent = resContent.replace(/unsubLogs\(\);\n/g, '');

// Removing the prop passes to AmenitiesSection again properly since it might have been missed by naive regex
resContent = resContent.replace(/setShowExitPhotoModal=\{setShowExitPhotoModal\}/g, '');
resContent = resContent.replace(/exitPhotoBase64=\{exitPhotoBase64\}/g, '');
resContent = resContent.replace(/handleExitPhotoChange=\{handleExitPhotoChange\}/g, '');
resContent = resContent.replace(/handleConfirmCheckOut=\{handleConfirmCheckOut\}/g, '');
resContent = resContent.replace(/exitPhotoTimeError=\{exitPhotoTimeError\}/g, '');
resContent = resContent.replace(/gymTheatreSuccess=\{gymTheatreSuccess\}/g, '');
resContent = resContent.replace(/gymTheatreError=\{gymTheatreError\}/g, '');
resContent = resContent.replace(/activeCheckInLog=\{activeCheckInLog\}/g, '');

fs.writeFileSync('src/components/ResidentDashboard.tsx', resContent);

// Fix AmenitiesSection
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');
amContent = amContent.replace(/const activeGym = gymTheatreLogs.*?;/g, '');
amContent = amContent.replace(/const activeTheatre = gymTheatreLogs.*?;/g, '');
amContent = amContent.replace(/const filteredLogs = gymTheatreLogs.*?;/g, '');
// Wait, is there any remaining handleCheckInGymTheatre? Let's check line 422
// Ah, they might be in the code somewhere else. 
// Let's just remove those lines entirely if they exist.
amContent = amContent.replace(/handleCheckOutGymTheatreFlow\(activeGym\)/g, 'undefined');
amContent = amContent.replace(/handleCheckInGymTheatre\('Gym'\)/g, 'undefined');
amContent = amContent.replace(/handleCheckOutGymTheatreFlow\(activeTheatre\)/g, 'undefined');
amContent = amContent.replace(/handleCheckInGymTheatre\('Theatre'\)/g, 'undefined');
// We actually removed the gym block but maybe it missed something because of regex.

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
