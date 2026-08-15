const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const brokenTail = `  return () => {
    if (unsubFirestore) {
      if (typeof unsubFirestore === 'function') {
        if (typeof unsubFirestore === "function") { unsubFirestore(); }
      } else {
        if (typeof unsubFirestore === "function") { unsubFirestore(); }
      }
    }
  };`;

const fixedTail = `  return () => {
    if (unsubFirestore && typeof unsubFirestore === 'function') {
      unsubFirestore();
    }
  };`;

code = code.replace(brokenTail, fixedTail);
fs.writeFileSync('src/lib/firebase.ts', code);
