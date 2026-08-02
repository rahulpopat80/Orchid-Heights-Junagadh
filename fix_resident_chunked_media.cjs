const fs = require('fs');

let code = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

const target = `<ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} />`;
const replacement = `<ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-102" />`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', code);
    console.log("Updated ChunkedMedia usage in AmenitiesSection.tsx successfully");
} else {
    console.log("Could not find target in AmenitiesSection.tsx");
}
