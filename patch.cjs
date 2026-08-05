const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'lib', 'firebase.ts');
let code = fs.readFileSync(file, 'utf8');

const newFunc = `
export function subscribeToFinancialReports(onUpdate: (reports: FinancialReport[]) => void) {
  if (isQuotaExceeded) {
    onUpdate(fallback.getFinancialReportsListLocal());
    return () => {};
  }
  try {
    const unsubscribe = rawOnSnapshot(
      rawCollection(db, 'financial_reports'),
      (snapshot) => {
        const reports: FinancialReport[] = [];
        snapshot.forEach((docSnap) => {
          reports.push(docSnap.data() as FinancialReport);
        });
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(reports);
      },
      (error) => {
        if (isQuotaError(error)) {
          markQuotaExceeded();
          onUpdate(fallback.getFinancialReportsListLocal());
        } else {
          console.error("Firestore Error in subscribeToFinancialReports:", error);
        }
      }
    );
    return unsubscribe;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      onUpdate(fallback.getFinancialReportsListLocal());
    }
    return () => {};
  }
}
`;

code = code.replace("export async function getFinancialReportsList()", newFunc + "\nexport async function getFinancialReportsList()");
fs.writeFileSync(file, code);
