const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `          let slotType = 'empty';
          let slotStatusStr = 'Trống';

          if (slot.status === 'on_hold') {
            slotType = 'pending';
            slotStatusStr = 'Giữ chỗ';
          }

          const associatedMatches = matches.filter(m => m.venue_slot_id === slot.id);
          const hasConfirmed = associatedMatches.some(m => m.status === 'Đã chốt kèo');
          const hasPending = associatedMatches.some(m => m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận');

          if (hasConfirmed) {
            slotType = 'booked';
            slotStatusStr = 'Đã chốt';
            bookedCount++;
          } else if (hasPending) {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
            pendingCount++;
          } else if (slotType === 'pending') {
            pendingCount++;
          } else {
            emptyCount++;
          }`;

const replacementLogic = `          let slotType = 'empty';
          let slotStatusStr = 'Trống';

          if (slot.status === 'on_hold') {
            slotType = 'pending';
            slotStatusStr = 'Giữ chỗ';
          } else if (slot.status === 'booked' || slot.type === 'booked') {
            slotType = 'booked';
            slotStatusStr = 'Khách đặt';
          }

          const associatedMatches = matches.filter(m => m.venue_slot_id === slot.id);
          const hasConfirmed = associatedMatches.some(m => m.status === 'Đã chốt kèo');
          const hasPending = associatedMatches.some(m => m.status === 'Cần đối' || m.status === 'Đang chờ xác nhận');

          if (hasConfirmed) {
            slotType = 'booked';
            slotStatusStr = 'Đã chốt';
            bookedCount++;
          } else if (hasPending) {
            slotType = 'matching';
            slotStatusStr = 'Chờ ghép đội';
            pendingCount++;
          } else if (slotType === 'pending') {
            pendingCount++;
          } else if (slotType === 'booked') {
            bookedCount++;
          } else {
            emptyCount++;
          }`;

code = code.replace(targetLogic, replacementLogic);

fs.writeFileSync('src/App.jsx', code);
console.log("ownerDashboardData booked logic fixed");
