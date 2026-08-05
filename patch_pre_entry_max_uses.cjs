const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'resident', 'PreEntrySection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr1 = `  const [visitorCount, setVisitorCount] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');`;

const replaceStr1 = `  const [visitorCount, setVisitorCount] = useState<number>(1);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');`;

if (code.includes('const [visitorCount, setVisitorCount] = useState<number>(1);')) {
  code = code.replace(targetStr1, replaceStr1);
}

const targetStr2 = `        visitorCount,
        photoUrl: photoUrl || '',`;

const replaceStr2 = `        visitorCount,
        maxUses,
        uses: 0,
        photoUrl: photoUrl || '',`;

if (code.includes(targetStr2)) {
  code = code.replace(targetStr2, replaceStr2);
}

const targetStr3 = `        setMobileNumber('');
        setPhotoUrl('');
        setVisitorCount(1);`;

const replaceStr3 = `        setMobileNumber('');
        setPhotoUrl('');
        setVisitorCount(1);
        setMaxUses(1);`;

if (code.includes(targetStr3)) {
  code = code.replace(targetStr3, replaceStr3);
}

fs.writeFileSync(file, code);
console.log("Patched PreEntrySection maxUses");
