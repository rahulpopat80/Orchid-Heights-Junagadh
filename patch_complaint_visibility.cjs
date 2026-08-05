const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const target1 = `            {/* Complaints Board */}
            {!showComplaintForm && (
            <div className="space-y-4">`;

const replace1 = `            {/* Complaints Board */}
            <div className="space-y-4">`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  
  // also need to fix the closing brace
  const target2 = `                      </div>
                    ))}
                </div>
              )}
            </div>
            )}
          </div>
        </motion.div>`;
        
  const replace2 = `                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>`;
        
  code = code.replace(target2, replace2);
  fs.writeFileSync(file, code);
  console.log("Patched visibility");
}
