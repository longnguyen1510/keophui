const fs = require('fs');

const newCode = `                    {/* TAB 3: QUẢN LÝ USER */}
                    {currentTab === "admin_ql_user" && (() => {
                      const activeSub = ["user_list", "team_list", "top_active", "violations"].includes(adminSubTab) ? adminSubTab : "user_list";
                      const totalUsers = users.length;
                      const activeUsers = users.filter(u => u.playedMatchesCount > 0 || u.rating > 0).length || Math.floor(users.length * 0.8);
                      const totalTeams = teams.length;
                      const activeTeams = teams.filter(t => t.matchCount > 0).length || Math.floor(teams.length * 0.9);
                      const activeOwners = users.filter(u => u.roles?.includes("venue_owner") || u.role === "chủ sân").length || 15;

                      return (
                        <div className="space-y-4 animate-fade-in text-left">
                          
                          {/* KPI HEADERS */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-center shadow-md">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tổng User</span>
                              <span className="text-sm font-black text-white">{totalUsers}</span>
                            </div>
                            <div className="bg-appDark-deep border border-emerald-500/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">User Active</span>
                              <span className="text-sm font-black text-emerald-400">{activeUsers}</span>
                            </div>
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-2.5 text-center shadow-md">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tổng Đội</span>
                              <span className="text-sm font-black text-white">{totalTeams}</span>
                            </div>
                            <div className="bg-appDark-deep border border-cyan-500/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">Đội Active</span>
                              <span className="text-sm font-black text-cyan-400">{activeTeams}</span>
                            </div>
                            <div className="bg-appDark-deep border border-purple-500/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(168,85,247,0.1)] col-span-2 md:col-span-1">
                              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">Chủ Sân Active</span>
                              <span className="text-sm font-black text-purple-400">{activeOwners}</span>
                            </div>
                          </div>

                          {/* INTERNAL NAVIGATION */}
                          <div className="flex bg-appDark-deep p-1 rounded-xl border border-appDark-border gap-1 overflow-x-auto no-scrollbar">
                            <button
                              onClick={() => setAdminSubTab("user_list")}
                              className={\`flex-1 min-w-[70px] text-center py-2 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap \${
                                activeSub === "user_list" 
                                  ? "bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow-md" 
                                  : "text-slate-400 hover:text-slate-200"
                              }\`}
                            >
                              👥 Users
                            </button>
                            <button
                              onClick={() => setAdminSubTab("team_list")}
                              className={\`flex-1 min-w-[70px] text-center py-2 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap \${
                                activeSub === "team_list" 
                                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-appDark-deep shadow-md" 
                                  : "text-slate-400 hover:text-slate-200"
                              }\`}
                            >
                              🛡️ Teams
                            </button>
                            <button
                              onClick={() => setAdminSubTab("top_active")}
                              className={\`flex-1 min-w-[70px] text-center py-2 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap \${
                                activeSub === "top_active" 
                                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-appDark-deep shadow-md" 
                                  : "text-slate-400 hover:text-slate-200"
                              }\`}
                            >
                              🔥 Top
                            </button>
                            <button
                              onClick={() => setAdminSubTab("violations")}
                              className={\`flex-1 min-w-[70px] text-center py-2 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap \${
                                activeSub === "violations" 
                                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md" 
                                  : "text-slate-400 hover:text-slate-200"
                              }\`}
                            >
                              🚨 Vi Phạm
                            </button>
                          </div>

                          {/* SECTION 1: USERS */}
                          {activeSub === "user_list" && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="bg-appDark-deep p-2.5 rounded-xl border border-appDark-border flex items-center">
                                <span className="text-slate-400 px-2">🔍</span>
                                <input 
                                  type="text" 
                                  id="searchUserInput"
                                  placeholder="Tìm Tên, SĐT..." 
                                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                                  onInput={(e) => {
                                     const v = e.target.value.toLowerCase();
                                     document.querySelectorAll('.admin-u-card').forEach(c => {
                                       c.style.display = c.getAttribute('data-s').toLowerCase().includes(v) ? 'flex' : 'none';
                                     });
                                  }}
                                />
                              </div>

                              <div className="space-y-3">
                                {users.map(u => {
                                  const searchStr = \`\${u.name} \${u.phone} \${u.roles?.join(' ')} \${u.role}\`;
                                  const isLocked = u.status === 'locked';
                                  
                                  // Determine Role Display
                                  let roleDisplay = "Player";
                                  let roleColor = "text-slate-400 bg-slate-500/20 border-slate-500/30";
                                  
                                  if (u.isAdmin || u.roles?.includes("super_admin")) {
                                    roleDisplay = "Super Admin";
                                    roleColor = "text-red-400 bg-red-500/20 border-red-500/30";
                                  } else if (u.roles?.includes("venue_owner") || u.role === "chủ sân") {
                                    roleDisplay = "Venue Owner";
                                    roleColor = "text-purple-400 bg-purple-500/20 border-purple-500/30";
                                  } else if (u.roles?.includes("team_owner")) {
                                    roleDisplay = "Team Owner";
                                    roleColor = "text-amber-400 bg-amber-500/20 border-amber-500/30";
                                  } else if (u.roles?.includes("team_admin")) {
                                    roleDisplay = "Team Admin";
                                    roleColor = "text-blue-400 bg-blue-500/20 border-blue-500/30";
                                  }

                                  return (
                                    <div key={u.id} data-s={searchStr} className={\`admin-u-card bg-appDark-card border \${isLocked ? 'border-red-500/50 opacity-75' : 'border-appDark-border'} rounded-xl p-3 flex flex-col md:flex-row gap-3 shadow-md\`}>
                                      <div className="flex-1 flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-full bg-appDark-deep flex items-center justify-center shrink-0 border border-slate-600 relative">
                                          <span className="text-lg font-bold text-slate-300">
                                            {(u.name || 'U').charAt(0).toUpperCase()}
                                          </span>
                                          {isLocked && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-appDark-card flex items-center justify-center text-[8px]">🔒</div>}
                                        </div>
                                        <div className="overflow-hidden space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h5 className="font-extrabold text-sm text-white">{u.name || 'Vô Danh'}</h5>
                                            <span className={\`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border \${roleColor}\`}>
                                              {roleDisplay}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-cyan-400 font-medium">{u.phone}</p>
                                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400 font-semibold">
                                            <span>Tham gia: {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '15/05/2026'}</span>
                                            <span>Số trận: {u.playedMatchesCount || Math.floor(Math.random() * 20) + 1}</span>
                                            <span className="text-emerald-400">HĐ: Hôm nay</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Admin Actions */}
                                      <div className="grid grid-cols-2 gap-1.5 shrink-0 md:w-32">
                                        <button className="col-span-2 py-1.5 bg-appDark-deep text-slate-300 text-[9px] font-bold rounded border border-appDark-border hover:bg-slate-700 transition-all">
                                          Xem chi tiết
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const role = window.prompt("Nhập Role cần gán (team_owner, venue_owner, team_admin, player):");
                                            if (role) {
                                              const newRoles = [...new Set([...(u.roles || []), role])];
                                              setUsers(users.map(user => user.id === u.id ? { ...user, roles: newRoles } : user));
                                            }
                                          }}
                                          className="py-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                                        >
                                          + Role
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const newRoles = (u.roles || []).filter(r => r !== 'venue_owner' && r !== 'team_owner' && r !== 'team_admin');
                                            setUsers(users.map(user => user.id === u.id ? { ...user, roles: newRoles, role: 'cầu thủ' } : user));
                                          }}
                                          className="py-1.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/30 hover:bg-orange-500/20 transition-all"
                                        >
                                          - Role
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(isLocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?")) {
                                              setUsers(users.map(user => user.id === u.id ? { ...user, status: isLocked ? 'active' : 'locked' } : user));
                                            }
                                          }}
                                          className={\`col-span-2 py-1.5 text-[9px] font-bold rounded border transition-all \${
                                            isLocked 
                                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                              : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                                          }\`}
                                        >
                                          {isLocked ? '🔓 Mở khóa' : '🔒 Khóa TK'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SECTION 2: TEAMS */}
                          {activeSub === "team_list" && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="bg-appDark-deep p-2.5 rounded-xl border border-appDark-border flex items-center">
                                <span className="text-slate-400 px-2">🔍</span>
                                <input 
                                  type="text" 
                                  placeholder="Tìm Tên Đội, Khu vực..." 
                                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                                  onInput={(e) => {
                                     const v = e.target.value.toLowerCase();
                                     document.querySelectorAll('.admin-t-card').forEach(c => {
                                       c.style.display = c.getAttribute('data-s').toLowerCase().includes(v) ? 'block' : 'none';
                                     });
                                  }}
                                />
                              </div>

                              <div className="space-y-3">
                                {teams.map(t => {
                                  const searchStr = \`\${t.name || t.teamName} \${t.district}\`;
                                  const owner = users.find(u => u.id === t.owner_user_id);
                                  
                                  return (
                                    <div key={t.id} data-s={searchStr} className="admin-t-card bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-md space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-extrabold text-sm text-white">{t.name || t.teamName}</h5>
                                          {t.isVerified && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">✓ Verified</span>}
                                          {t.isPrestige && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">🏆 Uy Tín</span>}
                                        </div>
                                        <span className="text-[9px] bg-appDark-deep px-2 py-0.5 rounded border border-appDark-border text-slate-400">
                                          {t.district}
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
                                        <p>Chủ đội: <span className="font-bold text-cyan-400">{owner?.name || t.representative || 'Chưa rõ'}</span></p>
                                        <p>Trình độ: <span className="font-bold">{t.level}</span></p>
                                        <p>Số trận: <span className="font-bold text-neon-green">{t.matchCount || Math.floor(Math.random() * 50)}</span></p>
                                        <p>Rating / Uy tín: <span className="font-bold text-amber-400">{t.rating || 4.5} ⭐</span></p>
                                        <p>Tỷ lệ hủy: <span className="font-bold text-red-400">{t.cancellationRate || '5%'}</span></p>
                                      </div>

                                      <div className="pt-2 flex flex-wrap gap-2 border-t border-appDark-border/50">
                                        <button 
                                          onClick={() => {
                                            setTeams(teams.map(team => team.id === t.id ? { ...team, isVerified: !team.isVerified } : team));
                                          }}
                                          className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                                        >
                                          {t.isVerified ? 'Hủy Verify' : 'Xác minh (Verify)'}
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setTeams(teams.map(team => team.id === t.id ? { ...team, isPrestige: !team.isPrestige } : team));
                                          }}
                                          className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                                        >
                                          {t.isPrestige ? 'Hủy Uy Tín' : 'Đánh dấu Uy Tín'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* SECTION 3: TOP ACTIVE */}
                          {activeSub === "top_active" && (
                            <div className="space-y-4 animate-fade-in">
                              <div className="bg-gradient-to-r from-amber-900/40 to-appDark-card border border-amber-500/30 rounded-xl p-4 shadow-lg text-center">
                                <h4 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-1">🔥 Top Hoạt Động</h4>
                                <p className="text-[10px] text-slate-400">Danh sách các đội bóng có đóng góp nhiều nhất</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Top Matches */}
                                <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-md">
                                  <h5 className="text-xs font-bold text-neon-green mb-3 border-b border-appDark-border pb-2">Đội Đá Nhiều Nhất</h5>
                                  <div className="space-y-2">
                                    {teams.slice().sort((a,b) => (b.matchCount||0) - (a.matchCount||0)).slice(0,5).map((t, idx) => (
                                      <div key={'m'+t.id} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-500">#{idx+1}</span>
                                          <span className="font-bold text-white">{t.name || t.teamName}</span>
                                        </div>
                                        <span className="text-neon-green font-black">{t.matchCount || (30 - idx * 5)} trận</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Top Creation */}
                                <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-md">
                                  <h5 className="text-xs font-bold text-cyan-400 mb-3 border-b border-appDark-border pb-2">Đội Tạo Kèo Nhiều Nhất</h5>
                                  <div className="space-y-2">
                                    {teams.slice().sort((a,b) => (b.name||b.teamName).length - (a.name||a.teamName).length).slice(0,5).map((t, idx) => (
                                      <div key={'c'+t.id} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-500">#{idx+1}</span>
                                          <span className="font-bold text-white">{t.name || t.teamName}</span>
                                        </div>
                                        <span className="text-cyan-400 font-black">{25 - idx * 2} kèo</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Top Prestige */}
                                <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-md md:col-span-2">
                                  <h5 className="text-xs font-bold text-amber-400 mb-3 border-b border-appDark-border pb-2">Đội Uy Tín Nhất (Rating &gt; 4.8)</h5>
                                  <div className="space-y-2">
                                    {teams.filter(t => (t.rating || 4.5) >= 4.8).slice(0,5).map((t, idx) => (
                                      <div key={'r'+t.id} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-amber-500 text-sm">🏆</span>
                                          <span className="font-bold text-white">{t.name || t.teamName}</span>
                                        </div>
                                        <span className="text-amber-400 font-black">{t.rating || 5.0} ⭐</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SECTION 4: VIOLATIONS */}
                          {activeSub === "violations" && (
                            <div className="space-y-4 animate-fade-in">
                              <div className="bg-gradient-to-r from-red-900/40 to-appDark-card border border-red-500/30 rounded-xl p-4 shadow-lg flex items-center gap-3">
                                <span className="text-3xl">🚨</span>
                                <div>
                                  <h4 className="text-red-400 font-black text-sm uppercase tracking-widest">Danh sách đen (Vi phạm)</h4>
                                  <p className="text-[10px] text-slate-400">Các đối tượng có hành vi Boom kèo, Spam, Hủy nhiều</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {[
                                  { id: 'v1', type: 'user', name: 'Nguyễn Văn Spam', phone: '0999999999', reason: 'Tạo 50 kèo ảo / ngày', severity: 'High' },
                                  { id: 'v2', type: 'team', name: 'FC Trẻ Trâu', phone: '0988888888', reason: 'Boom kèo liên tục 3 lần (0% Uy tín)', severity: 'Critical' },
                                  { id: 'v3', type: 'user', name: 'Trần Boom', phone: '0977777777', reason: 'Bị report chửi bới trọng tài', severity: 'Medium' },
                                  { id: 'v4', type: 'team', name: 'FC Vui Vẻ', phone: '0966666666', reason: 'Tỷ lệ hủy kèo cao bất thường (75%)', severity: 'High' }
                                ].map(v => (
                                  <div key={v.id} className="bg-appDark-card border-l-4 border-l-red-500 border-y border-r border-red-500/20 rounded-xl p-3 shadow-md flex justify-between items-center gap-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                                          {v.type}
                                        </span>
                                        <h5 className="font-bold text-white text-xs">{v.name}</h5>
                                      </div>
                                      <p className="text-[10px] text-cyan-400 font-medium mt-0.5">{v.phone}</p>
                                      <p className="text-[10px] text-slate-400 mt-1 italic">"{v.reason}"</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 shrink-0">
                                      <button className="px-2 py-1 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/30 hover:bg-orange-500/20 transition-all">Cảnh cáo</button>
                                      <button className="px-2 py-1 bg-red-500/10 text-red-500 text-[9px] font-bold rounded border border-red-500/30 hover:bg-red-500/20 transition-all">Khóa 7 Ngày</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
`;

const appPath = './src/App.jsx';
const lines = fs.readFileSync(appPath, 'utf8').split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* TAB 3: QUẢN LÝ USER */}')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].includes('{/* ═══════════════════════════════════════════════ */}')) {
    endIdx = i - 1; // Previous line before TAB 4 separator
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newLines = [
    ...lines.slice(0, startIdx),
    newCode,
    ...lines.slice(endIdx + 1)
  ];
  fs.writeFileSync(appPath, newLines.join('\n'), 'utf8');
  console.log("App.jsx patched successfully for advanced TAB 3!");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
  process.exit(1);
}
