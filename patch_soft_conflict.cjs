const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `        // Helper to check if a time overlaps with any slot in a specific bin
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
        });`;

const replacementLogic = `        // Helper to check if a time overlaps with any slot in a specific bin
        const isBinFree = (binName, timeStr) => {
          if (!bins[binName]) return true;
          return !bins[binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr));
        };

        // HARD LOCK: Check if a bin has an overlapping slot that is ACTUALLY BOOKED ('Đã chốt' / 'booked')
        const isBinHardLocked = (binName, timeStr) => {
          if (!bins[binName]) return false;
          return bins[binName].some(s => {
             const overlaps = checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr);
             const isBooked = s.type === 'booked' || s.status === 'Đã chốt';
             return overlaps && isBooked;
          });
        };

        // SOFT CONFLICT ALLOWED: Only return false if dependencies are Hard Locked
        const isBinSoftFree = (binName, timeStr) => {
          if (!isBinFree(binName, timeStr)) return false; // Self overlap is always bad

          // Check if this bin is a target, are its parts Hard Locked?
          for (const comb of combinations) {
            if (comb.target === binName) {
              for (const part of comb.parts) {
                if (isBinHardLocked(part, timeStr)) return false;
              }
            }
          }

          // Check if this bin is a part, is its target Hard Locked?
          for (const comb of combinations) {
            if (comb.parts.includes(binName)) {
              if (isBinHardLocked(comb.target, timeStr)) return false;
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
            if (isBinSoftFree(binName, timeStr)) {
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

        // Generate virtual slots ONLY FOR HARD LOCKED SLOTS
        const virtualSlots = [];
        Object.keys(bins).forEach(binName => {
          bins[binName].forEach(slot => {
            if (slot.type !== 'booked' && slot.status !== 'Đã chốt') return; // Soft conflict -> skip virtual slots
            
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
                      status: 'Bị khóa',
                      notes: \`Do \${binName} đã chốt\`,
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
                    status: 'Bị khóa',
                    notes: \`Do \${binName} đã chốt\`,
                    contact: slot.contact
                  });
                }
              }
            });
          });
        });

        virtualSlots.forEach(vs => {
          if (bins[vs.binName]) {
            const timeStr = vs.timeSlot ? vs.timeSlot.split(' ')[0] : vs.time;
            // Find if there is an existing 'empty' or soft slot overlapping, and remove it
            bins[vs.binName] = bins[vs.binName].filter(s => {
               if (s.isVirtual) return true; // keep existing virtuals maybe
               const overlaps = checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr);
               return !overlaps; // Remove overlapped real soft slots
            });

            // Now push the virtual slot (avoid exact duplicate virtual slots)
            const overlap = bins[vs.binName].some(s => checkOverlap(s.timeSlot ? s.timeSlot.split(' ')[0] : s.time, timeStr));
            if (!overlap) {
               bins[vs.binName].push(vs);
            }
          }
        });`;

code = code.replace(targetLogic, replacementLogic);

fs.writeFileSync('src/App.jsx', code);
console.log("Soft Conflict Logic applied");
