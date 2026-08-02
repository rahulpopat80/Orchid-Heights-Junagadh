const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const target1 = `const [activeSub, setActiveSub] = useState<'menu' | 'notices' | 'complaints' | 'financials'>(
    viewMode === 'complaints' ? 'complaints' : 'menu'
  );`;
const replace1 = `const [activeSub, setActiveSub] = useState<'menu' | 'notices' | 'complaints' | 'financials'>(
    viewMode === 'complaints' ? 'complaints' : 'menu'
  );

  const [noticeSearchTerm, setNoticeSearchTerm] = useState('');
  const [financeSearchTerm, setFinanceSearchTerm] = useState('');`;

code = code.replace(target1, replace1);

const filterTarget = `const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';

    if (targetType === 'wing' && targetWing !== wing) return false;
    if (targetType === 'flat' && (targetWing !== wing || targetFlat !== String(flatNo))) return false;
    return true;
  });`;

const filterReplace = `const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';

    if (targetType === 'wing' && targetWing !== wing) return false;
    if (targetType === 'flat' && (targetWing !== wing || targetFlat !== String(flatNo))) return false;
    
    if (noticeSearchTerm.trim()) {
      const search = noticeSearchTerm.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || item.message || item.text || '').toLowerCase();
      const date = new Date(item.createdAt || item.timestamp || new Date()).toLocaleDateString('en-IN').toLowerCase();
      if (!title.includes(search) && !desc.includes(search) && !date.includes(search)) {
        return false;
      }
    }
    
    return true;
  });

  const filteredFinancials = (financials || []).filter(item => {
    if (!financeSearchTerm.trim()) return true;
    const search = financeSearchTerm.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const date = new Date(item.createdAt || item.timestamp || new Date()).toLocaleDateString('en-IN').toLowerCase();
    if (!title.includes(search) && !desc.includes(search) && !date.includes(search)) {
      return false;
    }
    return true;
  });
`;

code = code.replace(filterTarget, filterReplace);

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
