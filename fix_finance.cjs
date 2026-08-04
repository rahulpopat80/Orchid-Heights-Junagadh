const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add imports
if (!code.includes('uploadFileInChunks')) {
  code = code.replace("import { Download, Upload, Plus, X, Phone, User, Users, FileText, CheckCircle, Clock, Trash2, Edit3, Image as ImageIcon, Briefcase, Truck, Activity, Lock, Search, FileSpreadsheet } from 'lucide-react';",
  "import { Download, Upload, Plus, X, Phone, User, Users, FileText, CheckCircle, Clock, Trash2, Edit3, Image as ImageIcon, Briefcase, Truck, Activity, Lock, Search, FileSpreadsheet } from 'lucide-react';\nimport { uploadFileInChunks } from '../lib/fileStorage';");
}

// 2. State variables
code = code.replace(
  "const [finAttachments, setFinAttachments] = useState<Array<{ url: string; name: string; type: string }>>([]);",
  `const [finAttachments, setFinAttachments] = useState<Array<{ fileId?: string; url?: string; name: string; type: string; file?: File }>>([]);
  const [finTargetWings, setFinTargetWings] = useState<string[]>([]);
  const [finTargetFlats, setFinTargetFlats] = useState<string[]>([]);
  const [finCsvRows, setFinCsvRows] = useState<Array<{category: string; description: string; amount: number}>>([]);
  const [isFinUploading, setIsFinUploading] = useState(false);
  const [finUploadProgress, setFinUploadProgress] = useState(0);`
);

// 3. handleSaveFinance
const newHandleSaveFinance = `  const handleSaveFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinSuccess('');
    if (!finTitle.trim()) return;

    try {
      setIsFinUploading(true);
      setFinUploadProgress(0);

      // Upload any new files in chunks
      const finalAttachments = [];
      let i = 0;
      for (const att of finAttachments) {
        if (att.file && !att.fileId) {
          const meta = await uploadFileInChunks(att.file, (p) => {
            setFinUploadProgress(Math.round(((i * 100) + p) / finAttachments.length));
          });
          finalAttachments.push({ fileId: meta.fileId, name: att.name, type: att.type });
        } else {
          finalAttachments.push({ fileId: att.fileId, url: att.url, name: att.name, type: att.type });
        }
        i++;
      }

      const finId = editingFinance ? editingFinance.id : 'fin_' + Math.random().toString(36).substring(2, 11);
      await api.createFinancialReport({
        id: finId,
        month: finMonth,
        year: finYear,
        title: finTitle.trim(),
        description: finDesc.trim(),
        pdfUrl: finPdfUrl,
        fileName: finFileName,
        fileType: finFileType,
        totalExpense: parseFloat(finExpense) || 0,
        uploadedBy: 'Orchid Heights Admin',
        reportType: finType,
        createdAt: editingFinance ? editingFinance.createdAt : new Date().toISOString(),
        attachments: finalAttachments,
        csvRows: finCsvRows,
        targetWings: finTargetWings.length > 0 ? finTargetWings : undefined,
        targetFlats: finTargetFlats.length > 0 ? finTargetFlats : undefined
      });

      if (!editingFinance) {
        await api.createSocietyNotification({
          type: 'financial',
          title: \`💰 New Financial Ledger: \${finTitle.trim()}\`,
          message: \`The administration has uploaded the \${finMonth} \${finYear} financial ledger/report.\`,
          metadata: { reportId: finId }
        });
      }

      setFinSuccess(editingFinance ? 'Ledger entry updated successfully.' : 'Ledger entry added successfully.');
      setFinTitle('');
      setFinDesc('');
      setFinPdfUrl('');
      setFinFileName('');
      setFinFileType('');
      setFinAttachments([]);
      setFinExpense('');
      setFinType('expense');
      setFinTargetWings([]);
      setFinTargetFlats([]);
      setFinCsvRows([]);
      setEditingFinance(null);
      setShowFinanceForm(false);
      loadAdminData();
      setTimeout(() => setFinSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setFinSuccess('');
      alert('Error uploading ledger. Files might be too large.');
    } finally {
      setIsFinUploading(false);
    }
  };

  const handleEditFinance = (report: FinancialReport) => {
    setEditingFinance(report);
    setFinMonth(report.month);
    setFinYear(report.year);
    setFinTitle(report.title);
    setFinDesc(report.description);
    setFinPdfUrl(report.pdfUrl || '');
    setFinFileName(report.fileName || '');
    setFinFileType(report.fileType || '');
    
    const initialAttachments = [...(report.attachments || [])];
    if (report.pdfUrl && !initialAttachments.some(att => att.url === report.pdfUrl)) {
      initialAttachments.push({ url: report.pdfUrl, name: report.fileName || 'Attachment.pdf', type: report.fileType || 'application/pdf' });
    }
    setFinAttachments(initialAttachments);
    setFinExpense(report.totalExpense.toString());
    setFinType(report.reportType || 'expense');
    setFinTargetWings(report.targetWings || []);
    setFinTargetFlats(report.targetFlats || []);
    setFinCsvRows(report.csvRows || []);
    setShowFinanceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

// replace between const handleSaveFinance and handleImportCsv
code = code.replace(
  /[\s\S]*?(?=const handleSaveFinance = async)/, 
  function(match) { return match; } // keep before handleSaveFinance
);

const parts = code.split('const handleImportCsv = () => {');
const beforeImport = parts[0];
const afterImport = parts[1];

const beforeSaveFinance = beforeImport.substring(0, beforeImport.indexOf('const handleSaveFinance = async'));

let finalCode = beforeSaveFinance + newHandleSaveFinance + '\n\n  const handleImportCsv = () => {' + afterImport;


fs.writeFileSync('src/components/AdminDashboard.tsx', finalCode);
console.log('Applied first part of replacement');
