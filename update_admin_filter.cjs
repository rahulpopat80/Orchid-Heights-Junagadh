const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add flatFilter state
code = code.replace(
  "const [adminSearch, setAdminSearch] = useState<string>('');",
  "const [adminSearch, setAdminSearch] = useState<string>('');\n  const [flatFilter, setFlatFilter] = useState<'all' | 'active' | 'inactive'>('all');"
);

// Update filteredOwners logic
const newFilteredOwners = `
  const isOwnerActive = (owner: FlatOwner) => {
    return (owner.devices && owner.devices.length > 0) || 
           (owner.members && owner.members.length > 0) || 
           (owner.vehicles && owner.vehicles.length > 0) || 
           !!owner.secondaryContact;
  };

  const filteredOwners = owners.filter((owner) => {
    if (flatFilter === 'active' && !isOwnerActive(owner)) return false;
    if (flatFilter === 'inactive' && isOwnerActive(owner)) return false;

    const q = adminSearch.toLowerCase().trim();
    if (q === '') return true;
    return (
      \`\${owner.wing}-\${owner.flatNo}\`.toLowerCase().includes(q) ||
      owner.nameEn.toLowerCase().includes(q) ||
      owner.nameGu.toLowerCase().includes(q) ||
      owner.phone.includes(q)
    );
  });
`;

code = code.replace(
  /const filteredOwners = owners\.filter\(\(owner\) => \{[\s\S]*?\}\);/,
  newFilteredOwners.trim()
);

// Update UI
const searchDiv = `<div className="relative w-full sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" /></div>
                  <input
                    type="text"
                    placeholder="Search flat, occupant name, phone..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none focus:bg-white"
                  /></div>`;

const newSearchAndFilter = `<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search flat, name..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none focus:bg-white"
                    />
                  </div>
                  <select
                    value={flatFilter}
                    onChange={(e) => setFlatFilter(e.target.value as any)}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none focus:bg-white font-semibold text-slate-700"
                  >
                    <option value="all">All Flats</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Non-Active Only</option>
                  </select>
                </div>`;

code = code.replace(
  /<div className="relative w-full sm:max-w-xs">[\s\S]*?<\/div><\/div>/,
  newSearchAndFilter
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Done replacing code');
