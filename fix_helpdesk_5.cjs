const fs = require('fs');
let content = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

// Notices Search UI
const noticesUI = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Search Notices..." value={noticesSearchText} onChange={e => setNoticesSearchText(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 text-xs font-bold rounded-xl outline-none focus:border-indigo-500" />
            <div className="flex items-center space-x-2 w-full md:w-auto bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold">
               <span className="text-slate-500 uppercase text-[10px]">Date</span>
               <input type="date" value={noticesSearchDate} onChange={e => setNoticesSearchDate(e.target.value)} className="outline-none" />
            </div>
          </div>`;

const targetNotices = /<div className="flex items-center justify-between border-b border-slate-100 pb-3">[^]*?Notices \(\{filteredNotices\.length\}\)[^]*?<\/div>/;
content = content.replace(targetNotices, noticesUI);

// Ledger Search UI
const ledgerUI = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => navigateToRoute('/help-desk', 'menu')}
              className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 -ml-1" />
              <span className="uppercase tracking-widest text-[10px]">Back</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Ledger Statements ({filteredFinancials.length})
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Search Ledger..." value={ledgerSearchText} onChange={e => setLedgerSearchText(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 text-xs font-bold rounded-xl outline-none focus:border-indigo-500" />
            <div className="flex items-center space-x-2 w-full md:w-auto bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold">
               <span className="text-slate-500 uppercase text-[10px]">Date</span>
               <input type="date" value={ledgerSearchDate} onChange={e => setLedgerSearchDate(e.target.value)} className="outline-none" />
            </div>
          </div>`;

const targetLedger = /<div className="flex items-center justify-between border-b border-slate-100 pb-3">[^]*?Ledger Statements \(\{filteredFinancials\.length\}\)[^]*?<\/div>/;
content = content.replace(targetLedger, ledgerUI);

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', content);
