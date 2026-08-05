const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'ResidentDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `  // Request desktop notification permission and pre-fetch list databases
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => console.warn('Notification permission rejected:', err));
    }
    fetchComplaints();
    fetchFinancials();
    fetchContacts();
  }, []);`;

const replacement = `  // Request desktop notification permission and pre-fetch list databases
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => console.warn('Notification permission rejected:', err));
    }
    fetchComplaints();
    
    setLoadingFinancials(true);
    const unsubFinancials = api.subscribeToFinancialReports((list) => {
      setFinancials(list);
      setLoadingFinancials(false);
    });
    
    fetchContacts();
    
    return () => {
      if (unsubFinancials) unsubFinancials();
    };
  }, []);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Patched ResidentDashboard.tsx");
} else {
  console.log("Could not find target in ResidentDashboard.tsx");
}
