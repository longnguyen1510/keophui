const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Update onClick for act.type === 'attendance'
  const oldOnClick = `                                    } else if (act.type === 'attendance') {
                                      alert("Đã gửi báo cáo khiếu nại lên Quản trị viên (QTV). QTV sẽ liên hệ với bạn và chủ sân để đối chiếu sự việc.");
                                    }`;
                                    
  const newOnClick = `                                    } else if (act.type === 'attendance') {
                                      if (act.desc === 'Đang chờ QTV xử lý...') return;
                                      
                                      // Trigger report logic
                                      setMatches(prev => prev.map(m => {
                                        if (m.id === act.matchId) {
                                          let reqs = [...(m.requests || [])];
                                          let idx = reqs.findIndex(r => r.id === act.requestId);
                                          if (idx !== -1) {
                                            reqs[idx] = { ...reqs[idx], isReported: true, reportedAt: Date.now() };
                                          }
                                          return { ...m, requests: reqs };
                                        }
                                        return m;
                                      }));
                                      
                                      setActivities(prevAct => {
                                        let updatedAct = [...prevAct];
                                        let actIdx = updatedAct.findIndex(a => a.id === act.id);
                                        if (actIdx !== -1) {
                                          updatedAct[actIdx] = { ...updatedAct[actIdx], desc: 'Đang chờ QTV xử lý...' };
                                        }
                                        
                                        // Push to owner
                                        updatedAct.unshift({
                                          id: Date.now() + Math.random(),
                                          type: 'report_received',
                                          matchId: act.matchId,
                                          requestId: act.requestId,
                                          title: \`⚠️ Có khiếu nại! Một cầu thủ báo cáo rằng họ CÓ MẶT tại trận đấu. Bạn có xác nhận thay đổi không?\`,
                                          time: 'Vừa xong',
                                          icon: '⚠️',
                                          color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                        });
                                        return updatedAct;
                                      });
                                      setHasUnreadActivities(true);
                                    }`;

  code = code.replace(oldOnClick, newOnClick);

  // Render buttons in activities UI for report_received
  const oldRenderAct = `                                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">{act.time}</p>
                                </div>
                              </div>`;

  const newRenderAct = `                                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">{act.time}</p>
                                  {act.type === 'report_received' && (
                                    <div className="flex gap-2 mt-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleReportAction(act.matchId, act.requestId, 'approve'); }} 
                                        className="px-2 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded text-[9px] font-bold uppercase hover:bg-sky-500 hover:text-white transition-colors"
                                      >
                                        Đồng ý có mặt
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleReportAction(act.matchId, act.requestId, 'reject'); }} 
                                        className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
                                      >
                                        Giữ nguyên
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>`;

  code = code.replace(oldRenderAct, newRenderAct);

  // Add auto-resolve logic to setInterval
  const oldInterval = `            const nextMatches = prevMatches.map(m => {
              const nowTime = now.getTime();
              const startTime = parseMatchStartTime(m.time, m.rawTime);`;

  const newInterval = `            const nextMatches = prevMatches.map(m => {
              const nowTime = now.getTime();
              const startTime = parseMatchStartTime(m.time, m.rawTime);
              
              // Auto-resolve reported attendance (Timeout: 1 minute for testing, normally 60 mins)
              if (m.requests && m.requests.some(r => r.isReported)) {
                let changed = false;
                let reqs = m.requests.map(r => {
                  if (r.isReported && r.reportedAt && nowTime - r.reportedAt > 1 * 60 * 1000) {
                    // Auto approve
                    changed = true;
                    // Trigger handleReportAction equivalent logic here via setTimeout to avoid state update during render loop
                    setTimeout(() => handleReportAction(m.id, r.id, 'approve'), 0);
                    return { ...r, isReported: false };
                  }
                  return r;
                });
                if (changed) {
                   m = { ...m, requests: reqs };
                }
              }`;

  code = code.replace(oldInterval, newInterval);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated report UI and auto-resolve logic.");
} catch(e) {
  console.error(e);
}
