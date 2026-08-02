const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const targetStr = `  const filteredNotices = (announcements || []).filter(item => {
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

const replacementStr = `  const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';

    let isTargeted = true;
    if (targetType === 'wing' && targetWing.toLowerCase() !== wing.toLowerCase()) isTargeted = false;
    if (targetType === 'flat' && (targetWing.toLowerCase() !== wing.toLowerCase() || Number(targetFlat) !== Number(flatNo))) isTargeted = false;

    if (!isTargeted) return false;

    if (noticeSearchTerm.trim()) {
      const search = noticeSearchTerm.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || item.message || item.text || item.content || '').toLowerCase();
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
  });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
  console.log("Successfully replaced filter logic.");
} else {
  console.log("Could not find the target string. Looking for partial...");
  
  // Try finding just the start of it
  const idx = code.indexOf("const filteredNotices = (announcements || []).filter(item => {");
  if (idx !== -1) {
    const endIdx = code.indexOf("  });", idx) + 5;
    const toReplace = code.substring(idx, endIdx);
    code = code.replace(toReplace, replacementStr);
    fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
    console.log("Successfully replaced filter logic using manual indices.");
  } else {
     console.log("Could not find the target string at all.");
  }
}
