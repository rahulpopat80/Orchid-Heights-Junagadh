const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `<ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} />`;
const replacement = `<ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="w-full h-full object-cover" />`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Updated ChunkedMedia usage in AdminDashboard.tsx successfully");
} else {
    console.log("Could not find target in AdminDashboard.tsx");
}
