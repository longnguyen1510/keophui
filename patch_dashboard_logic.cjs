const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetLogic = `        const timeToMins = (tStr) => {
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

const replacementLogic = `        const myVenue = venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id);
        const myCapacities = myVenue?.capacities || { '5': 0, '7': 0, '11': 0 };
        const myCombinations = myVenue?.combinations || [];

        // Flatten all grouped slots to pass to our new helper
        let allSlotsToAssign = [];
        Object.keys(groupedSlots).forEach(ptype => {
           allSlotsToAssign = [...allSlotsToAssign, ...groupedSlots[ptype]];
        });

        const { bins } = assignSlotsToBins(allSlotsToAssign, myCapacities, myCombinations);

        const subVenuesList = [];
        
        // Group bins back by pitch type ('Sân 5', 'Sân 7')
        const binKeys = Object.keys(bins).sort();
        const groupedBins = {};
        binKeys.forEach(binName => {
           const pTypeNum = binName.match(/\\d+/)[0];
           const groupName = \`Sân \${pTypeNum} người\`;
           if (!groupedBins[groupName]) groupedBins[groupName] = [];
           groupedBins[groupName].push({
             name: binName,
             slots: bins[binName]
           });
        });

        Object.keys(groupedBins).forEach(groupName => {
           subVenuesList.push({
              group: groupName,
              venues: groupedBins[groupName]
           });
        });`;

code = code.replace(targetLogic, replacementLogic);

fs.writeFileSync('src/App.jsx', code);
console.log("Dashboard logic replaced");
