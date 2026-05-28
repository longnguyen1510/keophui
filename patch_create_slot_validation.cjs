const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `      const submitCreateSlotForm = (formData) => {
        const newSlot = {
          id: 's_' + Date.now(),
          venueName: formData.venueName,
          district: formData.district,
          address: formData.address,
          timeSlot: \`\${formData.time} \${formData.date}\`,
          rawTime: formData.date,
          pitchType: formData.pitchType,
          price: formData.price.toLocaleString('vi-VN') + "đ",
          contact: formData.contact,
          notes: formData.notes || "Giờ trống từ chủ sân đăng bán nhanh."
        };

        setSlots(prev => [newSlot, ...prev]);
        alert("🏟️ Đăng khung giờ trống thành công! Khách xem và các đội bóng có thể chọn tạo kèo ngay trên slot của bạn.");
        closeModal();
      };`;

const replacement = `      const submitCreateSlotForm = (formData) => {
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
        let overlappingCount = 0;
        // The easiest way is to simulate bin packing and see if it fits
        const subVenues = [];
        for (let i = 0; i < maxCapacity; i++) {
          subVenues.push({ slots: [] });
        }
        
        let placedSlots = 0;
        relevantSlots.forEach(s => {
          for (let i = 0; i < subVenues.length; i++) {
            const overlap = subVenues[i].slots.some(existingSlot => checkOverlap(existingSlot.timeSlot.split(' ')[0], s.timeSlot.split(' ')[0]));
            if (!overlap) {
              subVenues[i].slots.push(s);
              placedSlots++;
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
        }

        const newSlot = {
          id: 's_' + Date.now(),
          venueName: formData.venueName,
          district: formData.district,
          address: formData.address,
          timeSlot: \`\${formData.time} \${formData.date}\`,
          rawTime: formData.date,
          pitchType: formData.pitchType,
          price: formData.price.toLocaleString('vi-VN') + "đ",
          contact: formData.contact,
          notes: formData.notes || "Giờ trống từ chủ sân đăng bán nhanh."
        };

        setSlots(prev => [newSlot, ...prev]);
        alert("🏟️ Đăng khung giờ trống thành công! Khách xem và các đội bóng có thể chọn tạo kèo ngay trên slot của bạn.");
        closeModal();
      };`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Validation patched");
