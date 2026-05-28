const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `      const submitCreateSlotForm = (formData) => {`;

const insertLogic = `      const submitOwnerCreateMatchForm = (formData) => {
        // Validation using Soft Conflict helper
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        const allDateSlots = slots.filter(s => 
          s.contact === currentUser.phone && 
          (s.rawTime || s.date) === formData.date
        );

        const testSlot = {
          id: 'test_' + Date.now(),
          timeSlot: \`\${formData.time} \${formData.date}\`,
          pitchType: formData.pitchType,
          contact: currentUser.phone
        };

        const { unplacedSlots } = assignSlotsToBins([...allDateSlots, testSlot], myCapacities, myCombinations);

        if (unplacedSlots.some(s => s.id === testSlot.id)) {
           alert("❌ Không thể đăng kèo! Sân này đang bị ảnh hưởng bởi giới hạn số lượng sân hoặc bị khóa do quy tắc Ghép Sân (Sân ghép đã chốt). Vui lòng kiểm tra lại bảng quản lý sân.");
           return;
        }

        // 1. Create Slot
        const newSlotId = 's_' + Date.now();
        const newSlot = {
          id: newSlotId,
          venueName: formData.venueName,
          district: formData.district,
          address: formData.address,
          timeSlot: \`\${formData.time} \${formData.date}\`,
          rawTime: formData.date,
          pitchType: formData.pitchType,
          price: formData.price.toLocaleString('vi-VN') + "đ",
          contact: formData.contact,
          notes: "Chủ sân tạo kèo cho đội khách.",
          status: 'on_hold' // since it is linked to a match waiting for opponent
        };

        // 2. Create Match
        const newMatch = {
          id: 'KP' + Math.floor(Math.random() * 100000),
          teamName: formData.teamName,
          pairedWith: null,
          time: newSlot.timeSlot,
          venue: newSlot.venueName,
          venue_slot_id: newSlotId,
          phone: currentUser.phone,
          status: "Cần đối",
          level: formData.level,
          fee: newSlot.price,
          type: "Tìm đối",
          author_user_id: currentUser.id,
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.teamName) + "&background=random",
          notes: formData.notes
        };

        setSlots(prev => [newSlot, ...prev]);
        setMatches(prev => [newMatch, ...prev]);
        
        alert("🔥 Tạo kèo hộ khách thành công! Kèo đã được đăng lên Bảng tin Public.");
        closeModal();
        setCurrentTab("keo");
      };

      const submitCreateSlotForm = (formData) => {`;

code = code.replace(targetLogic, insertLogic);

const targetRender = `{modalType === 'suggestion' && (`;

const insertRender = `{modalType === 'owner_create_match' && (
              <OwnerCreateMatchModal
                currentUser={currentUser}
                venues={venues}
                onClose={closeModal}
                onSubmit={submitOwnerCreateMatchForm}
              />
            )}

            {modalType === 'suggestion' && (`;

code = code.replace(targetRender, insertRender);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched submit logic and modal render for OwnerCreateMatch");
