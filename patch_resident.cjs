const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

const block8 = `                    <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                      Pre-Entry
                    </h4>
                  </div>`;

const block9 = `                    <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                      Pre-Entry
                    </h4>
                  </div>

                  {/* Block 9: Community Chat */}
                  <div
                    id="block-chat"
                    onClick={() => {
                      setLastVisitedSubSection('chat');
                      navigateToRoute('/chat', 'chat');
                    }}
                    className={\`bg-white rounded-none p-6 border shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center hover:shadow-md transition cursor-pointer relative group \${
                      highlightBlock === 'chat' ? 'ring-2 ring-indigo-500 ring-offset-2 animate-pulse bg-indigo-50/20 border-indigo-300' : 'border-slate-200/60'
                    }\`}
                  >
                    <div className="w-14 h-14 rounded-none bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm mb-3 group-hover:scale-105 transition-transform duration-300">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                      Community Chat
                    </h4>
                  </div>`;

code = code.replace(block8, block9);

const viewCasePreEntry = `
              {activeSubSection === 'preentry' && (
                <PreEntrySection session={session} />
              )}`;
const viewCaseChat = `
              {activeSubSection === 'preentry' && (
                <PreEntrySection session={session} />
              )}
              {activeSubSection === 'chat' && (
                <ChatSection session={session} owner={currentFlat} />
              )}`;

code = code.replace(viewCasePreEntry, viewCaseChat);

fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
