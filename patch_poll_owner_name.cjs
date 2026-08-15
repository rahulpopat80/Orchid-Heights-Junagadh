const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  
  const targetModalList = `                        const name = flatOwnerInfo ? flatOwnerInfo.nameEn : 'Resident';
                        return (
                          <li key={fid} className="text-xs flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700">{name}</span>
                            <span className="font-bold font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{fid}</span>
                          </li>
                        );`;

  const replaceModalList = `                        // Look up the real owner if there's a stored name, or fallback to generic
                        let voterName = 'Resident';
                        if (flatOwnerInfo && flatOwnerInfo.nameEn) {
                          voterName = flatOwnerInfo.nameEn;
                        } else {
                          voterName = 'Family Member';
                        }

                        return (
                          <li key={fid} className="text-xs flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700 truncate mr-2">{voterName}</span>
                            <span className="font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">{fid}</span>
                          </li>
                        );`;

  if (code.includes(targetModalList)) {
    code = code.replace(targetModalList, replaceModalList);
    fs.writeFileSync(filepath, code);
    console.log('Patched poll modal in ' + filepath);
  } else {
    console.log('Target not found in ' + filepath);
  }
}

patchFile('src/components/resident/ChatSection.tsx');
patchFile('src/components/admin/AdminChatSection.tsx');
