const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'resident', 'PreEntrySection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                          <span className={\`text-[10px] font-bold \${
                            currentStatus === 'Pending' ? 'text-indigo-600' :
                            currentStatus === 'Used' ? 'text-emerald-600' : 'text-slate-400'
                          }\`}>
                            {currentStatus === 'Pending' ? countdownText : currentStatus}
                          </span>
                        </div>
                      </div>
                    </div>`;

const replaceStr = `                          <span className={\`text-[10px] font-bold \${
                            currentStatus === 'Pending' ? 'text-indigo-600' :
                            currentStatus === 'Used' ? 'text-emerald-600' : 'text-slate-400'
                          }\`}>
                            {currentStatus === 'Pending' ? countdownText : currentStatus}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-2">
                            Uses: {entry.uses || 0}/{entry.maxUses || 1}
                          </span>
                        </div>
                      </div>
                    </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PreEntry card uses");
}
