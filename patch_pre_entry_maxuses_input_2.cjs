const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'resident', 'PreEntrySection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={visitorCount}
                  onChange={(e) => setVisitorCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>`;

const replaceStr = `              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={visitorCount}
                  onChange={(e) => setVisitorCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Max Pass Usage (Times)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={maxUses}
                onChange={(e) => setMaxUses(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Specifies how many times this pass can be used. Max 30. Default 1.
              </p>
            </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PreEntrySection maxUses input 2");
} else {
  console.log("Target string not found in PreEntrySection");
}
