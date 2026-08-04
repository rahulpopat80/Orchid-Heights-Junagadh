const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /\/\/ Build a well-formatted professional CSV[\s\S]*?const csvString = rows\.join\('\\r\\n'\);/g;

const replacement = `// Build a well-formatted professional CSV
      const rows: string[] = [];
      rows.push(\`"ORCHID HEIGHTS - MASTER ADMIN VISITOR REPORT"\`);
      rows.push(\`"Report Filter: ALL | Flat: ALL"\`);
      rows.push(\`"Generated: \${new Date().toLocaleString('en-IN')}"\`);
      rows.push(\`""\`);
      rows.push([
        '"Sr."',
        '"Visitor Name"',
        '"Mobile Number"',
        '"Email"',
        '"Wing"',
        '"Flat No"',
        '"Visitor Type"',
        '"Entry Type"',
        '"Reason"',
        '"Status"',
        '"Request Date"',
        '"Request Time"',
        '"Response Time"',
        '"Approved / Rejected By"',
        '"Exit Time"',
        '"Duration Stayed"',
        '"IP Address"',
        '"Device SN"',
        '"Rejection Reason"'
      ].join(','));

      filtered.forEach((v, idx) => {
        const reqDate = new Date(v.requestTime);
        const respDate = v.respondedTime ? new Date(v.respondedTime) : null;
        const exitDate = v.exitTime ? new Date(v.exitTime) : null;
        
        const reqDateStr = reqDate.toLocaleDateString('en-IN');
        const reqTimeStr = reqDate.toLocaleTimeString('en-IN', { hour12: false });
        const respTimeStr = respDate ? respDate.toLocaleString('en-IN') : '-';
        const exitTimeStr = exitDate ? exitDate.toLocaleString('en-IN') : '-';
        
        let statusStr = v.exited ? 'EXITED' : (v.status || '').toUpperCase();
        
        rows.push([
          \`"\${idx + 1}"\`,
          \`"\${(v.fullName || '').replace(/"/g, '""')}"\`,
          \`"\${v.mobileNumber || ''}"\`,
          \`"\${(v.email || '').replace(/"/g, '""')}"\`,
          \`"\${v.wing}"\`,
          \`"\${v.flatNo}"\`,
          \`"\${v.guestType || ''}"\`,
          \`"\${v.isPreEntry ? 'Pre-Entry' : (v.respondedBy?.includes('Through Call') ? 'Gate Entry (Call)' : 'Gate Entry')}"\`,
          \`"\${(v.reason || '').replace(/"/g, '""')}"\`,
          \`"\${statusStr}"\`,
          \`"\${reqDateStr}"\`,
          \`"\${reqTimeStr}"\`,
          \`"\${respTimeStr}"\`,
          \`"\${(v.respondedBy || '-').replace(/"/g, '""')}"\`,
          \`"\${exitTimeStr}"\`,
          \`"\${(v.duration || '-').replace(/"/g, '""')}"\`,
          \`"-"\`,
          \`"-"\`,
          \`"\${(v.rejectReason || '-').replace(/"/g, '""')}"\`
        ].join(','));
      });

      const csvString = rows.join('\\r\\n');`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
