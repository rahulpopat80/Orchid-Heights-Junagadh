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
                  min={1}
                  max={20}
                  required
                  value={visitorCount}
                  onChange={(e) => setVisitorCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>`;

const replaceStr = `              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={visitorCount}
                  onChange={(e) => setVisitorCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Allowed Entries (Max Uses)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Specifies how many times this pass can be used for entry. E.g. For delivery boy entering 2 times today, set it to 2.
              </p>
            </div>`;

if (code.includes('Total Allowed Entries (Max Uses)')) {
    console.log("Already patched maxUses input.");
} else if (code.includes('className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"')) {
    const regex = /<div className="space-y-2">\s*<label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">\s*Count\s*<\/label>\s*<input\s*type="number"\s*min=\{1\}\s*max=\{20\}\s*required\s*value=\{visitorCount\}\s*onChange=\{\(e\) => setVisitorCount\(parseInt\(e\.target\.value\) \|\| 1\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white"\s*\/>\s*<\/div>\s*<\/div>/g;
    code = code.replace(regex, replaceStr);
    fs.writeFileSync(file, code);
    console.log("Patched PreEntrySection maxUses input");
} else {
    console.log("Could not find Count input exactly as formatted.");
}
