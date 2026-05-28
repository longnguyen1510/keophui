const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `        if (actionType === 'create_missing_player' || actionType === 'create_match_from_slot') {`;
const insert = `        if (actionType === 'create_slot' && !data) {
          const userVenue = venues.find(v => v.owner_user_id === currentUser.id);
          if (userVenue) {
            data = userVenue;
          }
        }\n\n`;

if (code.includes(target)) {
  code = code.replace(target, insert + target);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Trigger updated");
} else {
  console.log("Target not found");
}
