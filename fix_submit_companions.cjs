const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldSubmitLogic = `        // Prevent duplicate requests
        const targetMatch = matches.find(m => m.id === matchId);
        if (targetMatch && targetMatch.requests && targetMatch.requests.some(r => r.phone === phone)) {
          alert("BẠN ĐÃ ĐĂNG KÝ RỒI. HÃY KIỂM TRA TRONG PHẦN KÈO CỦA TÔI NHÉ.");
          return;
        }

        let waitlistPosition = 0;`;

  const newSubmitLogic = `        // Prevent duplicate requests
        const targetMatch = matches.find(m => m.id === matchId);
        if (targetMatch && targetMatch.requests && targetMatch.requests.some(r => r.phone === phone)) {
          alert("BẠN ĐÃ ĐĂNG KÝ RỒI. HÃY KIỂM TRA TRONG PHẦN KÈO CỦA TÔI NHÉ.");
          return;
        }

        // Prevent overbooking
        if (targetMatch) {
          const maxCount = targetMatch.needPlayersCount !== undefined ? targetMatch.needPlayersCount : (targetMatch.missingCount !== undefined ? targetMatch.missingCount : 2);
          const acceptedCount = (targetMatch.requests || []).filter(r => r.status === 'accepted').reduce((sum, r) => sum + 1 + (parseInt(r.companions) || 0), 0);
          const totalNeeded = 1 + (parseInt(companions) || 0);
          
          if (totalNeeded > (maxCount - acceptedCount)) {
            alert(\`⚠️ Rất tiếc! Sân hiện tại chỉ còn \${Math.max(0, maxCount - acceptedCount)} slot, nhưng nhóm của bạn có tới \${totalNeeded} người.\`);
            return;
          }
        }

        let waitlistPosition = 0;`;

  code = code.replace(oldSubmitLogic, newSubmitLogic);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated submitJoinForm validation.");
} catch(e) {
  console.error(e);
}
