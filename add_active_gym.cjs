const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const activeGymBlock = `
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left h-full">
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800">ચાલુ જીમ મુલાકાતીઓ</h3>
              <p className="text-base text-slate-500 mt-1">જીમમાં હાજર સભ્યો.</p>
            </div>
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-lg font-bold px-4 py-2 rounded-full flex items-center space-x-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></span>
              <span>{gymLogs.filter(l => !l.checkOutTime && l.amenity === 'Gym').length} હાજર</span>
            </span>
          </div>

          {gymLogs.filter(l => !l.checkOutTime && l.amenity === 'Gym').length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Dumbbell className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-700">કોઈ મુલાકાતી જીમમાં નથી.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {gymLogs.filter(l => !l.checkOutTime && l.amenity === 'Gym').map(log => (
                <div key={log.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{log.memberName}</p>
                    <p className="text-slate-500 text-sm font-medium">ફ્લેટ: {log.flatId}</p>
                    <p className="text-indigo-600 text-sm font-mono mt-1">એન્ટ્રી સમય: {new Date(log.checkInTime).toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    {log.memberPhone && (
                      <a
                        href={\`tel:\${log.memberPhone}\`}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 rounded-lg font-bold transition text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        <span>કોલ કરો</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleGymCheckOut(log.id, log.checkInTime)}
                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm whitespace-nowrap"
                    >
                      ચેક આઉટ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
`;

code = code.replace(
  /        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/,
  `        </div>\n${activeGymBlock}\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
