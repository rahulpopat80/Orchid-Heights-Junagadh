const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'lib', 'firebase.ts');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    // Update status to Used
    await updateDoc(docRef, { status: 'Used' });`;

const replaceStr = `    // Update status to Used if maxUses reached
    const maxUses = data.maxUses || 1;
    const currentUses = (data.uses || 0) + 1;
    
    if (currentUses >= maxUses) {
      await updateDoc(docRef, { status: 'Used', uses: currentUses });
    } else {
      await updateDoc(docRef, { uses: currentUses });
    }`;

if (code.includes("await updateDoc(docRef, { status: 'Used' });")) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched usePreEntry");
} else {
  console.log("Could not find target in firebase.ts");
}
