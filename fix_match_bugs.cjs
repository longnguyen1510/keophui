const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix submitOwnerCreateMatchForm missing fields
const targetMatch = `        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          venue_slot_id: newSlotId,
          phone: currentUser.phone, // Kèo public vẫn dùng sđt chủ sân để liên hệ
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: \`SĐT Khách: \${formData.customerPhone}. \${formData.notes}\`
        };`;

const replacementMatch = `        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          district: newSlot.district,
          pitchType: newSlot.pitchType,
          venue_slot_id: newSlotId,
          phone: currentUser.phone, // Kèo public vẫn dùng sđt chủ sân để liên hệ
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: formData.customerPhone ? \`(SĐT Khách: \${formData.customerPhone}) \${formData.notes}\` : formData.notes
        };`;

code = code.replace(targetMatch, replacementMatch);

// 2. Fix the "Hủy kèo" / "Xóa" slot button in owner_booking tab
const targetDeleteSlot = `                            <button onClick={() => setSlots(slots.filter(s => s.id !== slot.id))} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">
                              {slot.status === 'on_hold' ? 'Hủy kèo' : 'Xóa'}
                            </button>`;

const replacementDeleteSlot = `                            <button onClick={() => {
                               setSlots(slots.filter(s => s.id !== slot.id));
                               setMatches(matches.filter(m => m.venue_slot_id !== slot.id));
                            }} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">
                              {slot.status === 'on_hold' ? 'Hủy kèo' : 'Xóa'}
                            </button>`;

code = code.replace(targetDeleteSlot, replacementDeleteSlot);

fs.writeFileSync('src/App.jsx', code);
console.log("Bugs fixed");
