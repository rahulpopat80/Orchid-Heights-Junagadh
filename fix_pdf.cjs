const fs = require('fs');
let code = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

const target = `const sanitizeText = (str: string) => {
  if (!str) return '';
  const clean = str.replace(/[^\\x00-\\x7F]/g, '').trim();
  return clean || '[Local Name]';
};`;

const replace = `const sanitizeText = (str: string) => {
  if (!str) return '';
  // Return original string to support local names
  return str.trim();
};`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/lib/pdfGenerator.ts', code);
  console.log("Replaced sanitizeText");
} else {
  console.log("Could not find sanitizeText");
}
