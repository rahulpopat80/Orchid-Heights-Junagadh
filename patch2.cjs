const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// 1. Replace Top Bar (Remove Refresh, Add Tabs)
content = content.replace(
  /<div className="flex flex-wrap items-center gap-4 sm:ml-auto">[\s\S]*?<\/div>\s*<\/div>\s*\{showStatusAlert/m,
  `<div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSecTab('register');
              setIsCameraActive(false);
            }}
            className={\`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm \${
              activeSecTab === 'register' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }\`}
          >
            <Shield className="w-5 h-5" />
            <span>નવી એન્ટ્રી</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSecTab('qr_scan');
              setIsCameraActive(true);
            }}
            className={\`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm \${
              activeSecTab === 'qr_scan' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }\`}
          >
            <QrCode className="w-5 h-5" />
            <span>QR સ્કેનર</span>
          </button>
          <button
            type="button"
            onClick={() => window.open('/directory', '_blank')}
            className="w-full sm:w-auto bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
        </div>
      </div>

      {showStatusAlert`
);

// 2. Remove inside tabs
content = content.replace(
  /\{\/\* Sub-tabs for Security Actions \*\/\}[\s\S]*?<\/div>\s*\{activeSecTab === 'register' \? \(/m,
  "{activeSecTab === 'register' ? ("
);

// 3. Labels Simplification
content = content.replace(/મુલાકાતીનું નામ <span/g, 'મુલાકાતી નું નામ <span');
content = content.replace(/મુલાકાતીનો પ્રકાર <span/g, 'મુલાકાતી નો પ્રકાર <span');
content = content.replace(/મુલાકાત લેવાનું કારણ <span/g, 'મુલાકાત નું કારણ <span');
content = content.replace(/મુલાકાતીઓની સંખ્યા <span/g, 'મુલાકાતીઓ ની સંખ્યા <span');
content = content.replace(/મેન્યુઅલ પાસ આઈડી \(Manual Pass ID\)/g, 'મેન્યુઅલ પાસ આઈડી');
content = content.replace(/ટાર્ગેટ ફ્લેટ પસંદ કરો \(મલ્ટી-સિલેક્ટ\)/g, 'ફ્લેટ ની પસંદગી કરો');

// 4. Change Submit button
content = content.replace(
  /<button\s+type="submit"[\s\S]*?\{submitting \? \([\s\S]*?<\/span>[\s\S]*?\) : \([\s\S]*?<span>[\s\S]*?<\/span>[\s\S]*?\)\}[\s\S]*?<\/button>/m,
  `<button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-sm transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span className="inline-block border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
              ) : (
                <span>
                  {selectedHelperId && selectedHelperId !== 'new' ? 'પ્રવેશ મંજૂર કરો' : 'રહેવાસીને પરવાનગી માટે મોકલો'}
                </span>
              )}
            </button>`
);


fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
