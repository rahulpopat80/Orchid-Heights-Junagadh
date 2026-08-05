const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'lib', 'fallback.ts');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `export function createComplaintLocal(payload: any): Complaint {
  const { id, flatId, wing, flatNo, title, description, mediaUrl, mediaName, mediaType, status, createdAt, resolvedAt, resolvedBy, processNotes, attachments } = payload;
  const complaintId = id || 'comp_' + Math.random().toString(36).substring(2, 11);
  const derivedFlatId = flatId || (wing && flatNo ? \`\${wing}-\${flatNo}\` : 'B-1104');
  const newComplaint: Complaint = {
    id: complaintId,
    flatId: derivedFlatId,
    title: title || '',`;

const replaceStr = `export function createComplaintLocal(payload: any): Complaint {
  const { id, flatId, wing, flatNo, ownerName, title, description, mediaUrl, mediaName, mediaType, status, createdAt, resolvedAt, resolvedBy, processNotes, attachments } = payload;
  const complaintId = id || 'comp_' + Math.random().toString(36).substring(2, 11);
  const derivedFlatId = flatId || (wing && flatNo ? \`\${wing}-\${flatNo}\` : 'B-1104');
  const newComplaint: Complaint = {
    id: complaintId,
    flatId: derivedFlatId,
    ownerName: ownerName,
    title: title || '',`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched createComplaintLocal");
} else {
  console.log("Could not find target in createComplaintLocal");
}
