const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Check useState
console.log('useState upcoming: ', code.includes('useState("upcoming")'));

// 2. Check Quick Actions
console.log('QUICK ACTIONS: ', code.includes('{/* QUICK ACTIONS */}'));

// 3. Check Team Management
const teamStartMarker = '{/* QUẢN LÝ ĐỘI BÓNG */}';
console.log('Team Management: ', code.includes('QUẢN LÝ ĐỘI BÓNG CỦA BẠN'));

// 4. Check inner tabs
console.log('Inner tabs: ', code.includes('{/* DANG SACH KEO (TABS) */}'));
