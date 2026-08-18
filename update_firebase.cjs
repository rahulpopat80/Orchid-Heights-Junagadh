const fs = require('fs');

let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Add deletePreEntry function
const deletePreEntryCode = `export async function deletePreEntry(id: string): Promise<boolean> {
  if (isQuotaExceeded) return false;
  try {
    const docRef = doc(db, 'pre_entries', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      return false;
    }
    handleFirestoreError(error, OperationType.DELETE, 'pre_entries');
  }
}

export async function`;
code = code.replace(/export async function getPreEntryById/, deletePreEntryCode + ' getPreEntryById');

// Filter 15 days
const filterCode = `        list.push(data);
      }
    });

    // Keep only last 15 days
    const fifteenDaysAgo = new Date().getTime() - (15 * 24 * 60 * 60 * 1000);
    return list.filter(entry => new Date(entry.createdAt).getTime() >= fifteenDaysAgo);`;

code = code.replace(/list\.push\(data\);\n\s*\}\n\s*\}\);\n\s*return list;/g, filterCode);

fs.writeFileSync('src/lib/firebase.ts', code);
