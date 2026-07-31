export async function transliterateToGujarati(text: string): Promise<string> {
  if (!text || !/[a-zA-Z]/.test(text)) return text;
  try {
    const words = text.split(/\s+/);
    const translatedWords = await Promise.all(words.map(async (word) => {
      if (!/[a-zA-Z]/.test(word)) return word;
      const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=gu-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
      const data = await res.json();
      if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
        return data[1][0][1][0];
      }
      return word;
    }));
    return translatedWords.join(' ');
  } catch (e) {
    return text;
  }
}
