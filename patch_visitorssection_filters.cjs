const fs = require('fs');
const file = 'src/components/resident/VisitorsSection.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetState = `  const [searchType, setSearchType] = useState('');`;
const replaceState = `  const [searchType, setSearchType] = useState('');
  const [searchEntryMethod, setSearchEntryMethod] = useState('');`;

if (code.includes(targetState)) {
  code = code.replace(targetState, replaceState);
}

const targetFilter = `    if (searchType && log.guestType.toLowerCase() !== searchType.toLowerCase()) match = false;`;
const replaceFilter = `    if (searchType && log.guestType.toLowerCase() !== searchType.toLowerCase()) match = false;
    if (searchEntryMethod && log.entryMethod !== searchEntryMethod) match = false;`;

if (code.includes(targetFilter)) {
  code = code.replace(targetFilter, replaceFilter);
}

const targetUI = `          <div className="relative w-full md:w-auto col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">સમયગાળો (Time Duration)</label>`;
const replaceUI = `          <div className="relative w-full md:w-auto">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Entry Method</label>
            <select
              value={searchEntryMethod}
              onChange={(e) => setSearchEntryMethod(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition text-slate-600"
            >
              <option value="">All Entries</option>
              <option value="Pre-Entry">Pre-Entry</option>
              <option value="Call Entry">Call Entry</option>
              <option value="System-Auto Entry">System-Auto Entry</option>
              <option value="General Entry">General Entry</option>
            </select>
          </div>
          <div className="relative w-full md:w-auto col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">સમયગાળો (Time Duration)</label>`;

if (code.includes(targetUI)) {
  code = code.replace(targetUI, replaceUI);
  fs.writeFileSync(file, code);
  console.log("Patched VisitorsSection filters");
}
