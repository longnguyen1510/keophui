const fs = require('fs');
let code = fs.readFileSync('src/data/seedVenues.js', 'utf8');

const regex = /verification_status: "(verified|pending_verification)"/g;

code = code.replace(regex, (match) => {
  return match + ",\n        capacities: { '5': 3, '7': 2, '11': 1 }";
});

fs.writeFileSync('src/data/seedVenues.js', code);
console.log("Mock data capacities added");
