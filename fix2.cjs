const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
content = content.replace(
  /onClick=\{\(e\) => \{\n\s*if \(\!mem\.phone\) e\.preventDefault\(\);\n\s*setActiveCallReq\(\{ visitorId: v\.id, step: 'action', selectedMemberName: mem\.name \}\);\n\s*\}\}/g,
  `onClick={(e) => {
                                      e.stopPropagation();
                                      if (!mem.phone) e.preventDefault();
                                      setActiveCallReq({ visitorId: v.id, step: 'action', selectedMemberName: mem.name });
                                    }}`
);
fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
