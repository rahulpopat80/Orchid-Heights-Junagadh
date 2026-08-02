const fs = require('fs');
let content = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const stateHook = `  const [submitting, setSubmitting] = useState<boolean>(false);`;
const states = `  const [noticesSearchText, setNoticesSearchText] = useState('');
  const [noticesSearchDate, setNoticesSearchDate] = useState('');
  const [ledgerSearchText, setLedgerSearchText] = useState('');
  const [ledgerSearchDate, setLedgerSearchDate] = useState('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);`;
content = content.replace(stateHook, states);

const filterNoticesFuncStr = `  // Filter announcements matching wing & flatNo target criteria
  const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';
    if (targetType === 'all') return true;
    if (targetType === 'wing') {
      return targetWing.toLowerCase() === wing.toLowerCase();
    }
    if (targetType === 'flat') {
      return targetWing.toLowerCase() === wing.toLowerCase() && Number(targetFlat) === Number(flatNo);
    }
    return true;
  });`;

const filterNoticesNewStr = `  // Filter announcements matching wing & flatNo target criteria, and 3-month limit, and search filters
  const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';
    
    let isTargetMatch = false;
    if (targetType === 'all') isTargetMatch = true;
    else if (targetType === 'wing' && targetWing.toLowerCase() === wing.toLowerCase()) isTargetMatch = true;
    else if (targetType === 'flat' && targetWing.toLowerCase() === wing.toLowerCase() && Number(targetFlat) === Number(flatNo)) isTargetMatch = true;
    
    if (!isTargetMatch) return false;

    const createdAt = item.createdAt || item.timestamp || new Date().toISOString();
    const noticeDate = new Date(createdAt);
    
    // 3 Months limit (90 days)
    const daysDiff = (new Date().getTime() - noticeDate.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 90) return false;

    if (noticesSearchText) {
      const text = (item.title || item.text || item.content || '').toLowerCase();
      if (!text.includes(noticesSearchText.toLowerCase())) return false;
    }

    if (noticesSearchDate) {
      const logDate = noticeDate.toISOString().split('T')[0];
      if (logDate !== noticesSearchDate) return false;
    }

    return true;
  });`;
content = content.replace(filterNoticesFuncStr, filterNoticesNewStr);

const financialLengthStr = `Ledger Statements ({financials.length})`;
const financialLengthNewStr = `Ledger Statements ({filteredFinancials.length})`;
content = content.replace(financialLengthStr, financialLengthNewStr);

const financialLoadingStr = `{loadingFinancials ? (
              <div className="py-8 text-center text-slate-400">Loading financial list...</div>
            ) : financials.length === 0 ? (`
const financialLoadingNewStr = `
            {loadingFinancials ? (
              <div className="py-8 text-center text-slate-400">Loading financial list...</div>
            ) : filteredFinancials.length === 0 ? (`
content = content.replace(financialLoadingStr, financialLoadingNewStr);

const financialMapStr = `{financials.map((report) => (`
const financialMapNewStr = `{filteredFinancials.map((report) => (`
content = content.replace(financialMapStr, financialMapNewStr);

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', content);
