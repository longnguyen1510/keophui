const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `{(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan")) && (`;
const newTargetStr = `{(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san")) && (`;

const newTabContent = `            {/* TAB CONTENT: OWNER QUẢN LÝ SÂN (REALTIME CONTROL CENTER) */}
            {currentTab === "owner_ql_san" && (
              <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative pb-4">
                
                {/* Header Dashboard Metrics (Sticky) */}
                <div className="sticky top-0 z-30 bg-appDark-bg/95 backdrop-blur-md border-b border-appDark-border p-3 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                      <span className="text-xl">📡</span> Control Center
                    </h2>
                    <span className="text-[9px] font-black tracking-widest text-appDark-deep bg-neon-green px-2 py-0.5 rounded-full uppercase shadow-[0_0_8px_#10b981] animate-pulse">
                      Live
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-appDark-card border border-neon-green/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-neon-green/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-neon-green drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">4</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Trống</span>
                    </div>
                    <div className="bg-appDark-card border border-red-500/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">8</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Đã chốt</span>
                    </div>
                    <div className="bg-appDark-card border border-amber-400/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse">2</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Hỏi slot</span>
                    </div>
                    <div className="bg-appDark-card border border-cyan-400/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/10 rounded-full blur-xl"></div>
                      <span className="text-sm font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] mt-1 mb-0.5">1.5M</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Doanh thu</span>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Tất cả', 'Sân 5', 'Sân 7', 'Sân 11'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setActivePitchFilter(f)}
                        className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all \${
                          activePitchFilter === f ? 'bg-neon-green text-appDark-deep shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-appDark-card text-slate-400 border border-appDark-border hover:text-slate-200 hover:border-slate-600'
                        }\`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Venues Grid Content */}
                <div className="p-4">
                  {[
                    { group: 'Sân 5 người', venues: [
                      { name: '5A', slots: [{ time: '17:00', status: 'Trống', type: 'empty' }, { time: '18:30', status: 'Có người hỏi', type: 'pending' }, { time: '20:00', status: 'Đã chốt', type: 'booked' }] },
                      { name: '5B', slots: [{ time: '17:00', status: 'Đang ghép đội', type: 'matching' }, { time: '18:30', status: 'Đã chốt', type: 'booked' }, { time: '20:00', status: 'Trống', type: 'empty' }] },
                      { name: '5C', slots: [{ time: '17:00', status: 'Trống', type: 'empty' }, { time: '19:00', status: 'Đã huỷ', type: 'canceled' }] }
                    ]},
                    { group: 'Sân 7 người', venues: [
                      { name: '7A', slots: [{ time: '17:30', status: 'Đã chốt', type: 'booked' }, { time: '19:00', status: 'Chờ cọc', type: 'deposit' }] },
                      { name: '7B', slots: [{ time: '18:00', status: 'Trống', type: 'empty' }, { time: '20:00', status: 'Có người hỏi', type: 'pending' }] }
                    ]}
                  ].map(group => (
                    (activePitchFilter === 'Tất cả' || activePitchFilter === group.group.replace(' người', '')) && (
                      <div key={group.group} className="space-y-3 mb-6 animate-fade-in-up">
                        <h3 className="text-xs font-black text-white border-l-2 border-neon-green pl-2 tracking-wide uppercase">{group.group}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {group.venues.map(v => (
                              <div key={v.name} className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-xl p-3 shadow-md flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                                <span className="font-black text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b border-appDark-border/50 pb-1.5 mb-0.5 relative z-10 flex items-center justify-between">
                                  {v.name}
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <div className="flex flex-col gap-1.5 relative z-10">
                                  {v.slots.map(s => (
                                      <div 
                                        key={s.time} 
                                        onClick={() => setSelectedVenueSlot({ venueName: v.name, groupName: group.group, ...s })}
                                        className="flex items-center justify-between bg-black/40 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all border border-transparent hover:border-slate-600 active:scale-95 shadow-inner"
                                      >
                                        <span className="text-[11px] font-extrabold text-slate-200">{s.time}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className={\`w-1.5 h-1.5 rounded-full \${
                                            s.type === 'empty' ? 'bg-neon-green shadow-[0_0_5px_#10b981]' :
                                            s.type === 'pending' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]' :
                                            s.type === 'matching' ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' :
                                            s.type === 'booked' ? 'bg-red-500' :
                                            s.type === 'canceled' ? 'bg-slate-500' :
                                            'bg-purple-400'
                                          }\`}></span>
                                          <span className={\`text-[9px] font-black uppercase tracking-tighter \${
                                            s.type === 'empty' ? 'text-neon-green' :
                                            s.type === 'pending' ? 'text-amber-400' :
                                            s.type === 'matching' ? 'text-cyan-400' :
                                            s.type === 'booked' ? 'text-red-500' :
                                            s.type === 'canceled' ? 'text-slate-400' :
                                            'text-purple-400'
                                          }\`}>{s.status}</span>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Slot Action Modal Popup */}
                {selectedVenueSlot && (
                  <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={() => setSelectedVenueSlot(null)}></div>
                    <div className="bg-appDark-bg w-full sm:w-96 rounded-t-3xl sm:rounded-3xl border-t sm:border border-appDark-border p-5 relative z-10 animate-slide-up sm:animate-fade-in-up pb-10 sm:pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-start mb-5 pb-4 border-b border-appDark-border/50">
                        <div>
                           <h3 className="text-xl font-black text-white leading-tight flex items-center gap-2">
                             Sân {selectedVenueSlot.venueName} 
                             <span className="text-slate-500 text-sm">|</span> 
                             <span className="text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md">{selectedVenueSlot.time}</span>
                           </h3>
                           <p className="text-xs font-bold uppercase mt-2 text-slate-400 flex items-center gap-1.5">
                             Trạng thái: 
                             <span className={\`\${
                                selectedVenueSlot.type === 'empty' ? 'text-neon-green' :
                                selectedVenueSlot.type === 'pending' ? 'text-amber-400' :
                                selectedVenueSlot.type === 'matching' ? 'text-cyan-400' :
                                selectedVenueSlot.type === 'booked' ? 'text-red-500' :
                                selectedVenueSlot.type === 'canceled' ? 'text-slate-400' :
                                'text-purple-400'
                             }\`}>{selectedVenueSlot.status}</span>
                           </p>
                        </div>
                        <button onClick={() => setSelectedVenueSlot(null)} className="p-1.5 rounded-full bg-appDark-card text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-appDark-border">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        <button className="w-full py-3.5 bg-gradient-to-r from-neon-green/10 to-emerald-500/5 border border-neon-green/40 text-neon-green hover:bg-neon-green/20 font-black text-sm rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          Đăng Sân Trống
                        </button>
                        <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20 font-black text-sm rounded-xl transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] flex items-center justify-center gap-2">
                          <span className="text-base">⚡</span> Ghép Đội Ngay
                        </button>
                        <button className="w-full py-3.5 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-400/40 text-amber-400 hover:bg-amber-500/20 font-black text-sm rounded-xl transition-all shadow-[0_0_10px_rgba(251,191,36,0.1)] flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          Xác Nhận Booking
                        </button>
                        <button className="w-full py-3.5 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/5 border border-purple-400/40 text-purple-400 hover:bg-purple-500/20 font-black text-sm rounded-xl transition-all shadow-[0_0_10px_rgba(192,132,252,0.1)] flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Xem Đội Quan Tâm
                        </button>
                        
                        <div className="pt-2">
                          <button className="w-full py-3.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            HUỶ SLOT (ĐÓNG SÂN)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            )}
`;

code = code.replace(targetStr, newTabContent + '\n            ' + newTargetStr);

fs.writeFileSync('src/App.jsx', code);
console.log("Control Center injected");
