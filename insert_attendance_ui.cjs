const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Insert constants
  const oldConstants = `      const myRequest = currentUser ? (match.requests || []).find(r => r.phone === currentUser.phone) : null;
      const ownerTeam = teams.find(t => t.phone === match.adminContact || t.name === match.teamName) || {};`;

  const newConstants = `      const myRequest = currentUser ? (match.requests || []).find(r => r.phone === currentUser.phone) : null;
      const ownerTeam = teams.find(t => t.phone === match.adminContact || t.name === match.teamName) || {};
      
      const startTimeMs = parseMatchStartTime(match.time, match.rawTime);
      const nowMs = new Date().getTime();
      const isAttendanceTime = startTimeMs && (nowMs >= startTimeMs - 30 * 60 * 1000);
      const attendanceRequests = (match.requests || []).filter(r => r.status === 'accepted' || r.status === 'present' || r.status === 'noshow');`;

  code = code.replace(oldConstants, newConstants);

  // Insert Attendance Panel right before NORMAL PLAYER LIST VIEW
  const insertBeforeStr = `            {/* NORMAL PLAYER LIST VIEW (PRIVACY ENFORCED) */}`;
  
  const attendancePanel = `            {/* OWNER ATTENDANCE PANEL */}
            {isOwner && isAttendanceTime && attendanceRequests.length > 0 && (
              <div className="space-y-2 border-t border-appDark-border/50 pt-3 text-left animate-fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-wider">
                    📋 ĐIỂM DANH CẦU LẺ
                  </h4>
                  {nowMs >= startTimeMs + 90 * 60 * 1000 && attendanceRequests.some(r => r.status === 'accepted') && (
                     <span className="bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-black text-[9px] animate-pulse">Cần chốt!</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Xác nhận có mặt để cộng điểm uy tín cho cầu thủ.</p>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {attendanceRequests.map(req => (
                    <div key={req.id} className="bg-appDark-deep p-3 rounded-xl border border-appDark-border/60 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-white text-[11px] font-bold">{req.name} <span className="text-slate-400 font-normal">(*{req.phone.slice(-4)})</span></p>
                        <span className={\`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border self-start \${
                          req.status === 'accepted' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                          req.status === 'present' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                          req.status === 'noshow' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }\`}>
                          {req.status === 'accepted' ? 'Đã nhận (Chờ điểm danh)' : req.status === 'present' ? 'Đã có mặt' : 'Không tới'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button 
                          onClick={() => onAttendanceAction(match.id, req.id, 'present')}
                          className={\`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all \${req.status === 'present' ? 'bg-sky-500 text-white shadow-lg' : 'bg-appDark-card border border-appDark-border text-slate-400 hover:text-sky-400 hover:border-sky-500'}\`}
                        >
                          ✅ Đã có mặt
                        </button>
                        <button 
                          onClick={() => onAttendanceAction(match.id, req.id, 'noshow')}
                          className={\`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all \${req.status === 'noshow' ? 'bg-red-500 text-white shadow-lg' : 'bg-appDark-card border border-appDark-border text-slate-400 hover:text-red-500 hover:border-red-500'}\`}
                        >
                          ❌ Không tới
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NORMAL PLAYER LIST VIEW (PRIVACY ENFORCED) */}`;

  code = code.replace(insertBeforeStr, attendancePanel);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added Attendance UI.");
} catch(e) {
  console.error(e);
}
