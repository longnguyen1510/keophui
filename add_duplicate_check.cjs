const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldBlock = `        const { teamId, teamName, missingCount, position, pitchType, date, time, venue, district, adminContact, notes, level } = formData;
        
        // Anti-duplicate active match check`;

  const newBlock = `        const { teamId, teamName, missingCount, position, pitchType, date, time, venue, district, adminContact, notes, level } = formData;
        
        // Tuyển cầu lẻ - Duplicate post check
        const isDuplicatePost = matches.some(m => 
          m.status === "Thiếu người" && 
          m.rawTime === date && 
          m.time.includes(time) && 
          m.district === district && 
          m.team_id === teamId && 
          m.pitchType === pitchType
        );

        if (isDuplicatePost) {
          alert('🚫 TIN NÀY ĐÃ TỒN TẠI\\n\\nTin này đã có người đăng trước đó. Bạn hãy kiểm tra lại trong mục tuyển cầu lẻ.');
          return;
        }

        // Anti-duplicate active match check`;

  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added duplicate post check.");
} catch(e) {
  console.error(e);
}
