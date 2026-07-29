const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// I need to close the `</>` and `)}` from the previous script around the place where completed request ends.
// Let's find:
//                          </span>
//                        )}
//                      </div>
//                    </div>
//                  );
//                })}
//              </div>
//            )}
//          </div>
//        </div>

code = code.replace(
  /                          <\/span>\n                        \)\}\n                      <\/div>\n                    <\/div>\n                  \);\n                \}\)\}\n              <\/div>\n            \)\}\n          <\/div>\n        <\/div>/,
  `                          </span>\n                        )}\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>\n            )}\n          </div>\n              </>\n            )}\n            {activeSecTab === 'gym_entry' && (`
);

// Then I need to close the `)}` and `</div>` after the gym block.
code = code.replace(
  /            <\/div>\n          \)\}\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\}/,
  `            </div>\n          )}\n        </div>\n            )}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
