const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');
const fixed = lines.map((line, i) => {
  if (i === 3286) {
    return '                                    </div>\n                                  )}'; // Re-add the </div> and fix indentation
  }
  return line;
});
fs.writeFileSync('src/App.jsx', fixed.join('\n'), 'utf8');
