const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `          if (slot.status === 'on_hold') {
            slotType = 'pending';
            slotStatusStr = 'Giữ chỗ';
          } else if (slot.status === 'booked' || slot.type === 'booked') {
            slotType = 'booked';
            slotStatusStr = 'Khách đặt';
          }`;

const replacementLogic = `          if (slot.status === 'on_hold') {
            slotType = 'pending';
            slotStatusStr = 'Giữ chỗ';
          } else if (slot.status === 'booked' || slot.type === 'booked') {
            slotType = 'booked';
            slotStatusStr = 'Đã chốt';
          }`;

code = code.replace(targetLogic, replacementLogic);

const targetFilters = `{['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt', 'Khách đặt', 'Giữ chỗ'].map(f => (`;
const replacementFilters = `{['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt', 'Giữ chỗ'].map(f => (`;

code = code.replace(targetFilters, replacementFilters);

fs.writeFileSync('src/App.jsx', code);
console.log("Filter logic fixed");
