const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const tabsStart = code.indexOf('{/* DANG SACH KEO (TABS) */}');
const tabsEnd = code.indexOf('{profileMatchTab === \'upcoming\' ? (');

if (tabsStart !== -1 && tabsEnd !== -1) {
  console.log("Inner tabs block to remove:\n", code.substring(tabsStart, tabsEnd));
}

const upcomingStart = code.indexOf('{profileMatchTab === \'upcoming\' ? (');
const historyStart = code.indexOf(') : (', upcomingStart);
const historyEnd = code.indexOf('                      )}', historyStart); // End of the profileMatchTab block

console.log("Found upcomingStart", upcomingStart !== -1);
console.log("Found historyStart", historyStart !== -1);
console.log("Found historyEnd", historyEnd !== -1);

