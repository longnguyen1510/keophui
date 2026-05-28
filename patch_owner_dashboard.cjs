const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `const renderBottomNav = () => {`;
const insert1 = `
      const ownerDashboardData = useMemo(() => {
        if (!currentUser) return { metrics: { empty: 0, booked: 0, pending: 0 }, subVenuesList: [] };

        const ownerSlots = slots.filter(s => s.contact === currentUser.phone);
        let emptyCount = 0;
        let bookedCount = 0;
        let pendingCount = 0;

        const groupedSlots = {
          'Sân 5': [],
          'Sân 7': [],
          'Sân 11': []
        };

        ownerSlots.forEach(slot => {
          let slotType = 'empty';
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
            slotStatusStr = 'Ghép đội';
            pendingCount++;
          } else if (slotType === 'pending') {
            pendingCount++;
          } else {
            emptyCount++;
          }

          const slotData = {
            ...slot,
            time: slot.timeSlot,
            type: slotType,
            status: slotStatusStr
          };

          const pType = slot.pitchType.replace(' người', '');
          if (groupedSlots[pType]) {
            groupedSlots[pType].push(slotData);
          }
        });

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

        const subVenuesList = [];

        Object.keys(groupedSlots).forEach(ptype => {
          const pSlots = groupedSlots[ptype].sort((a, b) => a.time.localeCompare(b.time));
          const subVenues = [];
          
          pSlots.forEach(s => {
            let placed = false;
            for (let i = 0; i < subVenues.length; i++) {
              const overlap = subVenues[i].slots.some(existingSlot => checkOverlap(existingSlot.time, s.time));
              if (!overlap) {
                subVenues[i].slots.push(s);
                placed = true;
                break;
              }
            }
            if (!placed) {
              const pitchNumber = ptype.replace('Sân ', '');
              subVenues.push({
                name: \`\${pitchNumber}\${String.fromCharCode(65 + subVenues.length)}\`, // 5A, 5B...
                slots: [s]
              });
            }
          });

          if (subVenues.length > 0) {
            subVenuesList.push({
              group: \`\${ptype} người\`,
              venues: subVenues
            });
          }
        });

        return {
          metrics: { empty: emptyCount, booked: bookedCount, pending: pendingCount },
          subVenuesList
        };
      }, [slots, matches, currentUser]);

      const renderBottomNav = () => {`;

code = code.replace(target1, insert1);
fs.writeFileSync('src/App.jsx', code);
console.log("Algorithm patched");
