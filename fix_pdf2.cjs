const fs = require('fs');
let code = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

const target = `const sanitizeText = (str: string) => {
  if (!str) return '';
  // Return original string to support local names
  return str.trim();
};`;

const replace = `const sanitizeText = (str: string, fallback: string = 'Resident') => {
  if (!str) return fallback;
  // jsPDF default fonts only support ASCII. We must strip non-ASCII characters 
  // (like Gujarati) to prevent them from rendering as gibberish (mojibake).
  const clean = str.replace(/[^\\x00-\\x7F]/g, '').trim();
  return clean || fallback;
};`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  
  // Replace instances of sanitizeText to pass the ownerName as fallback where possible
  // generateGymEntryPDF
  code = code.replace(
    /doc\.text\(sanitizeText\(log\.memberName \|\| ownerName\)\.toUpperCase\(\), textX, currY\);/g,
    "doc.text(sanitizeText(log.memberName, ownerName).toUpperCase(), textX, currY);"
  );
  
  // Also update generateVisitorPDF
  code = code.replace(
    /sanitizeText\(truncatedVisitorName\)/g,
    "sanitizeText(truncatedVisitorName, 'Visitor')"
  );
  
  // Also update generateGymTheatrePDF
  code = code.replace(
    /sanitizeText\(log\.title\)/g,
    "sanitizeText(log.title, 'Movie/Event')"
  );

  fs.writeFileSync('src/lib/pdfGenerator.ts', code);
  console.log("Replaced sanitizeText to handle fallback safely");
} else {
  console.log("Could not find sanitizeText");
}
