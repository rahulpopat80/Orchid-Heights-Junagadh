const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      await api.createComplaint({
        id: editingComplaint.id,
        flatId: editingComplaint.flatId,
        title: editingComplaint.title,
        description: editingComplaint.description,
        mediaUrl: editingComplaint.mediaUrl || '',
        mediaName: editingComplaint.mediaName || '',
        mediaType: editingComplaint.mediaType || '',
        status: editingComplaint.status,
        createdAt: editingComplaint.createdAt,
        resolvedAt: editingComplaint.status === 'resolved' ? (editingComplaint.resolvedAt || new Date().toISOString()) : null,
        resolvedBy: editingComplaint.status === 'resolved' ? (editingComplaint.resolvedBy || 'Secretary Rahul Popat') : null,
        processNotes: editingComplaint.processNotes || ''
      });`;

const replaceStr = `      await api.createComplaint({
        id: editingComplaint.id,
        flatId: editingComplaint.flatId,
        ownerName: editingComplaint.ownerName,
        title: editingComplaint.title,
        description: editingComplaint.description,
        mediaUrl: editingComplaint.mediaUrl || '',
        mediaName: editingComplaint.mediaName || '',
        mediaType: editingComplaint.mediaType || '',
        status: editingComplaint.status,
        createdAt: editingComplaint.createdAt,
        resolvedAt: editingComplaint.status === 'resolved' ? (editingComplaint.resolvedAt || new Date().toISOString()) : null,
        resolvedBy: editingComplaint.status === 'resolved' ? (editingComplaint.resolvedBy || 'Secretary Rahul Popat') : null,
        processNotes: editingComplaint.processNotes || '',
        attachments: editingComplaint.attachments || []
      });`;

if (code.includes('processNotes: editingComplaint.processNotes || \'\'')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched AdminDashboard complaint update logic");
} else {
  console.log("Could not find target in AdminDashboard");
}
