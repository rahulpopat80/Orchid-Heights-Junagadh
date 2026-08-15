const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Wrap table in overflow-x-auto
const targetTableWrap = `<div className="max-h-[600px] overflow-y-auto border border-slate-100 rounded-xl">`;
const replaceTableWrap = `<div className="max-h-[600px] overflow-y-auto overflow-x-auto border border-slate-100 rounded-xl w-full">`;
code = code.replace(targetTableWrap, replaceTableWrap);

// Check if there are other tables like complaints or notices that need overflow-x-auto
const targetSearchWrap = `<div className="relative w-full sm:w-64">`;
const replaceSearchWrap = `<div className="relative w-full sm:w-64 max-w-[calc(100vw-3rem)]">`;
code = code.replace(targetSearchWrap, replaceSearchWrap);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Made admin flats directory responsive");
