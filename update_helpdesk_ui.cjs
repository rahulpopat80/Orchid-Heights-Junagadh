const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const noticeHeaderStr = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => navigateToRoute('/help-desk', 'menu')}
              className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 -ml-1" />
              <span className="uppercase tracking-widest text-[10px]">Back</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Notices ({filteredNotices.length})
            </span>
          </div>`;

const noticeSearchStr = `
          <div className="pt-2 pb-2">
            <input 
              type="text" 
              placeholder="Search notices by text or date..." 
              value={noticeSearchTerm}
              onChange={(e) => setNoticeSearchTerm(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>`;

code = code.replace(noticeHeaderStr, noticeHeaderStr + noticeSearchStr);


const financeHeaderStr = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => navigateToRoute('/help-desk', 'menu')}
              className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 -ml-1" />
              <span className="uppercase tracking-widest text-[10px]">Back</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Ledger Statements ({financials.length})
            </span>
          </div>`;

const financeSearchStr = `
          <div className="pt-2 pb-2">
            <input 
              type="text" 
              placeholder="Search ledger by text or date..." 
              value={financeSearchTerm}
              onChange={(e) => setFinanceSearchTerm(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>`;

code = code.replace(financeHeaderStr, financeHeaderStr + financeSearchStr);
code = code.replace(/financials\.map/g, 'filteredFinancials.map');
code = code.replace(/financials\.length === 0/g, 'filteredFinancials.length === 0');

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
