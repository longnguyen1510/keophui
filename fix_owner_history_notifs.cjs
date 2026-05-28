const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetUpcomingContent = `                  {ownerAccountTab === 'upcoming' && (
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
                  )}`;

const replacementUpcomingContent = `                  {ownerAccountTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                          {(() => {
                            const now = new Date().getTime();
                            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
                            const ownerSlotsIds = slots.filter(s => s.contact === currentUser?.phone || s.owner_user_id === currentUser?.id).map(s => s.id);
                            
                            const completedMatches = matches.filter(m => {
                              const isOwnerMatch = ownerSlotsIds.includes(m.venue_slot_id) || m.adminContact === currentUser?.phone;
                              if (!isOwnerMatch) return false;
                              
                              const matchTimeMs = parseMatchStartTime(m.time, m.rawTime || m.rawDate);
                              const isCompleted = (m.status === 'Đã chốt kèo' || m.status === 'completed' || m.status === 'Đã hoàn thành') && (matchTimeMs < now);
                              
                              if (!isCompleted) return false;
                              if (matchTimeMs < sevenDaysAgo) return false;
                              return true;
                            }).sort((a, b) => parseMatchStartTime(b.time, b.rawTime || b.rawDate) - parseMatchStartTime(a.time, a.rawTime || a.rawDate));

                            if (completedMatches.length === 0) {
                              return (
                                <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                  Không có trận đấu nào hoàn thành trong 7 ngày qua.
                                </div>
                              );
                            }
                            return renderGroupedMatches(completedMatches);
                          })()}
                        </div>
                      </div>
                    </div>
                  )}`;

code = code.replace(targetUpcomingContent, replacementUpcomingContent);

const targetNotifContent = `                        {(() => {
                          const myNotifs = notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)));
                          let displayNotifs = [];
                          if (notificationSubTab === 'pending') {
                            displayNotifs = myNotifs.filter(n => n.actionRequired && n.status === 'pending');
                          } else {
                            displayNotifs = myNotifs.filter(n => !n.actionRequired || n.status === 'resolved');
                          }`;

const replacementNotifContent = `                        {(() => {
                          const ownerRelevantKeywords = ['nhận kèo', 'xin một suất', 'đặt sân', 'giữ chỗ', 'chốt kèo', 'thành công', 'hủy', 'huỷ', 'rút', 'phê duyệt', 'cấp quyền'];
                          const myNotifs = notifications.filter(n => {
                            if (n.recipientPhone && currentUser && n.recipientPhone !== currentUser.phone) return false;
                            
                            const msg = (n.message || '').toLowerCase();
                            return ownerRelevantKeywords.some(kw => msg.includes(kw));
                          });
                          
                          let displayNotifs = [];
                          if (notificationSubTab === 'pending') {
                            displayNotifs = myNotifs.filter(n => n.actionRequired && n.status === 'pending');
                          } else {
                            displayNotifs = myNotifs.filter(n => !n.actionRequired || n.status === 'resolved');
                          }`;

code = code.replace(targetNotifContent, replacementNotifContent);

fs.writeFileSync('src/App.jsx', code);
console.log("Owner history and notifs fixed");
