const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Insert notification push inside handleRequestAction when action === 'accept'
  const oldAcceptSuccess = `              alert("✅ Đã đồng ý yêu cầu tham gia! Thông tin liên hệ đã mở cho cả hai bên.");
              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };`;
              
  const newAcceptSuccess = `              // Notify player
              setHasUnreadActivities(true);
              setActivities(prevAct => [
                {
                  id: Date.now() + Math.random(),
                  type: 'request_accepted',
                  matchId: m.id,
                  title: \`✅ Chúc mừng! Chủ đội \${m.teamName} đã đồng ý yêu cầu tham gia trận đấu lúc \${m.time.split(' ')[0]} của bạn.\`,
                  time: 'Vừa xong',
                  icon: '✅',
                  color: 'text-neon-green bg-neon-green/10 border-neon-green/20'
                },
                ...prevAct
              ]);

              alert("✅ Đã đồng ý yêu cầu tham gia! Thông tin liên hệ đã mở cho cả hai bên.");
              return {
                ...m,
                requests: updatedRequests,
                status: newStatus
              };`;

  code = code.replace(oldAcceptSuccess, newAcceptSuccess);

  // Insert notification push inside handleRequestAction when action === 'reject'
  const oldRejectSuccess = `                if (r.id === requestId) return { ...r, status: 'rejected' };
                return r;
              });

              let newStatus = m.status;`;

  const newRejectSuccess = `                if (r.id === requestId) {
                  // Notify player
                  setHasUnreadActivities(true);
                  setActivities(prevAct => [
                    {
                      id: Date.now() + Math.random(),
                      type: 'request_rejected',
                      matchId: m.id,
                      title: \`❌ Rất tiếc! Chủ đội \${m.teamName} đã từ chối yêu cầu tham gia trận đấu lúc \${m.time.split(' ')[0]}.\`,
                      time: 'Vừa xong',
                      icon: '❌',
                      color: 'text-red-400 bg-red-400/10 border-red-400/20'
                    },
                    ...prevAct
                  ]);
                  return { ...r, status: 'rejected' };
                }
                return r;
              });

              let newStatus = m.status;`;

  code = code.replace(oldRejectSuccess, newRejectSuccess);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated handleRequestAction notification.");
} catch(e) {
  console.error(e);
}
