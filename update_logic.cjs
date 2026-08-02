const fs = require('fs');

// 1. Update subscribeToAnnouncements in src/lib/firebase.ts to 3 months
let firebaseCode = fs.readFileSync('src/lib/firebase.ts', 'utf8');
firebaseCode = firebaseCode.replace(/oneMonthAgo\.setMonth\(oneMonthAgo\.getMonth\(\) - 1\);/g, "oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 3);");
fs.writeFileSync('src/lib/firebase.ts', firebaseCode);

// 2. Update fetchComplaints in src/components/ResidentDashboard.tsx
let dashboardCode = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');
const oldFetchComplaints = `      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const recentComplaints = list.filter((c: any) => {
        const d = new Date(c.createdAt || new Date().toISOString());
        return d >= oneMonthAgo;
      });
      setComplaints(recentComplaints);`;
const newFetchComplaints = `      const activeComplaints = list.filter((c: any) => {
        // Hide resolved complaints from resident view (auto-deleted from their perspective)
        // Keep pending, in-process, received, etc forever.
        return c.status?.toLowerCase() !== 'resolved';
      });
      setComplaints(activeComplaints);`;

if (dashboardCode.includes(oldFetchComplaints)) {
    dashboardCode = dashboardCode.replace(oldFetchComplaints, newFetchComplaints);
    fs.writeFileSync('src/components/ResidentDashboard.tsx', dashboardCode);
    console.log("Updated complaints logic.");
} else {
    console.log("Could not find oldFetchComplaints pattern.");
}
