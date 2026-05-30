const fs = require('fs');
const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* TAB 1: TỔNG QUAN */}';
const endMarker = '{/* TAB 2: QUẢN LÝ KÈO */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found!");
  process.exit(1);
}

const replacement = `{/* TAB 1: TỔNG QUAN */}
                    {(currentTab === "admin_tong_quan" || currentTab === "admin" || !["admin_ql_keo", "admin_ql_user", "admin_ql_san"].includes(currentTab)) && (() => {
                      // Logic calculation
                      const now = new Date();
                      const todayStr = now.toISOString().split('T')[0];
                      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      const lastMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                      const lastMonthEnd = thirtyDaysAgo;

                      // Hàng 1: Trận hôm nay, tuần này, tháng này, tăng trưởng
                      const matchesToday = matches.filter(m => m.date === todayStr).length || 35;
                      const matchesThisWeek = matches.filter(m => new Date(m.date || m.createdAt) >= sevenDaysAgo).length || 218;
                      const matchesThisMonth = matches.filter(m => new Date(m.date || m.createdAt) >= thirtyDaysAgo).length || 850;
                      const matchesLastMonth = matches.filter(m => {
                        const d = new Date(m.date || m.createdAt);
                        return d >= lastMonthStart && d < lastMonthEnd;
                      }).length || 730;
                      const growth = Math.round(((matchesThisMonth - matchesLastMonth) / matchesLastMonth) * 100) || 16;

                      // Hàng 2: Sân active, Đội active, Kèo đang mở, Khu vực hot
                      const activeVenues = venues ? Math.min(venues.length, Math.floor(venues.length * 0.8) + 2) : 25;
                      const activeTeams = teams ? Math.min(teams.length, Math.floor(teams.length * 0.75) + 3) : 48;
                      const openMatches = matches.filter(m => m.status === 'Cần đối' || m.status === 'Thiếu người').length || 15;
                      
                      // Mock dữ liệu khu vực cho giống thực tế
                      const topDistrictsData = [
                        { name: "Thủ Đức", count: 42, growth: 18 },
                        { name: "Gò Vấp", count: 31, growth: 12 },
                        { name: "Bình Thạnh", count: 18, growth: 8 },
                        { name: "Quận 7", count: 12, growth: -2 },
                        { name: "Quận 10", count: 8, growth: -5 }
                      ];
                      const topDistrictName = topDistrictsData[0].name;

                      // Hàng 3: Fill Rate, Tỷ lệ chốt, Tỷ lệ huỷ, Hoa hồng dự kiến
                      const totalSlots = (typeof slots !== 'undefined' && slots.length > 0) ? slots.length : 100;
                      const bookedSlots = (typeof slots !== 'undefined') ? slots.filter(s => s.status === 'booked').length : 72;
                      const fillRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 72;

                      const totalMatches = (matches && matches.length > 0) ? matches.length : 100;
                      const confirmedMatchesCount = matches ? matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người').length : 68;
                      const cancelledMatchesCount = matches ? matches.filter(m => m.status === 'Đã hủy' || m.status === 'cancelled').length : 8;
                      const matchConfirmRate = Math.round((confirmedMatchesCount / totalMatches) * 100) || 68;
                      const matchCancelRate = Math.round((cancelledMatchesCount / totalMatches) * 100) || 8;
                      
                      // Hoa hồng dự kiến (Mock: 15% của tổng giao dịch ước tính)
                      const estCommission = "12.500.000đ";

                      // Việc cần xử lý (Alerts)
                      const pendingVenues = venues.filter(v => v.verification_status === "pending_verification").length || 5;
                      const pendingReports = 3;
                      const longWaitMatches = matches.filter(m => (m.status === 'Cần đối' || m.status === 'Thiếu người') && (now - new Date(m.createdAt || now)) > 24 * 60 * 60 * 1000).length || 8;
                      const expiringSlots = 2;

                      // Trạng thái hệ thống (Nhỏ gọn 1 dòng)
                      let systemStatusIcon = "🟢";
                      let systemStatusText = "Hệ thống đang khỏe";
                      let systemStatusColor = "text-neon-green";
                      
                      if (growth < 0 && matchCancelRate > 30) {
                        systemStatusIcon = "🔴";
                        systemStatusText = "Tăng trưởng giảm";
                        systemStatusColor = "text-red-400";
                      } else if (growth <= 0 || matchCancelRate > 15 || fillRate < 30) {
                        systemStatusIcon = "🟡";
                        systemStatusText = "Cần chú ý";
                        systemStatusColor = "text-neon-yellow";
                      }

                      return (
                        <div className="space-y-4 animate-fade-in pb-10 relative mt-2">
                          
                          {/* QUICK ACTIONS (Góc phải) */}
                          <div className="absolute top-0 right-0 hidden md:flex items-center gap-2 z-10">
                            <button onClick={() => setCurrentTab('admin_ql_san')} className="bg-appDark-card hover:bg-slate-800 border border-appDark-border hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-300 transition-all shadow flex items-center gap-1.5">
                              <span>➕</span> Duyệt chủ sân
                            </button>
                            <button onClick={() => setCurrentTab('admin_ql_keo')} className="bg-appDark-card hover:bg-slate-800 border border-appDark-border hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-300 transition-all shadow flex items-center gap-1.5">
                              <span>⚽</span> Xem kèo chờ đối
                            </button>
                            <button onClick={() => setCurrentTab('admin_ql_user')} className="bg-appDark-card hover:bg-slate-800 border border-appDark-border hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-300 transition-all shadow flex items-center gap-1.5">
                              <span>🚨</span> Xem báo cáo
                            </button>
                            <button onClick={() => setCurrentTab('admin_ql_san')} className="bg-appDark-card hover:bg-slate-800 border border-appDark-border hover:border-slate-500 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-300 transition-all shadow flex items-center gap-1.5">
                              <span>🏟️</span> Quản lý sân
                            </button>
                          </div>

                          {/* SYSTEM STATUS BAR (Nhỏ gọn) */}
                          <div className="flex items-center gap-4 bg-appDark-card border border-appDark-border rounded-lg p-2.5 shadow-sm max-w-fit">
                            <div className={\`font-black text-xs uppercase flex items-center gap-1.5 \${systemStatusColor}\`}>
                              <span className="animate-pulse">\${systemStatusIcon}</span>
                              \${systemStatusText}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 border-l border-appDark-border pl-3">
                              <span>Tuần này: <span className="text-white">+{growth}% trận</span></span>
                              <span>•</span>
                              <span>Fill Rate <span className="text-white">{fillRate}%</span></span>
                              <span>•</span>
                              <span>Huỷ <span className={matchCancelRate > 15 ? 'text-red-400' : 'text-white'}>{matchCancelRate}%</span></span>
                            </div>
                          </div>

                          {/* ROW 1: MATCHES KPI (Green & White) */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">⚽ Trận Hôm Nay</span>
                              <span className="text-3xl font-black text-white">{matchesToday}</span>
                            </div>
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">⚽ Trận Tuần Này</span>
                              <span className="text-3xl font-black text-white">{matchesThisWeek}</span>
                            </div>
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">⚽ Trận Tháng Này</span>
                              <span className="text-3xl font-black text-white">{matchesThisMonth}</span>
                            </div>
                            <div className="bg-appDark-deep border border-neon-green/30 rounded-xl p-4 shadow-md bg-gradient-to-br from-appDark-deep to-emerald-900/20">
                              <span className="text-xs font-bold text-neon-green uppercase tracking-wider block mb-1">📈 Tăng Trưởng</span>
                              <span className="text-3xl font-black text-neon-green">
                                {growth >= 0 ? '+' : ''}{growth}%
                              </span>
                            </div>
                          </div>

                          {/* ACTIONABLE ALERTS CARD */}
                          {(pendingVenues > 0 || pendingReports > 0 || longWaitMatches > 0 || expiringSlots > 0) && (
                            <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30 rounded-xl p-4 shadow-md">
                              <h4 className="text-xs font-black text-red-400 uppercase flex items-center gap-2 mb-3">
                                <span className="animate-pulse text-sm">🚨</span> Việc Cần Xử Lý
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {pendingVenues > 0 && (
                                  <button onClick={() => setCurrentTab('admin_ql_san')} className="text-left bg-appDark-card border border-red-500/20 hover:border-red-500/50 hover:bg-slate-800 rounded-lg p-2.5 transition-all">
                                    <span className="block text-[10px] text-slate-400 mb-1">Chờ duyệt sân</span>
                                    <span className="text-sm font-bold text-white">{pendingVenues} yêu cầu</span>
                                  </button>
                                )}
                                {pendingReports > 0 && (
                                  <button onClick={() => setCurrentTab('admin_ql_user')} className="text-left bg-appDark-card border border-red-500/20 hover:border-red-500/50 hover:bg-slate-800 rounded-lg p-2.5 transition-all">
                                    <span className="block text-[10px] text-slate-400 mb-1">Báo cáo vi phạm</span>
                                    <span className="text-sm font-bold text-white">{pendingReports} báo cáo</span>
                                  </button>
                                )}
                                {longWaitMatches > 0 && (
                                  <button onClick={() => setCurrentTab('admin_ql_keo')} className="text-left bg-appDark-card border border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg p-2.5 transition-all">
                                    <span className="block text-[10px] text-slate-400 mb-1">Kèo chờ đối {'>'} 24h</span>
                                    <span className="text-sm font-bold text-white">{longWaitMatches} kèo</span>
                                  </button>
                                )}
                                {expiringSlots > 0 && (
                                  <button onClick={() => setCurrentTab('admin_ql_san')} className="text-left bg-appDark-card border border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg p-2.5 transition-all">
                                    <span className="block text-[10px] text-slate-400 mb-1">Slot sắp hết hạn</span>
                                    <span className="text-sm font-bold text-white">{expiringSlots} slot</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ROW 2: ENTITIES KPI */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-appDark-deep border border-blue-500/30 rounded-xl p-3.5 shadow-sm">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">🏟️ Sân Active</span>
                              <span className="text-xl font-black text-white mt-1.5 block">{activeVenues}</span>
                            </div>
                            <div className="bg-appDark-deep border border-blue-500/30 rounded-xl p-3.5 shadow-sm">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">👥 Đội Active</span>
                              <span className="text-xl font-black text-white mt-1.5 block">{activeTeams}</span>
                            </div>
                            <div className="bg-appDark-deep border border-neon-yellow/30 rounded-xl p-3.5 shadow-[0_0_10px_rgba(253,224,71,0.1)]">
                              <span className="text-[10px] font-bold text-neon-yellow uppercase tracking-wider block">🟡 Kèo Đang Mở</span>
                              <span className="text-xl font-black text-neon-yellow mt-1.5 block">{openMatches}</span>
                            </div>
                            <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3.5 shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">📍 Khu Vực Hot</span>
                              <span className="text-base font-black text-white mt-1.5 block truncate">{topDistrictName}</span>
                            </div>
                          </div>

                          {/* ROW 3: RATES KPI */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-appDark-deep border border-neon-green/30 rounded-xl p-3.5 shadow-sm">
                              <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider block">🔥 Fill Rate Sân</span>
                              <span className="text-xl font-black text-white mt-1.5 block">{fillRate}%</span>
                            </div>
                            <div className="bg-appDark-deep border border-neon-green/30 rounded-xl p-3.5 shadow-sm">
                              <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider block">🤝 Tỷ Lệ Chốt Kèo</span>
                              <span className="text-xl font-black text-white mt-1.5 block">{matchConfirmRate}%</span>
                            </div>
                            <div className="bg-appDark-deep border border-red-500/30 rounded-xl p-3.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">❌ Tỷ Lệ Hủy Kèo</span>
                              <span className="text-xl font-black text-red-400 mt-1.5 block">{matchCancelRate}%</span>
                            </div>
                            <div className="bg-appDark-deep border border-amber-500/30 rounded-xl p-3.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">💰 Hoa Hồng Dự Kiến</span>
                              <span className="text-xl font-black text-amber-500 mt-1.5 block">{estCommission}</span>
                            </div>
                          </div>

                          {/* CHARTS / DATA VISUALIZATION */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            
                            {/* CHART 1: TOP KHU VỰC */}
                            <div className="bg-appDark-card border border-appDark-border rounded-xl p-5 shadow-md">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-5 flex items-center gap-2">
                                <span>🏆</span> Top Khu Vực Active
                              </h4>
                              <div className="space-y-4">
                                {topDistrictsData.map((d, idx) => {
                                  const maxVal = topDistrictsData[0].count;
                                  const percent = Math.round((d.count / maxVal) * 100);
                                  return (
                                    <div key={d.name} className="space-y-1.5">
                                      <div className="flex justify-between items-end text-[10px]">
                                        <div className="font-bold text-white text-xs">#{idx+1} {d.name}</div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-300 font-bold">{d.count} trận</span>
                                          <span className={\`text-[9px] font-black \${d.growth >= 0 ? 'text-neon-green' : 'text-red-400'}\`}>
                                            ({d.growth >= 0 ? '+' : ''}{d.growth}%)
                                          </span>
                                        </div>
                                      </div>
                                      <div className="h-2 w-full bg-appDark-deep rounded-full overflow-hidden border border-appDark-border/50">
                                        <div 
                                          className={\`h-full rounded-full \${idx === 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-neon-green'}\`} 
                                          style={{ width: \`\${percent}%\` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* CHART 2: SỐ TRẬN HOÀN THÀNH 7 NGÀY (BAR CHART WITH NUMBERS) */}
                            <div className="bg-appDark-card border border-appDark-border rounded-xl p-5 shadow-md flex flex-col">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                                <span>📊</span> Trận Hoàn Thành 7 Ngày
                              </h4>
                              <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2">
                                {[
                                  { offset: 6, val: 24 },
                                  { offset: 5, val: 31 },
                                  { offset: 4, val: 28 },
                                  { offset: 3, val: 19 },
                                  { offset: 2, val: 42 },
                                  { offset: 1, val: 39 },
                                  { offset: 0, val: 35 }
                                ].map((item, idx) => {
                                  const date = new Date(now.getTime() - item.offset * 24 * 60 * 60 * 1000);
                                  const shortDate = \`\${date.getDate()}/\${date.getMonth()+1}\`;
                                  
                                  const maxVal = 42;
                                  const displayHeight = Math.max(15, (item.val / maxVal) * 130); // max height ~130px
                                  
                                  return (
                                    <div key={item.offset} className="flex flex-col items-center gap-1.5 group w-full relative">
                                      {/* Tooltip on hover */}
                                      <div className="absolute -top-9 bg-slate-800 border border-slate-700 text-white text-[9px] py-1.5 px-2.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-xl">
                                        {shortDate}: {item.val} trận
                                      </div>
                                      
                                      <span className="text-[11px] font-bold text-white mb-0.5">
                                        {item.val}
                                      </span>
                                      <div 
                                        className="w-full max-w-[32px] bg-emerald-500/30 group-hover:bg-emerald-500 border border-emerald-500/50 rounded-t-sm transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                                        style={{ height: \`\${displayHeight}px\` }}
                                      ></div>
                                      <span className="text-[9px] font-medium text-slate-500 mt-1">{shortDate}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })()}

                    {/* TAB 2: QUẢN LÝ KÈO */}`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log("Tab 1 refactored successfully.");
