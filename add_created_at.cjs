const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // For waiting_opponent
  code = code.replace(`        const newMatch = {
          id: 'm_' + Date.now(),
          team_id: teamId,
          teamName: teamName,
          status: "waiting_opponent",`,
          `        const newMatch = {
          id: 'm_' + Date.now(),
          created_at: new Date().toISOString(),
          team_id: teamId,
          teamName: teamName,
          status: "waiting_opponent",`);

  // For Thiếu người
  code = code.replace(`        const newMatch = {
          id: 'm_' + Date.now(),
          team_id: teamId,
          teamName: teamName,
          status: "Thiếu người",`,
          `        const newMatch = {
          id: 'm_' + Date.now(),
          created_at: new Date().toISOString(),
          team_id: teamId,
          teamName: teamName,
          status: "Thiếu người",`);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added created_at to matches.");
} catch(e) {
  console.error(e);
}
