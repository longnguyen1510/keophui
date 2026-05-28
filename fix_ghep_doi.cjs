const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `          } else if (hasPending) {
            slotType = 'matching';
            slotStatusStr = 'Ghép đội';
            pendingCount++;
          }`;

const replacement = `          } else if (hasPending) {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
            pendingCount++;
          }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Replaced Ghép đội with Chờ ghép đội");
