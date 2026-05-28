const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  '{renderGroupedMatches(myCreatedMatches)}',
  'renderGroupedMatches(myCreatedMatches)'
);

code = code.replace(
  '{renderGroupedMatches(myJoinedMatches)}',
  'renderGroupedMatches(myJoinedMatches)'
);

fs.writeFileSync('src/App.jsx', code);
console.log("Syntax fixed");
