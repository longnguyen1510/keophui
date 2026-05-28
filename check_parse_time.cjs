const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const match = code.match(/const parseMatchStartTime/);
console.log("Found parseMatchStartTime at index:", match ? match.index : -1);
