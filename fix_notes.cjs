const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetMatchNotes = `notes: formData.customerPhone ? \`(SĐT Khách: \${formData.customerPhone}) \${formData.notes}\` : formData.notes`;
const replacementMatchNotes = `notes: formData.notes,\n          customerPhone: formData.customerPhone`;

code = code.replace(targetMatchNotes, replacementMatchNotes);

// Also fix the slot if it has the same issue (I didn't inject customerPhone into slot notes, only match notes)
// Wait, for slot: notes: "Chủ sân tạo kèo cho đội khách."
// I can add customerPhone to the slot too for reference.
const targetSlot = `          notes: "Chủ sân tạo kèo cho đội khách.",
          status: 'on_hold' // since it is linked to a match waiting for opponent`;
const replacementSlot = `          notes: "Chủ sân tạo kèo cho đội khách.",
          customerPhone: formData.customerPhone,
          status: 'on_hold' // since it is linked to a match waiting for opponent`;
code = code.replace(targetSlot, replacementSlot);


fs.writeFileSync('src/App.jsx', code);
console.log("Notes fixed");
