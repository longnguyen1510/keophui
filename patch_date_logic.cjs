const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const filterTarget = `const ownerSlots = slots.filter(s => {
          if (s.contact !== currentUser.phone) return false;
          
          let dateMatches = false;
          if (activeDateFilter === "Tất cả") {
            dateMatches = true; // if we had "Tất cả", but we only have Hôm nay, Ngày mai, Tuỳ chọn
          } else if (activeDateFilter === "Tuỳ chọn thời gian") {
            if (!activeCustomDate) {
              dateMatches = true;
            } else {
              const [yr, mn, dy] = activeCustomDate.split("-");
              const formattedCustom = \`\${dy}/\${mn}/\${yr}\`;
              dateMatches = (s.date === formattedCustom);
            }
          } else {
            dateMatches = (s.date === activeDateFilter);
          }
          
          return dateMatches;
        });`;

const filterReplacement = `const ownerSlots = slots.filter(s => {
          if (s.contact !== currentUser.phone) return false;
          
          const slotDate = s.rawTime || s.date;
          
          let dateMatches = false;
          if (activeDateFilter === "Tất cả") {
            dateMatches = true;
          } else if (activeDateFilter === "Tuỳ chọn thời gian" || activeDateFilter === "Tuỳ chọn") {
            if (!activeCustomDate) {
              dateMatches = true;
            } else {
              const [yr, mn, dy] = activeCustomDate.split("-");
              const formattedCustom = \`\${dy}/\${mn}/\${yr}\`;
              dateMatches = (slotDate === formattedCustom);
            }
          } else {
            dateMatches = (slotDate === activeDateFilter);
          }
          
          return dateMatches;
        });`;

code = code.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Logic patched");
