const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const insertAfter = `      const handleAttendanceAction = (matchId, requestId, status) => {`;
  
  const handleReportAction = `      const handleReportAction = (matchId, requestId, action) => {
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id !== matchId) return m;

            let updatedRequests = [...(m.requests || [])];
            const reqIndex = updatedRequests.findIndex(r => r.id === requestId);
            
            if (reqIndex !== -1) {
              const req = updatedRequests[reqIndex];
              
              if (action === 'approve') {
                updatedRequests[reqIndex] = { ...req, status: 'present', isReported: false };
                
                // Refund stats
                setUsers(prevUsers => prevUsers.map(u => {
                  if (u.phone === req.phone) {
                    const currentMatches = u.matchesPlayed || 0;
                    const currentNoshows = u.noshowCount || 1; // Since it was noshow before
                    const currentReliability = u.reliabilityScore || 85;
                    return { 
                      ...u, 
                      matchesPlayed: currentMatches + 1, 
                      noshowCount: Math.max(0, currentNoshows - 1),
                      reliabilityScore: Math.min(100, currentReliability + 17) // Refund 15 penalty + 2 present bonus
                    };
                  }
                  return u;
                }));

                // Notify player
                setHasUnreadActivities(true);
                setActivities(prevAct => [
                  {
                    id: Date.now() + Math.random(),
                    type: 'report_approved',
                    matchId: m.id,
                    title: \`✅ Phản hồi của bạn đã được xử lý. Uy tín của bạn không bị trừ. Cảm ơn bạn.\`,
                    time: 'Vừa xong',
                    icon: '🛡️',
                    color: 'text-neon-green bg-neon-green/10 border-neon-green/20'
                  },
                  ...prevAct.filter(a => !(a.type === 'report_received' && a.requestId === requestId))
                ]);
                
              } else if (action === 'reject') {
                updatedRequests[reqIndex] = { ...req, isReported: false };
                
                // Notify player
                setHasUnreadActivities(true);
                setActivities(prevAct => [
                  {
                    id: Date.now() + Math.random(),
                    type: 'report_rejected',
                    matchId: m.id,
                    title: \`❌ QTV đã từ chối khiếu nại của bạn về trận đấu lúc \${m.time.split(' ')[0]}.\`,
                    time: 'Vừa xong',
                    icon: '❌',
                    color: 'text-red-400 bg-red-400/10 border-red-400/20'
                  },
                  ...prevAct.filter(a => !(a.type === 'report_received' && a.requestId === requestId))
                ]);
              }
            }

            return { ...m, requests: updatedRequests };
          });
        });
      };

      const handleAttendanceAction = (matchId, requestId, status) => {`;

  code = code.replace(insertAfter, handleReportAction);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added handleReportAction.");
} catch(e) {
  console.error(e);
}
