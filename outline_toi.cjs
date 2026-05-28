const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');

const lines = code.split('\n');
let inToi = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('currentTab === "toi" && (')) {
    inToi = true;
  }
  
  if (inToi) {
    // simple count of opening/closing braces on this line (not bulletproof but good for structure)
    if (line.match(/<div/) || line.match(/<h2/) || line.match(/<h3/)) {
      console.log(`${i+1}: ${line.trim().substring(0, 100)}`);
    }
  }
  
  if (inToi && line.includes('</main>') && braceCount <= 0) { // rough check
    console.log(`${i+1}: ${line.trim()}`);
    // break;
  }
}
