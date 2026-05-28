const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Inject ownerAccountTab state
if (!code.includes('const [ownerAccountTab')) {
  code = code.replace(
    /const \[profileMatchTab, setProfileMatchTab\] = useState\("team"\);/,
    'const [profileMatchTab, setProfileMatchTab] = useState("team");\n      const [ownerAccountTab, setOwnerAccountTab] = useState("upcoming");'
  );
}

// 2. Inject the UI in owner_tai_khoan
const targetSettings = `                  {/* Settings / Other options */}
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4">`;

const replacementTabs = `                  {/* OWNER MAIN TABS */}
                  <div className="flex gap-1 mt-2 relative z-10 px-1">
                    <button 
                      onClick={() => setOwnerAccountTab('upcoming')} 
                      className={\`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${ownerAccountTab === 'upcoming' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                    >
                      Lịch sử trận
                    </button>
                    <button 
                      onClick={() => {
                        setOwnerAccountTab('history');
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      }} 
                      className={\`relative flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${ownerAccountTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                    >
                      Thông Báo
                      {(() => {
                        const unread = notifications.filter(n => !n.isRead && (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone))).length;
                        return unread > 0 ? (
                          <span className="absolute top-2 right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse text-[9px] font-black text-white flex items-center justify-center">{unread}</span>
                        ) : null;
                      })()}
                    </button>
                  </div>
                  
                  {ownerAccountTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      <div className="flex bg-appDark-deep p-1 rounded-xl border border-appDark-border gap-1">
                        <button 
                          onClick={() => setUpcomingSubTab('created')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${upcomingSubTab === 'created' ? 'bg-neon-green text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Tôi Tạo ({myCreatedMatches.length})
                        </button>
                        <button 
                          onClick={() => setUpcomingSubTab('joined')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${upcomingSubTab === 'joined' ? 'bg-neon-yellow text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Tôi Tham Gia ({myJoinedMatches.length})
                        </button>
                      </div>

                      <div className="space-y-4 animate-fade-in">
                        {upcomingSubTab === 'created' && (
                          <div className="space-y-2.5 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
                            {myCreatedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tạo kèo đấu nào.
                              </div>
                            ) : (
                              renderGroupedMatches(myCreatedMatches)
                            )}
                          </div>
                        )}
                        
                        {upcomingSubTab === 'joined' && (
                          <div className="space-y-2.5 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
                            {myJoinedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tham gia kèo nào.
                              </div>
                            ) : (
                              renderGroupedMatches(myJoinedMatches)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {ownerAccountTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 shadow-md -mt-px relative z-0">
                      <div className="flex gap-2 border-b border-appDark-border pb-3 mb-4">
                        <button 
                          onClick={() => setNotificationSubTab('pending')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${notificationSubTab === 'pending' ? 'bg-amber-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Chờ xử lý ({notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)) && n.actionRequired && n.status === 'pending').length})
                        </button>
                        <button 
                          onClick={() => setNotificationSubTab('activity')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${notificationSubTab === 'activity' ? 'bg-sky-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Hoạt động
                        </button>
                      </div>

                      <div className="space-y-2.5 animate-fade-in opacity-90 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
                        {(() => {
                          const myNotifs = notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)));
                          let displayNotifs = [];
                          if (notificationSubTab === 'pending') {
                            displayNotifs = myNotifs.filter(n => n.actionRequired && n.status === 'pending');
                          } else {
                            displayNotifs = myNotifs.filter(n => !n.actionRequired || n.status === 'resolved');
                          }

                          if (displayNotifs.length === 0) {
                            return (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn không có thông báo nào ở mục này.
                              </div>
                            );
                          }

                          return displayNotifs.map(act => (
                              <div 
                                key={act.id} 
                                onClick={() => {
                                  if (!act.isRead) {
                                    setNotifications(prev => prev.map(n => n.id === act.id ? { ...n, isRead: true } : n));
                                  }
                                  if (act.type === 'suggestion') {
                                    const matchToOpen = matches.find(m => m.id === act.relatedMatchId);
                                    if (matchToOpen && act.suggestedMatches && act.suggestedMatches.length > 0) {
                                      setModalData({
                                        matchId: matchToOpen.id,
                                        match: matchToOpen,
                                        suggestedMatchesIds: act.suggestedMatches
                                      });
                                      setModalType('suggestion');
                                    } else {
                                      alert('Kèo đấu này không còn khả dụng hoặc đã bị hủy!');
                                    }
                                  }
                                }}
                                className={\`p-3 rounded-xl border transition-all text-left \${
                                  !act.isRead 
                                    ? 'bg-slate-800/80 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                                    : 'bg-appDark-deep/40 border-appDark-border/40'
                                }\`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold text-slate-400">{act.time}</span>
                                  {!act.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></span>}
                                </div>
                                <p className="text-[11px] text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: act.message }}></p>
                                {act.actionRequired && act.status === 'pending' && (
                                  <div className="mt-2 text-right">
                                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Cần xác nhận ➜</span>
                                  </div>
                                )}
                              </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Settings / Other options */}
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 mt-6">`;

if (code.includes(targetSettings) && !code.includes('ownerAccountTab === \'upcoming\'')) {
  code = code.replace(targetSettings, replacementTabs);
}

fs.writeFileSync('src/App.jsx', code);
console.log("Owner Account tabs added");
