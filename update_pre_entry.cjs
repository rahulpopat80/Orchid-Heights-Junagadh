const fs = require('fs');

let code = fs.readFileSync('src/components/resident/PreEntrySection.tsx', 'utf8');

const replacement = `                      <button
                        onClick={() => handleSelectPass(entry)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Pass</span>
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this pre-entry pass?')) {
                            const success = await api.deletePreEntry(entry.id);
                            if (success) {
                              setPreEntries(prev => prev.filter(p => p.id !== entry.id));
                              if (selectedPass?.id === entry.id) setSelectedPass(null);
                            }
                          }
                        }}
                        className="p-2 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                        title="Delete Pass"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>`;

code = code.replace(
  /<button\s+onClick=\{\(\) => handleSelectPass\(entry\)\}\s+className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1\.5 transition shadow-xs"\s+>\s+<QrCode className="w-3\.5 h-3\.5 text-indigo-600" \/>\s+<span>View Pass<\/span>\s+<\/button>/,
  replacement
);

fs.writeFileSync('src/components/resident/PreEntrySection.tsx', code);
