const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `        const subVenuesList = [];

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
        });`;

const replacementLogic = `        const subVenuesList = [];

        // Find current user's venue capacities
        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };

        Object.keys(groupedSlots).forEach(ptype => {
          const pSlots = groupedSlots[ptype].sort((a, b) => a.time.localeCompare(b.time));
          const pitchNumber = ptype.replace('Sân ', '');
          const capacity = myCapacities[pitchNumber] || 0;
          
          if (capacity === 0 && pSlots.length === 0) return;

          const subVenues = [];
          
          // Pre-populate according to capacity
          const actualCapacity = Math.max(capacity, 1); // Fallback to 1 if there's slots but no capacity set
          for (let i = 0; i < actualCapacity; i++) {
            subVenues.push({
              name: \`\${pitchNumber}\${String.fromCharCode(65 + i)}\`,
              slots: []
            });
          }
          
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
            // If it can't be placed (exceeds capacity), we ignore it or could push to an overflow.
            // Ideally it shouldn't happen because of validation.
            if (!placed) {
               // push to the last one anyway just to show it, though it overlaps
               if (subVenues.length > 0) {
                  subVenues[subVenues.length - 1].slots.push(s);
               }
            }
          });

          subVenuesList.push({
            group: \`\${ptype} người\`,
            venues: subVenues
          });
        });`;

code = code.replace(targetLogic, replacementLogic);

// Add venues to dependencies
const oldDeps = `}, [slots, matches, currentUser, activeDateFilter, activeCustomDate]);`;
const newDeps = `}, [slots, matches, currentUser, activeDateFilter, activeCustomDate, venues]);`;
code = code.replace(oldDeps, newDeps);

fs.writeFileSync('src/App.jsx', code);
console.log("Dashboard logic patched");
