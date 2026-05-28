const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const navCode = fs.readFileSync('renderNav.js', 'utf8');

// Insert renderBottomNav before the return statement
code = code.replace(
  'return (\n        <div className="min-h-screen bg-[#070A13]',
  navCode + '\n      return (\n        <div className="min-h-screen bg-[#070A13]'
);

// Replace the existing <nav> block with {renderBottomNav()}
const navStart = code.indexOf('{/* TAB BOTTOM NAVIGATION */}');
const navEnd = code.indexOf('</nav>', navStart) + '</nav>'.length;

if (navStart !== -1 && navEnd !== -1) {
  code = code.substring(0, navStart) + '{renderBottomNav()}' + code.substring(navEnd);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find <nav> block to replace.");
}
