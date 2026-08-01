const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
let bad = fs.readFileSync('bad_block.txt', 'utf8');
let good = `                  <button
                    type="button"
                    onClick={() => handleVerifyPass(manualPassId)}
                    disabled={verifyingPass || !manualPassId.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center justify-center sm:min-w-[120px] w-full sm:w-auto"
                  >
                    {verifyingPass ? 'ચકાસણી...' : 'ચકાસો (Verify)'}
                  </button>
                </div>
              </div>

              {/* Scan Results Feedback Modal */}
              {scanResult.status && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md relative space-y-5">
                    {/* CLOSE BUTTON IN PASS VISITOR DETAILS */}
                    <button
                      onClick={() => setScanResult({ status: null, message: '' })}
                      className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer flex items-center justify-center"
                      title="Close Visitor Details"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-1 pr-8">
                      <span className={\`\${
                        scanResult.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      } text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase\`}>
                        {scanResult.status === 'success' ? 'Verified Pass Details' : 'Pass Declined'}
                      </span>
                      <h3 className="text-lg font-black text-slate-800 uppercase mt-1">
                        {scanResult.data?.fullName || 'Unknown Visitor'}
                      </h3>
                      {scanResult.data && (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          ફ્લેટની મુલાકાત (Visiting Flat) {scanResult.data.wing}-{scanResult.data.flatNo} ({scanResult.data.flatOwnerName || 'રહેવાસી'})
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center font-bold text-sm text-slate-700 my-2">
                      {scanResult.message}
                    </div>

                    {scanResult.data?.photoUrl && (
                      <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
                        <img src={scanResult.data.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {scanResult.data && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 font-medium">
                        <div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીનો પ્રકાર:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.guestType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">મોબાઇલ:</span>
                          <span className="font-mono font-bold text-slate-800">+91 {scanResult.data.mobileNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">કારણ:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.reason || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">સ્થિતિ:</span>
                          <span className={\`font-bold \${
                            scanResult.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                          }\`}>{scanResult.status === 'success' ? 'મંજૂર (Approved)' : (scanResult.data.status || 'નામંજૂર (Declined)')}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      {/* CLOSE BUTTON AT BOTTOM OF SECTION */}
                      <button
                        onClick={() => setScanResult({ status: null, message: '' })}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                      >
`;
content = content.replace(bad, good);
fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
