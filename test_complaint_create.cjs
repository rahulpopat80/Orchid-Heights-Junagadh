const fs = require('fs');
const code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('export async function createComplaint(payload: any): Promise<Complaint> {'));
const end = lines.findIndex((l, i) => i > start && l.includes('return newComplaint;'));
console.log(lines.slice(start, end + 3).join('\n'));
