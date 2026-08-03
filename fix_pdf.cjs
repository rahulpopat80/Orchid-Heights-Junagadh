const fs = require('fs');
let content = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

const target = `const sanitizeText = (str: string, fallback: string = 'Resident') => {
  if (!str) return fallback;
  // jsPDF default fonts only support ASCII. We must strip non-ASCII characters 
  // (like Gujarati) to prevent them from rendering as gibberish (mojibake).
  const clean = str.replace(/[^\\x00-\\x7F]/g, '').trim();
  return clean || fallback;
};`;

const replace = `const gujaratiToLatinMap: Record<string, string> = {
  // Vowels
  'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ii', 'ઉ': 'u', 'ઊ': 'uu',
  'ઋ': 'ru', 'ૠ': 'ru', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
  // Consonants
  'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
  'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'z', 'ઞ': 'ny',
  'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
  'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
  'પ': 'p', 'ફ': 'f', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
  'ય': 'y', 'ર': 'r', 'લ': 'l', 'ળ': 'l', 'વ': 'v',
  'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h',
  // Vowel Signs
  'ા': 'a', 'િ': 'i', 'ી': 'i', 'ુ': 'u', 'ૂ': 'u',
  'ૃ': 'ru', 'ૄ': 'ru', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',
  // Other
  'ં': 'n', 'ઃ': 'h', '્': '', 'ૐ': 'om'
};

const transliterateGujarati = (str: string): string => {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (gujaratiToLatinMap[char] !== undefined) {
          res += gujaratiToLatinMap[char];
      } else {
          res += char;
      }
  }
  return res.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
};

const sanitizeText = (str: string, fallback: string = 'Resident') => {
  if (!str) return fallback;
  
  // First transliterate Gujarati to Latin
  let processed = transliterateGujarati(str);

  // jsPDF default fonts only support ASCII. We must strip remaining non-ASCII characters 
  const clean = processed.replace(/[^\\x00-\\x7F]/g, '').trim();
  return clean || fallback;
};`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync('src/lib/pdfGenerator.ts', content);
    console.log("Updated pdfGenerator.ts");
} else {
    console.log("Target not found!");
}
