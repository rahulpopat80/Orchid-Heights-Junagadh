const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const targetInputs = `                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Wings (Optional, comma separated)</label>
                      <input
                        type="text"
                        value={finTargetWings.join(', ')}
                        onChange={(e) => setFinTargetWings(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. A, B"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Flats (Optional, comma separated)</label>
                      <input
                        type="text"
                        value={finTargetFlats.join(', ')}
                        onChange={(e) => setFinTargetFlats(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. 101, 202"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>`;

code = code.replace(
  /<div className="col-span-2">\s*<label className="block text-\[10px\] font-bold text-slate-500 mb-1 uppercase">Ledger \/ Report Description<\/label>/,
  `${targetInputs}\n                    <div className="col-span-2">\n                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ledger / Report Description</label>`
);

const uploadButtonReplacement = `                  <button
                    type="submit"
                    disabled={isFinUploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isFinUploading ? \`Publishing Ledger... \${finUploadProgress}%\` : (editingFinance ? 'Save Changes' : 'Publish Ledger Entry')}
                  </button>`;

code = code.replace(
  /<button\s+type="submit"\s+className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition"\s*>\s*\{editingFinance \? 'Save Changes' : 'Publish Ledger Entry'\}\s*<\/button>/,
  uploadButtonReplacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Applied fifth part of replacement');
