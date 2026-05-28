const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove 'Giữ chỗ' completely from slotStatusStr logic
const targetLogic = `          if (slot.status === 'on_hold') {
            slotType = 'pending';
            slotStatusStr = 'Giữ chỗ';
          } else if (slot.status === 'booked' || slot.type === 'booked') {`;

const replacementLogic = `          if (slot.status === 'on_hold') {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
          } else if (slot.status === 'booked' || slot.type === 'booked') {`;

code = code.replace(targetLogic, replacementLogic);

// 2. Remove 'Giữ chỗ' from the filter array
const targetFilters = `{['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt', 'Giữ chỗ'].map(f => (`;
const replacementFilters = `{['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt'].map(f => (`;

code = code.replace(targetFilters, replacementFilters);

// 3. Update the UI colors to map 'Chờ ghép đội' properly
// It uses s.type. Now s.type for on_hold is 'matching'. 
// So the UI mapping for 'matching' will just show the correct cyan color.
// Wait, 'matching' uses text-cyan-400 and bg-cyan-400.
// Before, 'pending' used text-amber-400 and bg-amber-400. 
// Let's ensure matching color is what they expect (Cyan).

fs.writeFileSync('src/App.jsx', code);
console.log("Filter logic cleaned");
