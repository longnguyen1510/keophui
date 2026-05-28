const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');
const fixed = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 3125 && i <= 3127) {
    // skip the first duplicated block
    continue;
  }
  fixed.push(lines[i]);
}
fs.writeFileSync('src/App.jsx', fixed.join('\n'), 'utf8');
