const fs = require('fs');
const c = fs.readFileSync('src/App.jsx', 'utf8');
console.log(c.substring(1651*40, 1686*40).includes(');'));
