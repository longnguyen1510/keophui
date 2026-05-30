const fs = require('fs');
const path = './src/App.jsx';

let code = fs.readFileSync(path, 'utf8');

const startMarker = '{/* TAB 2: QUẢN LÝ KÈO */}';
const endMarker = '{/* TAB 3: QUẢN LÝ USER */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const newTab2Code = `{/* TAB 2: QUẢN LÝ KÈO */}
                    {currentTab === "admin_ql_keo" && (() => {
                      // Tính toán KPI
                      const openMatches = matches.filter(m => m.status === 'Cần đối' || m.status === 'Thiếu người').length;
                      const pendingMatches = matches.filter(m => m.status === 'Chờ xác nhận').length;
                      const confirmedMatches = matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người').length;
                      const cancelledMatches = matches.filter(m => m.status === 'Đã hủy' || m.status === 'cancelled').length;
                      const completedMatches = matches.filter(m => m.status === 'Hoàn thành' || m.status === 'completed').length;

                      // Kèo có vấn đề
                      const problemMatches = matches.filter(m => {
                        // Kèo quá lâu chưa có đối (giả lập > 3 ngày)
                        const isOld = m.date && (new Date() - new Date(m.date)) > 3 * 24 * 60 * 60 * 1000;
                        return (m.status === 'Cần đối' && isOld) || m.status === 'Đã hủy' || m.hasComplaint;
                      });

                      return (
                        <div className="space-y-4 animate-fade-in text-left pb-10">
                          {/* KPI Đầu Tab */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            <div className="bg-appDark-deep border border-neon-yellow/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(253,224,71,0.1)]">
                              <span className="text-[9px] font-bold text-neon-yellow uppercase tracking-wider block">Kèo Đang Mở</span>
                              <span className="text-sm font-black text-neon-yellow">{openMatches}</span>
                            </div>
                            <div className="bg-appDark-deep border border-blue-500/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">Chờ Xác Nhận</span>
                              <span className="text-sm font-black text-blue-400">{pendingMatches}</span>
                            </div>
                            <div className="bg-appDark-deep border border-neon-green/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <span className="text-[9px] font-bold text-neon-green uppercase tracking-wider block">Đã Chốt</span>
                              <span className="text-sm font-black text-neon-green">{confirmedMatches}</span>
                            </div>
                            <div className="bg-appDark-deep border border-slate-500/30 rounded-xl p-2.5 text-center shadow-md">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hoàn Thành</span>
                              <span className="text-sm font-black text-white">{completedMatches}</span>
                            </div>
                            <div className="bg-appDark-deep border border-red-500/30 rounded-xl p-2.5 text-center shadow-[0_0_10px_rgba(239,68,68,0.1)] col-span-2 md:col-span-1">
                              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">Đã Hủy</span>
                              <span className="text-sm font-black text-red-400">{cancelledMatches}</span>
                            </div>
                          </div>

                          {/* Cảnh báo Kèo Có Vấn Đề */}
                          {problemMatches.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-pulse">
                              <h5 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1.5">
                                <span>⚠️</span> Cần Chú Ý ({problemMatches.length} kèo có vấn đề)
                              </h5>
                              <p className="text-[10px] text-slate-400">Có các kèo quá lâu chưa có đối, bị hủy nhiều, hoặc có report khiếu nại.</p>
                            </div>
                          )}

                          {/* Filters & Search */}
                          <div className="bg-appDark-deep p-3 rounded-xl border border-appDark-border space-y-2 shadow-md">
                            <div className="flex items-center bg-appDark-card border border-appDark-border rounded-lg px-3 py-2 focus-within:border-neon-green transition-all">
                              <span className="text-slate-400 mr-2">🔍</span>
                              <input 
                                type="text" 
                                id="adminMatchSearchInput"
                                placeholder="Tìm theo Mã kèo, Tên đội, SĐT..." 
                                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                                onInput={(e) => {
                                  const term = e.target.value.toLowerCase();
                                  document.querySelectorAll('.admin-match-card2').forEach(card => {
                                    card.style.display = card.getAttribute('data-search').toLowerCase().includes(term) ? 'block' : 'none';
                                  });
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <select 
                                className="bg-appDark-card border border-appDark-border rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  document.querySelectorAll('.admin-match-card2').forEach(card => {
                                    if(!val) { card.classList.remove('hidden-by-district'); return; }
                                    if(card.getAttribute('data-district') === val) card.classList.remove('hidden-by-district');
                                    else card.classList.add('hidden-by-district');
                                  });
                                }}
                              >
                                <option value="">Tất cả Khu vực</option>
                                {[...new Set(matches.map(m => m.district).filter(Boolean))].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                              <select 
                                className="bg-appDark-card border border-appDark-border rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  document.querySelectorAll('.admin-match-card2').forEach(card => {
                                    if(!val) { card.classList.remove('hidden-by-status'); return; }
                                    if(card.getAttribute('data-status') === val) card.classList.remove('hidden-by-status');
                                    else card.classList.add('hidden-by-status');
                                  });
                                }}
                              >
                                <option value="">Tất cả Trạng thái</option>
                                <option value="Cần đối">Cần đối</option>
                                <option value="Thiếu người">Thiếu người</option>
                                <option value="Chờ xác nhận">Chờ xác nhận</option>
                                <option value="Đã chốt kèo">Đã chốt kèo</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Đã hủy">Đã hủy</option>
                              </select>
                              <input type="date" className="bg-appDark-card border border-appDark-border rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none" />
                              <select className="bg-appDark-card border border-appDark-border rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none">
                                <option value="">Loại Sân</option>
                                <option value="5">Sân 5</option>
                                <option value="7">Sân 7</option>
                                <option value="11">Sân 11</option>
                              </select>
                            </div>
                            <style>{\`.hidden-by-district, .hidden-by-status { display: none !important; }\`}</style>
                          </div>

                          {/* MATCH LIST (CARDS) */}
                          <div className="space-y-3">
                            {matches.slice().reverse().map(m => {
                              const venue = m.venueId ? venues.find(v => v.id === m.venueId) : null;
                              const searchString = \`\${m.id} \${m.teamName || ''} \${m.phone || ''} \${m.district || ''} \${m.status || ''} \${venue ? venue.name : ''}\`;
                              
                              let badgeClass = "text-slate-400 bg-slate-500/10 border-slate-500/30";
                              let dotColor = "bg-slate-400";
                              let displayStatus = m.status;

                              if (m.status === "Cần đối" || m.status === "Thiếu người") {
                                badgeClass = "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30";
                                dotColor = "bg-neon-yellow animate-pulse";
                                displayStatus = "🟡 Đang mở";
                              } else if (m.status === "Chờ xác nhận") {
                                badgeClass = "text-blue-400 bg-blue-500/10 border-blue-500/30";
                                dotColor = "bg-blue-400 animate-pulse";
                                displayStatus = "🔵 Chờ xác nhận";
                              } else if (m.status === "Đã chốt kèo" || m.status === "confirmed" || m.status === "Đã đủ người") {
                                badgeClass = "text-neon-green bg-neon-green/10 border-neon-green/30";
                                dotColor = "bg-neon-green";
                                displayStatus = "🟢 Đã chốt";
                              } else if (m.status === "Hoàn thành" || m.status === "completed") {
                                badgeClass = "text-white bg-slate-700/50 border-slate-600";
                                dotColor = "bg-white";
                                displayStatus = "⚫ Hoàn thành";
                              } else if (m.status === "Đã hủy" || m.status === "cancelled") {
                                badgeClass = "text-red-400 bg-red-500/10 border-red-500/30";
                                dotColor = "bg-red-500";
                                displayStatus = "🔴 Đã hủy";
                              }

                              if (m.hasComplaint) {
                                badgeClass = "text-orange-400 bg-orange-500/10 border-orange-500/30";
                                dotColor = "bg-orange-500 animate-bounce";
                                displayStatus = "🟠 Có khiếu nại";
                              }

                              return (
                                <div key={m.id} data-search={searchString} data-district={m.district || ''} data-status={m.status} className="admin-match-card2 bg-appDark-card border border-appDark-border rounded-xl p-3.5 shadow-md relative overflow-hidden">
                                  {m.hasComplaint && <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/20 blur-xl rounded-full"></div>}
                                  
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-slate-500 bg-appDark-deep px-1.5 py-0.5 rounded border border-appDark-border">
                                        #{m.id.substring(0, 6).toUpperCase()}
                                      </span>
                                      <span className="text-[10px] text-slate-400 bg-appDark-deep px-1.5 py-0.5 rounded border border-appDark-border">Sân {m.type || 7}</span>
                                    </div>
                                    <div className={\`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider \${badgeClass}\`}>
                                      <span className={\`w-1.5 h-1.5 rounded-full \${dotColor}\`}></span>
                                      {displayStatus}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3 bg-appDark-deep/50 rounded-lg p-2 border border-appDark-border/30">
                                    <div className="text-center">
                                      <span className="block text-xs font-extrabold text-white truncate max-w-[100px] mx-auto">{m.teamName || 'Đội A'}</span>
                                      <span className="block text-[9px] text-cyan-400 mt-0.5">{m.phone}</span>
                                    </div>
                                    <div className="text-center">
                                      <span className="text-[9px] font-black text-slate-500 italic px-2 bg-appDark-deep rounded-full border border-appDark-border">VS</span>
                                    </div>
                                    <div className="text-center">
                                      <span className={\`block text-xs font-extrabold truncate max-w-[100px] mx-auto \${m.opponentName ? 'text-white' : 'text-slate-600'}\`}>
                                        {m.opponentName || '???'}
                                      </span>
                                      <span className="block text-[9px] text-slate-500 mt-0.5">{m.opponentPhone || 'Đang chờ'}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                      <span className="text-slate-500">🕒</span>
                                      <span className="font-bold">{m.date} | {m.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                      <span className="text-slate-500">📍</span>
                                      <span className="font-bold truncate">{venue ? venue.name : (m.district || 'Chưa rõ')}</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-2 border-t border-appDark-border/50">
                                    <div className="text-[9px] text-slate-400 font-medium">
                                      Requests: <strong className="text-white">{m.requests?.length || 0}</strong>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setModalType('admin_match_detail');
                                        setModalData({ match: m, venue: venue });
                                      }}
                                      className="text-[10px] font-black text-neon-green hover:text-emerald-400 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      Xem Chi Tiết ➜
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })()}
                    
                    {/* MODAL CHI TIẾT KÈO CHO ADMIN */}
                    {modalType === 'admin_match_detail' && modalData?.match && (() => {
                      const m = modalData.match;
                      const v = modalData.venue;
                      return (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
                          <div className="bg-appDark-card w-full sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-2xl sm:rounded-2xl border border-appDark-border shadow-2xl relative transform transition-transform">
                            {/* Header */}
                            <div className="sticky top-0 bg-appDark-card/90 backdrop-blur-md border-b border-appDark-border p-4 flex justify-between items-center z-10">
                              <div>
                                <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                  <span>⚙️</span> Chi Tiết Kèo
                                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">#{m.id.substring(0,8)}</span>
                                </h3>
                              </div>
                              <button onClick={() => setModalType(null)} className="w-8 h-8 rounded-full bg-appDark-deep flex items-center justify-center text-slate-400 hover:text-white border border-appDark-border transition-all">
                                ✕
                              </button>
                            </div>

                            <div className="p-4 space-y-5">
                              {/* Match Info Block */}
                              <div className="bg-appDark-deep rounded-xl p-3 border border-appDark-border space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng Thái Hiện Tại</span>
                                  <span className="text-xs font-black text-neon-green uppercase bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/30">{m.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="block text-[9px] text-slate-500 mb-0.5">Thời Gian</span>
                                    <span className="font-bold text-white">{m.date} {m.time}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-slate-500 mb-0.5">Loại Sân</span>
                                    <span className="font-bold text-white">Sân {m.type || 7} người</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="block text-[9px] text-slate-500 mb-0.5">Địa Điểm / Tên Sân</span>
                                    <span className="font-bold text-cyan-400">{v ? v.name : (m.district || 'Chưa chọn')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Teams Info */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Đội Tạo Kèo (A)</span>
                                  <div className="w-10 h-10 rounded-full bg-appDark-card mx-auto mb-2 flex items-center justify-center text-sm font-black text-white border border-slate-600">
                                    {(m.teamName || 'A')[0]}
                                  </div>
                                  <span className="block text-xs font-extrabold text-white truncate">{m.teamName || 'Chưa có tên'}</span>
                                  <span className="block text-[10px] text-cyan-400 font-mono mt-1">{m.phone}</span>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Đối Thủ (B)</span>
                                  <div className="w-10 h-10 rounded-full bg-appDark-card mx-auto mb-2 flex items-center justify-center text-sm font-black text-slate-500 border border-slate-600">
                                    {m.opponentName ? m.opponentName[0] : '?'}
                                  </div>
                                  <span className={\`block text-xs font-extrabold truncate \${m.opponentName ? 'text-white' : 'text-slate-500'}\`}>
                                    {m.opponentName || 'Chưa chốt đối'}
                                  </span>
                                  <span className="block text-[10px] text-cyan-400 font-mono mt-1">{m.opponentPhone || '...'}</span>
                                </div>
                              </div>

                              {/* Requests List */}
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-l-2 border-blue-500 pl-2">Danh sách yêu cầu ghép ({m.requests?.length || 0})</h4>
                                <div className="bg-appDark-deep rounded-xl border border-appDark-border p-2 space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                  {!m.requests || m.requests.length === 0 ? (
                                    <div className="text-center text-[10px] text-slate-500 py-3">Chưa có đội nào gửi yêu cầu</div>
                                  ) : (
                                    m.requests.map((r, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 bg-appDark-card rounded-lg border border-slate-700/50">
                                        <div>
                                          <span className="block text-xs font-bold text-white">{r.teamName}</span>
                                          <span className="block text-[9px] text-slate-400">{r.phone}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded">Pending</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Admin Actions Box */}
                              <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3">
                                <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <span>⚡</span> Action Xử Lý Kèo
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => {
                                      if(window.confirm('Xác nhận kèo này ĐÃ HOÀN THÀNH?')) {
                                        setMatches(matches.map(match => match.id === m.id ? { ...match, status: 'Hoàn thành' } : match));
                                        setModalType(null);
                                      }
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg p-2 text-[10px] font-bold transition-all text-left flex items-center justify-between"
                                  >
                                    <span>Đánh dấu Hoàn thành</span>
                                    <span>✓</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const reason = window.prompt("Nhập lý do hủy kèo (sẽ gửi thông báo cho 2 đội):");
                                      if (reason) {
                                        setMatches(matches.map(match => match.id === m.id ? { ...match, status: 'Đã hủy', cancelReason: reason } : match));
                                        setModalType(null);
                                      }
                                    }}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg p-2 text-[10px] font-bold transition-all text-left flex items-center justify-between"
                                  >
                                    <span>Hủy Kèo</span>
                                    <span>✗</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const rep = window.prompt("Nhập nội dung Report (Boom kèo, spam...):");
                                      if (rep) {
                                        setMatches(matches.map(match => match.id === m.id ? { ...match, hasComplaint: true, complaintNote: rep } : match));
                                        setModalType(null);
                                      }
                                    }}
                                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg p-2 text-[10px] font-bold transition-all text-left flex items-center justify-between"
                                  >
                                    <span>Đánh dấu Report</span>
                                    <span>⚠️</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      alert(\`Thông tin liên hệ ẩn:\\nĐội A: \${m.phone}\\nĐội B: \${m.opponentPhone || 'Chưa có'}\`);
                                    }}
                                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg p-2 text-[10px] font-bold transition-all text-left flex items-center justify-between"
                                  >
                                    <span>Mở khóa Liên Hệ</span>
                                    <span>🔓</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      )
                    })()}
`;

const newCode = code.slice(0, startIndex) + newTab2Code + '\n' + code.slice(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log("Successfully replaced Tab 2 QL_KÈO block in App.jsx");
