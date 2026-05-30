const fs = require('fs');

const appPath = './src/App.jsx';
const lines = fs.readFileSync(appPath, 'utf8').split('\n');

const tab1 = fs.readFileSync('generated_tab1.js', 'utf8');
const tab2 = fs.readFileSync('generated_tab2.js', 'utf8');
const tab3 = fs.readFileSync('generated_tab3.js', 'utf8');

let adminStart = -1;
let tab4Start = -1;
let adminEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// ADMIN SYSTEM DASHBOARD')) {
    adminStart = i;
  }
  if (adminStart !== -1 && lines[i].includes('TAB 4: QUẢN LÝ SÂN - FULL UPGRADE')) {
    tab4Start = i - 1; // get the previous comment line too
  }
  if (adminStart !== -1 && lines[i] === '                  </div>' && lines[i+1] === '                ) : (') {
    adminEnd = i;
    break;
  }
}

if (adminStart === -1 || tab4Start === -1 || adminEnd === -1) {
  console.error("Could not find boundaries!", adminStart, tab4Start, adminEnd);
  process.exit(1);
}

const tab4Code = lines.slice(tab4Start, adminEnd).join('\n');

const newAdminContent = tab1 + tab2 + tab3 + '\n' + tab4Code + '\n                  </div>';

const newLines = [
  ...lines.slice(0, adminStart),
  newAdminContent,
  ...lines.slice(adminEnd + 1) // adminEnd is the </div>, the next is ") : ("
];

fs.writeFileSync(appPath, newLines.join('\n'), 'utf8');
console.log('App.jsx patched successfully!');
