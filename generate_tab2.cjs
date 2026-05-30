const fs = require('fs');

let tab2 = `
                    {/* TAB 2: QUẢN LÝ KÈO */}
                    {currentTab === "admin_ql_keo" && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <div className="flex justify-between items-center border-b border-appDark-border/50 pb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neon-green">
                            ⚽ Quản Lý Kèo Đấu
                          </h4>
                          <span className="text-[10px] bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded text-neon-green font-bold">
                            Tổng: {matches.length} kèo
                          </span>
                        </div>

                        {/* Search bar inside render */}
                        <div className="bg-appDark-deep p-3 rounded-xl border border-appDark-border">
                          <input 
                            type="text" 
                            id="adminMatchSearchInput"
                            placeholder="Tìm theo đội bóng, SĐT, quận..." 
                            className="w-full bg-appDark-card border border-appDark-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-green focus:outline-none transition-all"
                            onInput={(e) => {
                               // This is a bit hacky, but avoids adding useState to App.jsx manually
                               // We'll rely on the DOM element for filtering
                               const searchTerm = e.target.value.toLowerCase();
                               const cards = document.querySelectorAll('.admin-match-card');
                               cards.forEach(card => {
                                 const text = card.getAttribute('data-search').toLowerCase();
                                 if (text.includes(searchTerm)) {
                                   card.style.display = 'block';
                                 } else {
                                   card.style.display = 'none';
                                 }
                               });
                            }}
                          />
                        </div>

                        <div className="space-y-3">
                          {matches.slice().reverse().map(m => {
                            const venue = m.venueId ? venues.find(v => v.id === m.venueId) : null;
                            const searchString = \`\${m.teamName || ''} \${m.phone || ''} \${m.district || ''} \${m.status || ''} \${venue ? venue.name : ''}\`;
                            
                            let statusColor = "text-slate-400 bg-slate-400/10 border-slate-400/30";
                            if (m.status === "Cần đối" || m.status === "Thiếu người") statusColor = "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30";
                            if (m.status === "Đã chốt kèo" || m.status === "confirmed" || m.status === "Đã đủ người") statusColor = "text-neon-green bg-neon-green/10 border-neon-green/30";
                            if (m.status === "Đã hủy" || m.status === "cancelled") statusColor = "text-red-400 bg-red-400/10 border-red-400/30";

                            return (
                              <div key={m.id} data-search={searchString} className="admin-match-card bg-appDark-card border border-appDark-border rounded-xl p-4 shadow-md space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                                      {m.teamName || 'Đội chưa đặt tên'}
                                      <span className="text-[10px] text-slate-500 bg-appDark-deep px-1.5 py-0.5 rounded border border-appDark-border font-normal">
                                        ID: {m.id.substring(0,6)}
                                      </span>
                                    </h5>
                                    <p className="text-[11px] text-cyan-400 font-medium mt-0.5">{m.phone}</p>
                                  </div>
                                  <span className={\`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border \${statusColor}\`}>
                                    {m.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                                  <div className="bg-appDark-deep p-1.5 rounded-lg border border-appDark-border/50">
                                    <span className="text-slate-500 block mb-0.5">Thời gian</span>
                                    <span className="font-bold text-white">{m.date} | {m.time}</span>
                                  </div>
                                  <div className="bg-appDark-deep p-1.5 rounded-lg border border-appDark-border/50">
                                    <span className="text-slate-500 block mb-0.5">Địa điểm</span>
                                    <span className="font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                                      {venue ? venue.name : m.district}
                                    </span>
                                  </div>
                                </div>

                                {/* ADMIN ACTIONS */}
                                <div className="pt-2 border-t border-appDark-border/50 flex flex-wrap gap-1.5">
                                  <button 
                                    onClick={() => {
                                      const newMatches = matches.map(match => match.id === m.id ? { ...match, status: 'Cần đối' } : match);
                                      setMatches(newMatches);
                                    }}
                                    className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-bold transition-all"
                                  >
                                    Cần đối
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const newMatches = matches.map(match => match.id === m.id ? { ...match, status: 'Thiếu người' } : match);
                                      setMatches(newMatches);
                                    }}
                                    className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[9px] font-bold transition-all"
                                  >
                                    Thiếu người
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const oppName = window.prompt("Nhập tên đội đối tác đã nhận kèo:");
                                      if (oppName) {
                                        const newMatches = matches.map(match => match.id === m.id ? { ...match, status: 'Đã chốt kèo', opponentName: oppName } : match);
                                        setMatches(newMatches);
                                      }
                                    }}
                                    className="px-2 py-1 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 rounded text-[9px] font-bold transition-all"
                                  >
                                    Chốt đối ✓
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const reason = window.prompt("Nhập lý do hủy kèo:");
                                      if (reason) {
                                        const newMatches = matches.map(match => match.id === m.id ? { ...match, status: 'Đã hủy', cancelReason: reason } : match);
                                        setMatches(newMatches);
                                      }
                                    }}
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-bold transition-all ml-auto"
                                  >
                                    Hủy kèo ✗
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
`;
fs.writeFileSync('generated_tab2.js', tab2, 'utf8');
