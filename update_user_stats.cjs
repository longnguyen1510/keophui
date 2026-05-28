const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Insert user update logic inside handleAttendanceAction
  const oldNotification = `              // Add notification
              setActivities(prevAct => {`;
  
  const newNotification = `              // Update User Stats
              setUsers(prevUsers => {
                return prevUsers.map(u => {
                  if (u.phone === req.phone) {
                    const currentMatches = u.matchesPlayed || 0;
                    const currentNoshows = u.noshowCount || 0;
                    const currentReliability = u.reliabilityScore || 100;
                    
                    let newReliability = currentReliability;
                    if (status === 'present') {
                      newReliability = Math.min(100, newReliability + 2); // Cap at 100
                      return { ...u, matchesPlayed: currentMatches + 1, reliabilityScore: newReliability };
                    } else if (status === 'noshow') {
                      newReliability = Math.max(0, newReliability - 15); // Heavy penalty for noshow
                      return { ...u, noshowCount: currentNoshows + 1, reliabilityScore: newReliability };
                    }
                  }
                  return u;
                });
              });

              // Add notification
              setActivities(prevAct => {`;

  code = code.replace(oldNotification, newNotification);

  // Also, add "Báo cáo QTV" note in the activity title if we want, or in description. The user said:
  // "kèm tính năng báo cáo nếu sai"
  const oldTitle = `title: \`Chủ đội \${m.teamName} đã xác nhận bạn \${status === 'present' ? 'Đã có mặt' : 'Không tới'} trong trận lúc \${m.time.split(' ')[0]}.\`,`;
  const newTitle = `title: \`Chủ đội \${m.teamName} đã xác nhận bạn \${status === 'present' ? 'Đã có mặt' : 'Không tới'} trận lúc \${m.time.split(' ')[0]}.\`,
                  desc: 'Nếu có sai sót, hãy bấm vào đây để báo cáo QTV.',`;

  code = code.replace(oldTitle, newTitle);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated user stats logic in attendance.");
} catch(e) {
  console.error(e);
}
