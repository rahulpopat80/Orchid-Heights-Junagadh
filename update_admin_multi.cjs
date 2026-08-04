const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Update NoticeTarget state type
code = code.replace(
  "const [noticeTarget, setNoticeTarget] = useState<'all' | 'wing' | 'flat'>('all');",
  "const [noticeTarget, setNoticeTarget] = useState<'all' | 'wing' | 'flat' | 'multi'>('all');\n  const [noticeTargetFlats, setNoticeTargetFlats] = useState<string[]>([]);\n  const [isNoticeMultiSelectOpen, setIsNoticeMultiSelectOpen] = useState(false);\n  const [isFinMultiSelectOpen, setIsFinMultiSelectOpen] = useState(false);\n  const [multiSelectSearch, setMultiSelectSearch] = useState('');"
);

// 2. Clear noticeTargetFlats in handleSaveNotice
code = code.replace(
  "setNoticeAttachments([]);\n",
  "setNoticeAttachments([]);\n      setNoticeTargetFlats([]);\n"
);

// 3. Add multi flats logic to announcement payload
const annPayloadSearch = `    if (noticeTarget !== 'all') {
      annPayload.wing = noticeWing;
      if (noticeTarget === 'flat') {
        annPayload.flatNo = noticeFlatNo;
      }
    }`;
const annPayloadReplace = `    if (noticeTarget !== 'all') {
      annPayload.wing = noticeWing;
      if (noticeTarget === 'flat') {
        annPayload.flatNo = noticeFlatNo;
      }
      if (noticeTarget === 'multi') {
        annPayload.targetFlats = noticeTargetFlats;
      }
    }`;
code = code.replace(annPayloadSearch, annPayloadReplace);

// 4. Update editing for notice
const editNoticeSearch = `    setNoticeTarget(ann.target);
    setNoticeWing(ann.wing || 'A');`;
const editNoticeReplace = `    setNoticeTarget(ann.target as any);
    setNoticeTargetFlats(ann.targetFlats || []);
    setNoticeWing(ann.wing || 'A');`;
code = code.replace(editNoticeSearch, editNoticeReplace);

// 5. Replace Notice form target dropdown
const noticeTargetSelectSearch = `<option value="all">Entire Society (All Residents)</option>
                        <option value="wing">Specific Wing Only</option>
                        <option value="flat">Specific Flat Only</option>`;
const noticeTargetSelectReplace = `<option value="all">Entire Society (All Residents)</option>
                        <option value="wing">Specific Wing Only</option>
                        <option value="flat">Specific Flat Only</option>
                        <option value="multi">Multiple Specific Flats</option>`;
code = code.replace(noticeTargetSelectSearch, noticeTargetSelectReplace);

// 6. Add multi select UI for Notice
const noticeFlatInputSearch = `                  {noticeTarget === 'flat' && (
                    <div className="w-1/2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Flat No</label>
                      <input
                        type="number"
                        min="101" max="1504"
                        value={noticeFlatNo}
                        onChange={(e) => setNoticeFlatNo(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  )}`;
const noticeFlatInputReplace = `                  {noticeTarget === 'flat' && (
                    <div className="w-1/2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Flat No</label>
                      <input
                        type="number"
                        min="101" max="1504"
                        value={noticeFlatNo}
                        onChange={(e) => setNoticeFlatNo(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  )}
                  {noticeTarget === 'multi' && (
                    <div className="w-full relative">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Select Multiple Flats</label>
                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-indigo-700">{noticeTargetFlats.length} Flats Selected</span>
                          <input type="text" placeholder="Search flat..." value={multiSelectSearch} onChange={e => setMultiSelectSearch(e.target.value)} className="border rounded px-2 py-1 text-xs outline-none w-32" />
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                          {owners.map(o => o.wing + '-' + o.flatNo).filter(f => f.toLowerCase().includes(multiSelectSearch.toLowerCase())).map(flatId => (
                            <button
                              key={flatId}
                              type="button"
                              onClick={() => setNoticeTargetFlats(prev => prev.includes(flatId) ? prev.filter(f => f !== flatId) : [...prev, flatId])}
                              className={\`py-1 rounded text-xs font-bold border transition-all text-center \${noticeTargetFlats.includes(flatId) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700'}\`}
                            >
                              {flatId}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}`;
code = code.replace(noticeFlatInputSearch, noticeFlatInputReplace);

// 7. Update Financial Ledger Multi Select
const finFlatInputSearch = `                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Flats (Optional, comma separated)</label>
                      <input
                        type="text"
                        value={finTargetFlats.join(', ')}
                        onChange={(e) => setFinTargetFlats(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. 101, 202"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                    </div>`;
const finFlatInputReplace = `                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Flats (Optional, select multiple)</label>
                      <div className="w-full relative">
                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-indigo-700">{finTargetFlats.length} Flats Selected</span>
                          <input type="text" placeholder="Search flat..." value={multiSelectSearch} onChange={e => setMultiSelectSearch(e.target.value)} className="border rounded px-2 py-1 text-xs outline-none w-24" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                          {owners.map(o => o.wing + '-' + o.flatNo).filter(f => f.toLowerCase().includes(multiSelectSearch.toLowerCase())).map(flatId => (
                            <button
                              key={flatId}
                              type="button"
                              onClick={() => setFinTargetFlats(prev => prev.includes(flatId) ? prev.filter(f => f !== flatId) : [...prev, flatId])}
                              className={\`py-1 rounded text-[10px] font-bold border transition-all text-center \${finTargetFlats.includes(flatId) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700'}\`}
                            >
                              {flatId}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    </div>`;
code = code.replace(finFlatInputSearch, finFlatInputReplace);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
