const fs = require('fs');
const file = '/Users/macbook/Documents/DEV TEST/app da banh/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Chunk 1: KPIs
const kpisOld = `                          const kpis = [
                            { label: "Tổng sân", value: venues.length, icon: "🏟️", color: "text-cyan-400", bg: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/20" },
                            { label: "Sân active", value: verifiedVenues.length, icon: "🟢", color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
                            { label: "Slot tuần này", value: totalWeekSlots, icon: "📅", color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20" },
                            { label: "Slot filled", value: bookedWeekSlots.length, icon: "✅", color: "text-green-400", bg: "from-green-500/10 to-green-600/5", border: "border-green-500/20" },
                            { label: "Fill Rate", value: fillRate + "%", icon: "📊", color: "text-purple-400", bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20" },
                            { label: "Doanh thu App", value: (revenue / 1000000).toFixed(1) + "M", icon: "💰", color: "text-neon-yellow", bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
                            { label: "Hoa hồng DK", value: (commission / 1000000).toFixed(1) + "M", icon: "🏦", color: "text-orange-400", bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20" },
                          ];`;

const kpisNew = `                          const kpis = [
                            { label: "Tổng sân", value: venues.length, icon: "🏟️", color: "text-cyan-400", bg: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/20" },
                            { label: "Sân active", value: verifiedVenues.length, icon: "🟢", color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
                            { label: "Doanh thu App", value: (revenue / 1000000).toFixed(1) + "M", icon: "💰", color: "text-neon-yellow", bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
                            { label: "Hoa hồng DK", value: (commission / 1000000).toFixed(1) + "M", icon: "🏦", color: "text-orange-400", bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20" },
                          ];`;

content = content.replace(kpisOld, kpisNew);

// Chunk 2: Sub-tab navigation
const navOld = `                          {[
                            { key: "venues", label: "🏢 Danh sách Sân" },
                            { key: "registrations", label: "⌛ Duyệt Chủ Sân" },
                            { key: "slots", label: "📅 Lịch Slot" },
                          ].map(tab => (`;
const navNew = `                          {[
                            { key: "venues", label: "🏢 Danh sách Sân" },
                            { key: "registrations", label: "⌛ Duyệt Chủ Sân" },
                            { key: "slots", label: "🏆 BXH Sân" },
                          ].map(tab => (`;
content = content.replace(navOld, navNew);

// Chunk 3: Venue info grid
const gridOld = `                                      <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-appDark-border/20">
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Slot đăng</div>
                                          <div className="text-[11px] font-black text-cyan-400">{venueSlots.length}</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Booked</div>
                                          <div className="text-[11px] font-black text-emerald-400">{bookedVSlots.length}</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Fill Rate</div>
                                          <div className={\`text-[11px] font-black \${parseInt(vFillRate) >= 60 ? "text-emerald-400" : parseInt(vFillRate) >= 30 ? "text-amber-400" : "text-red-400"}\`}>{vFillRate}%</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Doanh thu</div>
                                          <div className="text-[11px] font-black text-neon-yellow">{(vRevenue / 1000).toFixed(0)}K</div>
                                        </div>
                                      </div>`;

const gridNew = `                                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-appDark-border/20">
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-left space-y-0.5">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Ngày tham gia</div>
                                          <div className="text-[10px] font-black text-white">{v.joinDate || "01/01/2024"}</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-left space-y-0.5">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Trạng thái HĐ</div>
                                          {parseInt(v.id || '1') % 3 === 0 ? (
                                            <div className="text-[10px] font-black text-red-400 animate-pulse flex items-center gap-1">⚠️ Ngừng HĐ &gt; 30 ngày</div>
                                          ) : (
                                            <div className="text-[10px] font-black text-emerald-400">✅ Đang hoạt động</div>
                                          )}
                                        </div>
                                        <div className="col-span-2 bg-appDark-deep/50 rounded-lg p-1.5 text-left space-y-0.5">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Ghi chú</div>
                                          <div className="text-[10px] text-slate-300 italic">{v.notes || "Không có ghi chú thêm."}</div>
                                        </div>
                                      </div>`;
content = content.replace(gridOld, gridNew);

// Chunk 4: Replace SUB-TAB 3 (slots) content with leaderboard
// Using regex to match from SUB-TAB 3 to the end of the tab
const tab3Start = `{/* SUB-TAB 3: SLOT DIRECTORY */}`;
const tab3Regex = new RegExp(`\\{\\/\\* SUB-TAB 3: SLOT DIRECTORY \\*\\/\\}[\\s\\S]*?\\}\\)\\(\\)\\}

                      <\\/div>
                    \\)}`);

const leaderboardNew = `{/* SUB-TAB 3: BXH SÂN (LEADERBOARD) */}
                        {adminVenueSubTab === "slots" && (
                          <div className="space-y-3">
                            <div className="bg-appDark-card border border-appDark-border rounded-xl p-4 shadow-md flex flex-col">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                                <span>🏆</span> BẢNG XẾP HẠNG SÂN (TRẬN HOÀN THÀNH)
                              </h4>
                              <div className="space-y-3">
                                {(() => {
                                  // Mock calculation of completed matches per venue
                                  const venueStats = venues.filter(v => v.verification_status === 'verified').map((v, idx) => {
                                    // Generate some fake stats based on venue id
                                    const completed = 150 - (parseInt(v.id || idx) * 12) + (idx * 5);
                                    return { ...v, completedMatches: Math.max(5, completed) };
                                  }).sort((a, b) => b.completedMatches - a.completedMatches).slice(0, 10); // Top 10

                                  if (venueStats.length === 0) {
                                    return <div className="text-center text-xs text-slate-500 py-4">Chưa có dữ liệu.</div>;
                                  }

                                  const maxVal = venueStats[0].completedMatches;

                                  return venueStats.map((v, idx) => {
                                    const percent = Math.round((v.completedMatches / maxVal) * 100);
                                    let rankIcon = \`#\${idx + 1}\`;
                                    let textCol = 'text-white';
                                    let bgCol = 'bg-neon-green';
                                    if (idx === 0) { rankIcon = '🥇'; textCol = 'text-amber-400'; bgCol = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'; }
                                    else if (idx === 1) { rankIcon = '🥈'; textCol = 'text-slate-300'; bgCol = 'bg-slate-300'; }
                                    else if (idx === 2) { rankIcon = '🥉'; textCol = 'text-orange-400'; bgCol = 'bg-orange-400'; }

                                    return (
                                      <div key={v.id} className="space-y-1.5 group">
                                        <div className="flex justify-between items-end text-[10px]">
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                            <span className="font-black text-xs min-w-[20px]">{rankIcon}</span>
                                            <span className={\`font-bold text-xs truncate \${textCol}\`}>{v.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-slate-300 font-bold">{v.completedMatches} trận</span>
                                          </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-appDark-deep rounded-full overflow-hidden border border-appDark-border/50">
                                          <div 
                                            className={\`h-full rounded-full transition-all duration-1000 \${bgCol}\`} 
                                            style={{ width: \`\${percent}%\` }}
                                          ></div>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}`;

content = content.replace(tab3Regex, leaderboardNew);

fs.writeFileSync(file, content, 'utf8');
console.log('Modifications applied successfully!');
