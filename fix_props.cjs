const fs = require('fs');
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

amContent = amContent.replace(/  setShowExitPhotoModal: \(show: boolean\) => void;\n/g, '');
amContent = amContent.replace(/  exitPhotoBase64: string;\n/g, '');
amContent = amContent.replace(/  handleExitPhotoChange: \(file: File\) => void;\n/g, '');
amContent = amContent.replace(/  handleConfirmCheckOut: \(\) => void;\n/g, '');
amContent = amContent.replace(/  exitPhotoTimeError: boolean;\n/g, '');
amContent = amContent.replace(/  activeCheckInLog: GymTheatreLog \| null;\n/g, '');
amContent = amContent.replace(/  gymTheatreSuccess: string;\n/g, '');
amContent = amContent.replace(/  gymTheatreError: string;\n/g, '');

amContent = amContent.replace(/  setShowExitPhotoModal,\n/g, '');
amContent = amContent.replace(/  exitPhotoBase64,\n/g, '');
amContent = amContent.replace(/  handleExitPhotoChange,\n/g, '');
amContent = amContent.replace(/  handleConfirmCheckOut,\n/g, '');
amContent = amContent.replace(/  exitPhotoTimeError,\n/g, '');
amContent = amContent.replace(/  activeCheckInLog,\n/g, '');
amContent = amContent.replace(/  gymTheatreSuccess,\n/g, '');
amContent = amContent.replace(/  gymTheatreError,\n/g, '');

// also there are left overs inside component body
amContent = amContent.replace(/\{activeGym \? \([\s\S]*?\}\)/g, '');
amContent = amContent.replace(/\{activeTheatre \? \([\s\S]*?\}\)/g, '');

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
