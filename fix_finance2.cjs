const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const newImportCsv = `  const handleImportCsv = () => {
    setCsvError('');
    setCsvImportedCount(0);
    if (!rawCsvText.trim()) {
      setCsvError('Please paste or upload some CSV content.');
      return;
    }

    try {
      const lines = rawCsvText.split('\\n');
      let count = 0;
      let totalAmount = 0;
      const newRows = [];

      // Skip header row if exists
      const startIdx = lines[0].toLowerCase().includes('category') || lines[0].toLowerCase().includes('amount') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple comma splitting handling optional quotes
        const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (columns.length >= 2) {
          const cat = columns[0].replace(/"/g, '').trim();
          const desc = columns[1].replace(/"/g, '').trim();
          const amount = parseFloat(columns[2]?.replace(/"/g, '').replace(/[^0-9.]/g, '') || '0');
          
          if (cat && amount > 0) {
            totalAmount += amount;
            count++;
            newRows.push({ category: cat, description: desc, amount });
          }
        }
      }

      if (count === 0) {
        setCsvError('No valid rows found. Format: Category, Description, Amount');
        return;
      }

      setFinTitle(\`CSV Import: \${count} Ledger Records\`);
      setFinExpense(totalAmount.toString());
      setCsvImportedCount(count);
      setFinCsvRows(newRows);
      setRawCsvText('');
    } catch (e) {
      setCsvError('Failed to parse CSV. Check formatting.');
    }
  };`;

code = code.replace(/const handleImportCsv = \(\) => \{[\s\S]*?\} catch \(e\) \{[\s\S]*?\}\n  \};/, newImportCsv);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Applied second part of replacement');
