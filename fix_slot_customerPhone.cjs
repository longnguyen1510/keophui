const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetSlotNotes = `          notes: \`SĐT Khách: \${formData.customerPhone}\`,
          status: 'on_hold' // since it is linked to a match waiting for opponent`;

const replacementSlotNotes = `          notes: \`SĐT Khách: \${formData.customerPhone}\`,
          customerPhone: formData.customerPhone,
          status: 'on_hold' // since it is linked to a match waiting for opponent`;

code = code.replace(targetSlotNotes, replacementSlotNotes);

fs.writeFileSync('src/App.jsx', code);
console.log("Slot customerPhone injected");
