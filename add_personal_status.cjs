const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Add getPersonalStatus helper inside App (right before myCreatedMatches)
  const helperCode = `      const getPersonalStatus = (match) => {
        if (!currentUser) return match.status;
        
        // Kèo tôi tạo
        if ((currentUser.createdMatchIds || []).includes(match.id) || match.adminContact === currentUser.phone) {
          if (match.status === 'waiting_opponent' || match.status === 'Thiếu người') return 'Đang mở';
          if (match.status === 'waiting_approval' || match.status === 'pending_confirmation') return 'Chờ xác nhận';
          if (match.status === 'confirmed' || match.status === 'Đã chốt kèo') return 'Đã chốt';
          if (match.status === 'completed') return 'Hoàn thành';
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return 'Đã hủy';
          return match.status;
        }

        // Kèo tôi tham gia
        let myReq = (match.requests || []).find(r => r.phone === currentUser.phone);
        if (!myReq && currentUser.teamIds) {
          myReq = (match.requests || []).find(r => r.requester_team_id && currentUser.teamIds.includes(r.requester_team_id));
        }

        if (myReq) {
          if (myReq.status === 'pending') return 'Chờ duyệt';
          if (myReq.status === 'accepted') return 'Đã chốt';
          if (myReq.status === 'waitlist') return 'Danh sách chờ';
          if (myReq.status === 'rejected') return 'Bị từ chối';
        }

        const inJoined = (match.joinedPlayers || []).some(p => p.phone === currentUser.phone) || (currentUser.joinedMatchIds || []).includes(match.id);
        if (inJoined) return 'Đã chốt';

        if (match.team_id && currentUser.teamIds && currentUser.teamIds.includes(match.team_id)) {
          if (match.status === 'waiting_opponent' || match.status === 'Thiếu người') return 'Đang mở';
          if (match.status === 'waiting_approval' || match.status === 'pending_confirmation') return 'Chờ xác nhận';
          if (match.status === 'confirmed' || match.status === 'Đã chốt kèo') return 'Đã chốt';
          if (match.status === 'completed') return 'Hoàn thành';
          if (match.status === 'cancelled' || match.status === 'Đã hủy') return 'Đã hủy';
        }

        return match.status;
      };

      // Count stats for Profile Tab`;

  code = code.replace('// Count stats for Profile Tab', helperCode);

  // Update ProfileMatchListItem calls in Profile Tab
  // Find all `<ProfileMatchListItem key={m.id} match={m} onSelect={() => setSelectedMatch(m)} />`
  // and replace with `<ProfileMatchListItem key={m.id} match={m} personalStatus={getPersonalStatus(m)} onSelect={() => setSelectedMatch(m)} />`
  code = code.replaceAll(
    `<ProfileMatchListItem key={m.id} match={m} onSelect={() => setSelectedMatch(m)} />`,
    `<ProfileMatchListItem key={m.id} match={m} personalStatus={getPersonalStatus(m)} onSelect={() => setSelectedMatch(m)} />`
  );

  // Update ProfileMatchListItem definition
  const itemOld = `    function ProfileMatchListItem({ match, onSelect }) {
      return (
        <div 
          onClick={onSelect}
          className="bg-appDark-card border border-appDark-border/60 hover:border-slate-500 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all text-xs"
        >
          <div className="space-y-0.5 max-w-[280px]">
            <h5 className="font-bold text-white truncate">{match.teamName}</h5>
            <p className="text-[10px] text-neon-yellow flex items-center gap-1 font-semibold">
              <span>🕒 {match.time}</span>
              <span className="text-slate-500">•</span>
              <a 
                href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent((match.address || match.venue) + ' ' + (match.district || ''))}\`}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sky-400 hover:underline truncate flex items-center gap-1"
                title="Xem trên Google Maps"
              >
                🏟️ {match.venue} 📍
              </a>
            </p>
          </div>
          <span className={\`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide border \${
            match.status === 'Đã hủy' || match.status === 'cancelled' || match.status === 'expired'
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : match.status === 'Đã chốt kèo' || match.status === 'confirmed'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : match.status === 'pending_confirmation' || match.status === 'Đang chờ xác nhận'
              ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              : 'text-neon-green bg-neon-green/10 border-neon-green/20'
          }\`}>
            {match.status}
          </span>
        </div>
      );
    }`;

  const itemNew = `    function ProfileMatchListItem({ match, personalStatus, onSelect }) {
      const statusToDisplay = personalStatus || match.status;
      
      const getStatusStyle = (status) => {
        const lowerStatus = String(status).toLowerCase();
        if (lowerStatus.includes('hủy') || lowerStatus.includes('từ chối') || lowerStatus.includes('cancel')) {
          return 'text-red-400 bg-red-500/10 border-red-500/20';
        }
        if (lowerStatus.includes('chốt') || lowerStatus.includes('nhận') || lowerStatus.includes('hoàn thành') || lowerStatus.includes('confirm') || lowerStatus.includes('complete')) {
          return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        }
        if (lowerStatus.includes('chờ') || lowerStatus.includes('pending')) {
          return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        }
        return 'text-neon-green bg-neon-green/10 border-neon-green/20'; // Đang mở / Tuyển người
      };

      return (
        <div 
          onClick={onSelect}
          className="bg-appDark-card border border-appDark-border/60 hover:border-slate-500 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all text-xs"
        >
          <div className="space-y-0.5 max-w-[280px]">
            <h5 className="font-bold text-white truncate">{match.teamName}</h5>
            <p className="text-[10px] text-neon-yellow flex items-center gap-1 font-semibold">
              <span>🕒 {match.time}</span>
              <span className="text-slate-500">•</span>
              <a 
                href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent((match.address || match.venue) + ' ' + (match.district || ''))}\`}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sky-400 hover:underline truncate flex items-center gap-1"
                title="Xem trên Google Maps"
              >
                🏟️ {match.venue} 📍
              </a>
            </p>
          </div>
          <span className={\`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide border \${getStatusStyle(statusToDisplay)}\`}>
            {statusToDisplay}
          </span>
        </div>
      );
    }`;

  code = code.replace(itemOld, itemNew);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated personal status.");
} catch(e) {
  console.error(e);
}
