const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The string to replace:
const target1 = `Khung giờ đã đăng ({slots.length + matches.filter(m => m.status === 'Đã chốt kèo').length})`;
const new1 = `Khung giờ đã đăng ({slots.filter(s => s.contact === currentUser?.phone).length + matches.filter(m => m.status === 'Đã chốt kèo' && m.phone === currentUser?.phone).length})`;

const target2 = `{slots.map(slot => (`
const new2 = `{slots.filter(s => s.contact === currentUser?.phone).map(slot => (`

const target3 = `{matches.filter(m => m.status === 'Đã chốt kèo').map(m => (`
const new3 = `{matches.filter(m => m.status === 'Đã chốt kèo' && m.phone === currentUser?.phone).map(m => (`

if (code.includes(target1) && code.includes(target2) && code.includes(target3)) {
  code = code.replace(target1, new1);
  code = code.replace(target2, new2);
  code = code.replace(target3, new3);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Filter updated successfully");
} else {
  console.log("Targets not found");
}
