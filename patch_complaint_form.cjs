const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const importRegex = /const \[activeSub, setActiveSub\] = useState/;
if (!code.includes("const [showComplaintForm, setShowComplaintForm] = useState(false);")) {
  code = code.replace(
    /const \[activeSub, setActiveSub\] = useState/g,
    "const [showComplaintForm, setShowComplaintForm] = useState(false);\n  const [activeSub, setActiveSub] = useState"
  );
}

const formStart = `          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-left">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">File a Society Ticket</h4>
              </div>`;

const newFormStart = `          <div className="flex justify-between items-center mb-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-600">
              Resolution Board
            </h4>
            <button
              onClick={() => setShowComplaintForm(!showComplaintForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm select-none"
            >
              {showComplaintForm ? 'View Tickets' : 'File a Ticket'}
            </button>
          </div>

          <div className="space-y-6 items-start">
            {/* Form */}
            {showComplaintForm && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-left">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">File a Society Ticket</h4>
              </div>`;

code = code.replace(formStart, newFormStart);

const formEnd = `                </button>
              </form>
            </div>

            {/* Complaints Board */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2.5">
                Resolution Board
              </h4>`;

const newFormEnd = `                </button>
              </form>
            </div>
            )}

            {/* Complaints Board */}
            {!showComplaintForm && (
            <div className="space-y-4">`;

code = code.replace(formEnd, newFormEnd);

const boardEndTarget = `                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}`;

const boardEndNew = `                      </div>
                    ))}
                </div>
              )}
            </div>
            )}
          </div>
        </motion.div>
      )}`;

code = code.replace(boardEndTarget, boardEndNew);

fs.writeFileSync(file, code);
console.log("Patched successfully");
