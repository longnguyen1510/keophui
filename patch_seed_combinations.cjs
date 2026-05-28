const fs = require('fs');
let code = fs.readFileSync('src/data/seedVenues.js', 'utf8');

const regex = /capacities: \{ '5': 3, '7': 2, '11': 1 \}/g;

code = code.replace(regex, (match) => {
  return match + ",\n        combinations: [{ target: '7A', parts: ['5A', '5B'] }]";
});

fs.writeFileSync('src/data/seedVenues.js', code);
console.log("Mock data combinations added");
