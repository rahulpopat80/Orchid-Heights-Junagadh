const fs = require('fs');
let content = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

const target = `    if (!mTiming.trim()) {
      setMoviePostError('Timing is required.');
      return;
    }
    if (!mLength.trim()) {
      setMoviePostError('Picture Length / Duration is required.');
      return;
    }`;
const repl = `    if (!mTiming.trim()) {
      setMoviePostError('Timing is required.');
      return;
    }`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', content);
