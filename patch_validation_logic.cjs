const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetValidation = `      const submitCreateSlotForm = (formData) => {
        // Validation for physical capacity
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const pTypeNum = formData.pitchType.replace('Sân ', '');
        const maxCapacity = myCapacities[pTypeNum] || 1; // Fallback to 1

        const timeToMins = (tStr) => {
          if (!tStr) return 0;
          const [h, m] = tStr.split(':').map(Number);
          return h * 60 + (m || 0);
        };
        const checkOverlap = (t1, t2) => {
          let [start1, end1] = t1.split(' - ');
          let [start2, end2] = t2.split(' - ');
          let s1 = timeToMins(start1);
          let e1 = end1 ? timeToMins(end1) : s1 + 90;
          let s2 = timeToMins(start2);
          let e2 = end2 ? timeToMins(end2) : s2 + 90;
          return Math.max(s1, s2) < Math.min(e1, e2);
        };

        // Find all slots belonging to this owner, for this pitchType, and this date
        const relevantSlots = slots.filter(s => 
          s.contact === currentUser.phone && 
          s.pitchType === formData.pitchType && 
          (s.rawTime || s.date) === formData.date
        );

        // Count how many overlapping slots exist for this new time
        const subVenues = [];
        for (let i = 0; i < maxCapacity; i++) {
          subVenues.push({ slots: [] });
        }
        
        relevantSlots.forEach(s => {
          for (let i = 0; i < subVenues.length; i++) {
            const overlap = subVenues[i].slots.some(existingSlot => checkOverlap(existingSlot.timeSlot.split(' ')[0], s.timeSlot.split(' ')[0]));
            if (!overlap) {
              subVenues[i].slots.push(s);
              break;
            }
          }
        });

        // Now try to place the NEW slot
        let canPlaceNew = false;
        for (let i = 0; i < subVenues.length; i++) {
            const overlap = subVenues[i].slots.some(existingSlot => checkOverlap(existingSlot.timeSlot.split(' ')[0], formData.time));
            if (!overlap) {
              canPlaceNew = true;
              break;
            }
        }

        if (!canPlaceNew) {
           alert("❌ Hết sân! Bạn đã đạt giới hạn số lượng " + formData.pitchType + " đang sở hữu trong khung giờ này.");
           return;
        }`;

const replacementValidation = `      const submitCreateSlotForm = (formData) => {
        // Validation for physical capacity & compounds using the universal helper
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        // Find all existing slots for this owner on this date across ALL pitch types
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
           alert("❌ Không thể đăng giờ! Sân này đang bị ảnh hưởng bởi giới hạn sân hoặc bị khóa do quy tắc Ghép Sân (Ví dụ: 7A = 5A + 5B). Vui lòng kiểm tra lại bảng quản lý.");
           return;
        }`;

code = code.replace(targetValidation, replacementValidation);

fs.writeFileSync('src/App.jsx', code);
console.log("Validation patched");
