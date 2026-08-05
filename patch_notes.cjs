const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `{/* Process feedback notes */}
                        {item.resolutionNotes && (
                          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-900 space-y-1">
                            <p className="font-bold uppercase tracking-wider text-[8px] text-indigo-600">Secretary Update:</p>
                            <p className="font-medium text-left">{item.resolutionNotes}</p>
                          </div>
                        )}`;

const replacementStr = `{/* Process feedback notes */}
                        {(item.resolutionNotes || item.processNotes) && (
                          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-900 space-y-1">
                            <p className="font-bold uppercase tracking-wider text-[8px] text-indigo-600">Secretary Review & Actions Done:</p>
                            <p className="font-medium text-left">{item.processNotes || item.resolutionNotes}</p>
                          </div>
                        )}`;

if (code.includes('{item.resolutionNotes && (')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(file, code);
  console.log("Patched notes successfully.");
} else {
  console.log("target not found");
}
