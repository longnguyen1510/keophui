const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Add handleAttendanceAction
  const newAction = `
      // Handle Attendance for free agents
      const handleAttendanceAction = (matchId, requestId, status) => {
        setMatches(prevMatches => {
          return prevMatches.map(m => {
            if (m.id !== matchId) return m;

            let updatedRequests = [...(m.requests || [])];
            const reqIndex = updatedRequests.findIndex(r => r.id === requestId);
            
            if (reqIndex !== -1) {
              const req = updatedRequests[reqIndex];
              updatedRequests[reqIndex] = { ...req, status };

              // Add notification
              setActivities(prevAct => {
                const newAct = {
                  id: Date.now() + Math.random(),
                  type: 'attendance',
                  matchId: m.id,
                  title: \`Chủ đội \${m.teamName} đã xác nhận bạn \${status === 'present' ? 'Đã có mặt' : 'Không tới'} trong trận lúc \${m.time.split(' ')[0]}.\`,
                  time: 'Vừa xong',
                  icon: status === 'present' ? '✅' : '❌',
                  color: status === 'present' ? 'text-neon-green bg-neon-green/10 border-neon-green/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
                };
                return [newAct, ...prevAct];
              });
            }

            return { ...m, requests: updatedRequests };
          });
        });
      };
`;

  code = code.replace(`      const handleRequestAction = (matchId, requestId, action) => {`, newAction + `\n      const handleRequestAction = (matchId, requestId, action) => {`);

  // Pass it to MatchDetailModal in App component
  code = code.replace(`                onRequestHandler={handleRequestAction}
                onCancelMatch={handleCancelMatch}
                onCancelRequest={handleCancelRequest}
              />`, `                onRequestHandler={handleRequestAction}
                onCancelMatch={handleCancelMatch}
                onCancelRequest={handleCancelRequest}
                onAttendanceAction={handleAttendanceAction}
              />`);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added handleAttendanceAction.");
} catch(e) {
  console.error(e);
}
