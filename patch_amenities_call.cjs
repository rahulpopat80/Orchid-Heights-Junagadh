const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'AmenitiesSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                        Duration: {duration}
                      </span>
                    </div>`;

const newStr = `                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                        Duration: {duration}
                      </span>
                      {log.memberPhone && (
                        <a href={\`tel:\${log.memberPhone}\`} className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded transition flex items-center space-x-1 cursor-pointer">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync(file, code);
  console.log("Patched call button successfully");
} else {
  console.log("Could not find target string.");
}
