const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldBlock = `        const { teamId, teamName, missingCount, position, pitchType, date, time, venue, district, adminContact, notes, level } = formData;
        
        // Tuyển cầu lẻ - Duplicate post check`;

  const newBlock = `        const { teamId, teamName, missingCount, position, pitchType, date, time, venue, district, adminContact, notes, level } = formData;
        
        // 30 mins before start block check
        const startTime = parseMatchStartTime(time, date);
        if (startTime && (startTime - Date.now()) <= 30 * 60 * 1000) {
          alert('🚫 KHÔNG ĐỦ THỜI GIAN\\n\\nKhông thể tạo tin tuyển cầu lẻ khi trận đấu chỉ còn dưới 30 phút vì sẽ không đủ thời gian tìm người.');
          return;
        }

        // Tuyển cầu lẻ - Duplicate post check`;

  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added 30 mins block.");
} catch(e) {
  console.error(e);
}
