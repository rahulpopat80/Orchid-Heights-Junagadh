const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'resident', 'PreEntrySection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                  <div className="col-span-2 mt-1">
                    <span className="block text-slate-400 font-medium">Reason</span>
                    <span className="font-bold text-slate-800 block">{selectedPass.reason} ({selectedPass.visitorCount} Visitors)</span>
                  </div>
                </div>`;

const replaceStr = `                  <div className="col-span-2 mt-1 flex justify-between">
                    <div>
                      <span className="block text-slate-400 font-medium">Reason</span>
                      <span className="font-bold text-slate-800 block">{selectedPass.reason} ({selectedPass.visitorCount} Visitors)</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-400 font-medium">Uses</span>
                      <span className="font-bold text-slate-800 block">{selectedPass.uses || 0} / {selectedPass.maxUses || 1}</span>
                    </div>
                  </div>
                </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PreEntry pass modal maxuses");
}
