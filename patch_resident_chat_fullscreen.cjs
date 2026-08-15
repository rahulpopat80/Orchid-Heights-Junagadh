const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

const targetChat = `{activeSubSection === 'chat' && (
                  <div className="h-[calc(100dvh-120px)] flex flex-col -mx-4 sm:mx-0">
                    <ChatSection session={session} />
                  </div>
                )}`;

const replacementChat = `{activeSubSection === 'chat' && (
                  <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
                    <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center shadow-sm shrink-0 safe-top">
                      <button
                        onClick={() => {
                          setActiveSubSection(null);
                          navigate('/home');
                        }}
                        className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">Community Chat</h3>
                          <p className="text-[10px] text-emerald-600 font-bold">Online</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col safe-bottom">
                      <ChatSection session={session} />
                    </div>
                  </div>
                )}`;

if (code.includes(targetChat)) {
  code = code.replace(targetChat, replacementChat);
  console.log("Made Resident Chat full screen fixed overlay!");
} else {
  console.log("Could not find target chat logic.");
}

fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
