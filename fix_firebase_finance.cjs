const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const replacement = `export async function createFinancialReport(payload: any): Promise<FinancialReport> {
  if (isQuotaExceeded) return fallback.createFinancialReportLocal(payload);
  const { id, month, year, title, description, pdfUrl, fileName, fileType, totalExpense, uploadedBy, reportType, createdAt, attachments, csvRows, targetWings, targetFlats } = payload;
  const reportId = id || 'fin_' + Math.random().toString(36).substring(2, 11);
  const newReport: FinancialReport = {
    id: reportId, month: month || new Date().toLocaleString('default', { month: 'long' }), year: parseInt(year, 10) || new Date().getFullYear(),
    title: title || '', description: description || '', pdfUrl: pdfUrl || '', fileName: fileName || '', fileType: fileType || '',
    totalExpense: parseFloat(totalExpense) || 0, createdAt: createdAt || new Date().toISOString(), uploadedBy: uploadedBy || 'Rahul Popat (B-1104 / Admin)',
    reportType: reportType || 'expense', attachments: attachments || [],
    csvRows: csvRows || [], targetWings: targetWings || [], targetFlats: targetFlats || []
  };`;

code = code.replace(/export async function createFinancialReport\(payload: any\): Promise<FinancialReport> \{[\s\S]*?attachments: attachments \|\| \[\]\n  \};/, replacement);

fs.writeFileSync('src/lib/firebase.ts', code);
console.log('Fixed firebase');
