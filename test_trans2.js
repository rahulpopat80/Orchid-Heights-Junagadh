const gujaratiToLatinMap = {
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

function transliterateGujaratiToLatin(str) {
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
    // Capitalize first letter of each word
    return res.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

console.log(transliterateGujaratiToLatin('રાહુલ જૈન'));
console.log(transliterateGujaratiToLatin('અલ્પેશ પટેલ'));
console.log(transliterateGujaratiToLatin('છગન'));
console.log(transliterateGujaratiToLatin('દિનેશ ભાઈ'));

