const fs = require('fs');

let code = fs.readFileSync('src/components/resident/VisitorsSection.tsx', 'utf8');

// Add state
code = code.replace(
  /const \[searchType, setSearchType\] = useState\(''\);/,
  "const [searchType, setSearchType] = useState('');\n  const [searchEntryType, setSearchEntryType] = useState('');"
);

// Add filter logic
code = code.replace(
  /if \(searchType && log\.guestType\.toLowerCase\(\) !== searchType\.toLowerCase\(\)\) match = false;/,
  `if (searchType && log.guestType.toLowerCase() !== searchType.toLowerCase()) match = false;
    
    if (searchEntryType) {
      if (searchEntryType === 'pre-entry' && !log.isPreEntry) match = false;
      if (searchEntryType === 'call' && !log.respondedBy?.includes('Through Call')) match = false;
      if (searchEntryType === 'manually' && (log.isPreEntry || log.respondedBy?.includes('Through Call'))) match = false;
    }`
);

// Add dropdown
const selectHtml = `          <select
            value={searchEntryType}
            onChange={(e) => setSearchEntryType(e.target.value)}
            className="w-full md:w-auto bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition text-slate-600"
          >
            <option value="">All Entry Types</option>
            <option value="manually">Manually (Security)</option>
            <option value="call">By Call</option>
            <option value="pre-entry">Pre-Entry</option>
          </select>
        </div>`;

code = code.replace(
  /<\/select>\s*<\/div>/,
  `</select>\n${selectHtml}`
);

fs.writeFileSync('src/components/resident/VisitorsSection.tsx', code);
