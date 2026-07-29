const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

code = code.replace(
  /              <h3 className="font-display font-bold text-2xl text-slate-800">ચાલુ જીમ મુલાકાતીઓ<\/h3>\n              <p className="text-base text-slate-500 mt-1">જીમમાં હાજર સભ્યો.<\/p>/,
  `              <h3 className="font-display font-bold text-2xl text-slate-800">આજ ની જીમ ની એન્ટ્રી</h3>\n              <p className="text-base text-slate-500 mt-1">આજના જીમ મુલાકાતીઓનું લિસ્ટ.</p>`
);

// We need to filter gymLogs to only include today's logs (last 24 hours or since midnight).
// Let's create a variable for this inside the component or just filter it inline.
// actually, gymLogs is already fetched and it might have old ones, let's filter: `gymLogs.filter(l => l.amenity === 'Gym' && (new Date().getTime() - new Date(l.checkInTime).getTime() < 24 * 60 * 60 * 1000))`

code = code.replace(
  /\{gymLogs\.filter\(l => !l\.checkOutTime && l\.amenity === 'Gym'\)\.length\} હાજર/,
  `{gymLogs.filter(l => l.amenity === 'Gym' && !l.checkOutTime).length} હાજર`
);

code = code.replace(
  /\{gymLogs\.filter\(l => !l\.checkOutTime && l\.amenity === 'Gym'\)\.length === 0 \? \(/,
  `{gymLogs.filter(l => l.amenity === 'Gym' && (new Date().getTime() - new Date(l.checkInTime).getTime() < 24 * 60 * 60 * 1000)).length === 0 ? (`
);

code = code.replace(
  /\{gymLogs\.filter\(l => !l\.checkOutTime && l\.amenity === 'Gym'\)\.map\(log => \(/,
  `{gymLogs.filter(l => l.amenity === 'Gym' && (new Date().getTime() - new Date(l.checkInTime).getTime() < 24 * 60 * 60 * 1000)).map(log => (`
);

// We also need to conditionally render the "ચેક આઉટ" button or the exit status.
// Currently:
//                    <button
//                      onClick={() => handleGymCheckOut(log.id, log.checkInTime)}
//                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm whitespace-nowrap"
//                    >
//                      ચેક આઉટ
//                    </button>

code = code.replace(
  /                    <button\n                      onClick=\{\(\) => handleGymCheckOut\(log\.id, log\.checkInTime\)\}\n                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm whitespace-nowrap"\n                    >\n                      ચેક આઉટ\n                    <\/button>/,
  `                    {!log.checkOutTime ? (
                      <button
                        onClick={() => handleGymCheckOut(log.id, log.checkInTime)}
                        className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm whitespace-nowrap"
                      >
                        ચેક આઉટ
                      </button>
                    ) : (
                      <div className="flex-1 sm:flex-none bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm text-center whitespace-nowrap">
                        બહાર ગયા: {new Date(log.checkOutTime).toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })} ({log.durationMinutes} મિનિટ)
                      </div>
                    )}`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
