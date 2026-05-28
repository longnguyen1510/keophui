const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Replace myCreatedMatches
  const createdMatchesOld = `      const myCreatedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) && m.status !== "completed");
      }, [matches, currentUser]);`;

  const createdMatchesNew = `      const myCreatedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => (currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone);
      }, [matches, currentUser]);`;

  code = code.replace(createdMatchesOld, createdMatchesNew);

  // Replace myJoinedMatches
  const joinedMatchesOld = `      const myJoinedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => {
          if (m.status === "completed") return false;
          if ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) return false;
          return (currentUser.joinedMatchIds || []).includes(m.id) || (m.requests || []).some(req => req.phone === currentUser.phone);
        });
      }, [matches, currentUser]);`;

  const joinedMatchesNew = `      const myJoinedMatches = useMemo(() => {
        if (!currentUser) return [];
        return matches.filter(m => {
          // Kèo do tôi tạo -> Không nằm trong "Tôi tham gia"
          if ((currentUser.createdMatchIds || []).includes(m.id) || m.adminContact === currentUser.phone) return false;
          
          // User tham gia với tư cách cá nhân (slot lẻ)
          const isJoinedAsPlayer = (currentUser.joinedMatchIds || []).includes(m.id) || (m.joinedPlayers || []).some(p => p.phone === currentUser.phone);
          const hasRequestedAsPlayer = (m.requests || []).some(req => req.phone === currentUser.phone);
          
          // User tham gia với tư cách thành viên đội (đội nhận kèo hoặc tạo kèo tìm đối)
          const isJoinedAsTeam = m.team_id && currentUser.teamIds && currentUser.teamIds.includes(m.team_id);
          const hasRequestedAsTeam = (m.requests || []).some(req => req.requester_team_id && currentUser.teamIds && currentUser.teamIds.includes(req.requester_team_id));
          
          return isJoinedAsPlayer || hasRequestedAsPlayer || isJoinedAsTeam || hasRequestedAsTeam;
        });
      }, [matches, currentUser]);`;

  code = code.replace(joinedMatchesOld, joinedMatchesNew);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated match filters successfully.");
} catch(e) {
  console.error(e);
}
