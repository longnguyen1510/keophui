const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// I will insert a new helper function `assignSlotsToBins` before ownerDashboardData

const helperLogic = `
      // HELPER: Assign slots to physical bins considering combinations
      const assignSlotsToBins = (slotsToAssign, capacities, combinations) => {
        const timeToMins = (tStr) => {
          if (!tStr) return 0;
          const [h, m] = tStr.split(':').map(Number);
          return h * 60 + (m || 0);
        };
        const checkOverlap = (t1, t2) => {
          if (!t1 || !t2) return false;
          let [start1, end1] = t1.split(' - ');
          let [start2, end2] = t2.split(' - ');
          let s1 = timeToMins(start1);
          let e1 = end1 ? timeToMins(end1) : s1 + 90;
          let s2 = timeToMins(start2);
          let e2 = end2 ? timeToMins(end2) : s2 + 90;
          return Math.max(s1, s2) < Math.min(e1, e2);
        };

        // Initialize bins
        const bins = {};
        Object.keys(capacities).forEach(pType => {
          const cap = Math.max(capacities[pType] || 0, 1); // fallback to 1 if slots exist
          for (let i = 0; i < cap; i++) {
            const binName = \`\${pType}\${String.fromCharCode(65 + i)}\`;
            bins[binName] = [];
          }
        });

        // Ensure bins exist for all pitch types present in slots (in case capacity is missing but slots exist)
        slotsToAssign.forEach(s => {
           const pTypeNum = s.pitchType.replace('Sân ', '');
           const binNameA = \`\${pTypeNum}A\`;
           if (!bins[binNameA]) bins[binNameA] = [];
        });

        // Helper to check if a time overlaps with any slot in a specific bin
        const isBinFree = (binName, timeStr) => {
          if (!bins[binName]) return true;
          return !bins[binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr));
        };

        // Helper to check if a bin and all its linked parts/targets are free
        const isBinCompletelyFree = (binName, timeStr) => {
          if (!isBinFree(binName, timeStr)) return false;

          // Check if this bin is a target, are its parts free?
          for (const comb of combinations) {
            if (comb.target === binName) {
              for (const part of comb.parts) {
                if (!isBinFree(part, timeStr)) return false;
              }
            }
          }

          // Check if this bin is a part, is its target free?
          for (const comb of combinations) {
            if (comb.parts.includes(binName)) {
              if (!isBinFree(comb.target, timeStr)) return false;
            }
          }

          return true;
        };

        // Sort slots chronologically
        const sortedSlots = [...slotsToAssign].sort((a, b) => {
           const tA = a.timeSlot ? a.timeSlot.split(' ')[0] : a.time;
           const tB = b.timeSlot ? b.timeSlot.split(' ')[0] : b.time;
           return tA.localeCompare(tB);
        });

        const unplacedSlots = [];

        sortedSlots.forEach(slot => {
          const pTypeNum = slot.pitchType.replace('Sân ', '');
          const timeStr = slot.timeSlot ? slot.timeSlot.split(' ')[0] : slot.time;
          
          let placed = false;
          // Find all bins for this pitch type
          const candidateBins = Object.keys(bins).filter(b => b.startsWith(pTypeNum) && b.length === pTypeNum.length + 1);
          
          for (const binName of candidateBins) {
            if (isBinCompletelyFree(binName, timeStr)) {
              bins[binName].push(slot);
              placed = true;
              break;
            }
          }

          if (!placed) {
            unplacedSlots.push(slot);
            // push to last candidate bin anyway to show error
            if (candidateBins.length > 0) {
               bins[candidateBins[candidateBins.length - 1]].push(slot);
            }
          }
        });

        // Generate virtual slots
        const virtualSlots = [];
        Object.keys(bins).forEach(binName => {
          bins[binName].forEach(slot => {
            const timeStr = slot.timeSlot ? slot.timeSlot.split(' ')[0] : slot.time;
            
            // If this bin is a target, block its parts
            combinations.forEach(comb => {
              if (comb.target === binName) {
                comb.parts.forEach(part => {
                  if (bins[part]) {
                    virtualSlots.push({
                      ...slot,
                      id: 'v_' + slot.id + '_' + part,
                      binName: part,
                      isVirtual: true,
                      status: 'Đang gộp',
                      notes: \`Ghép cho \${binName}\`,
                      contact: slot.contact
                    });
                  }
                });
              }
            });

            // If this bin is a part, block its target
            combinations.forEach(comb => {
              if (comb.parts.includes(binName)) {
                if (bins[comb.target]) {
                  virtualSlots.push({
                    ...slot,
                    id: 'v_' + slot.id + '_' + comb.target,
                    binName: comb.target,
                    isVirtual: true,
                    status: 'Đang gộp',
                    notes: \`Chờ \${binName}\`,
                    contact: slot.contact
                  });
                }
              }
            });
          });
        });

        virtualSlots.forEach(vs => {
          if (bins[vs.binName]) {
            // Avoid pushing duplicates if multiple parts are booked
            const overlap = bins[vs.binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, vs.timeSlot ? vs.timeSlot.split(' ')[0] : vs.time));
            if (!overlap) {
               bins[vs.binName].push(vs);
            }
          }
        });

        return { bins, unplacedSlots };
      };
`;

const insertMarker = `const availableRoles = ["cầu thủ"];`;

code = code.replace(insertMarker, helperLogic + "\n      " + insertMarker);

fs.writeFileSync('src/App.jsx', code);
console.log("Helper logic injected");
