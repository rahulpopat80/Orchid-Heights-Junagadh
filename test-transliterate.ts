import { transliterateToGujarati } from './src/lib/transliterate';

async function test() {
  console.log(await transliterateToGujarati("Rahul"));
  console.log(await transliterateToGujarati("Dhaval"));
  console.log(await transliterateToGujarati("Amit Shah"));
}

test();
