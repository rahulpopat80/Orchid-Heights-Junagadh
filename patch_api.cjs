const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'lib', 'api.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace("getFinancialReportsList,", "getFinancialReportsList,\n  subscribeToFinancialReports,");
code = code.replace("getFinancialReports: async (): Promise<FinancialReport[]> => {", "subscribeToFinancialReports: (onUpdate: (reports: FinancialReport[]) => void) => {\n    return subscribeToFinancialReports(onUpdate);\n  },\n  getFinancialReports: async (): Promise<FinancialReport[]> => {");

fs.writeFileSync(file, code);
