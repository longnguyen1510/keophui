const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const upcomingBlockStart = `{profileMatchTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">

                        <div className="space-y-4 animate-fade-in">`;
  const upcomingBlockEnd = `                          </div>
                        </div>
                    </div>
                    )}`;

  const startIndex = code.indexOf(upcomingBlockStart);
  if (startIndex === -1) throw new Error("Could not find upcomingBlockStart");

  const endIndex = code.indexOf(upcomingBlockEnd, startIndex);
  if (endIndex === -1) throw new Error("Could not find upcomingBlockEnd");

  const blockToReplace = code.substring(startIndex, endIndex + upcomingBlockEnd.length);

  const newBlock = `{profileMatchTab === 'upcoming' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 shadow-md -mt-px relative z-0">

                      {/* SUBTABS */}
                      <div className="flex gap-2 border-b border-appDark-border pb-3 mb-4">
                        <button 
                          onClick={() => setUpcomingSubTab('created')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${upcomingSubTab === 'created' ? 'bg-neon-green text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Đã Tạo ({myCreatedMatches.length})
                        </button>
                        <button 
                          onClick={() => setUpcomingSubTab('joined')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${upcomingSubTab === 'joined' ? 'bg-neon-yellow text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Đang Tham Gia ({myJoinedMatches.length})
                        </button>
                      </div>

                      <div className="space-y-4 animate-fade-in">
                        {upcomingSubTab === 'created' && (
                          <div className="space-y-2.5">
                            {myCreatedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tạo kèo đấu nào.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {myCreatedMatches.map(m => (
                                  <ProfileMatchListItem key={m.id} match={m} onSelect={() => setSelectedMatch(m)} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {upcomingSubTab === 'joined' && (
                          <div className="space-y-2.5">
                            {myJoinedMatches.length === 0 ? (
                              <div className="bg-appDark-deep border border-appDark-border/40 rounded-xl p-3 text-center text-[10px] text-slate-500 italic">
                                Bạn chưa tham gia kèo nào.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {myJoinedMatches.map(m => (
                                  <ProfileMatchListItem key={m.id} match={m} onSelect={() => setSelectedMatch(m)} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    )}`;

  code = code.replace(blockToReplace, newBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Successfully replaced upcoming matches block.");
} catch(e) {
  console.error(e);
}
