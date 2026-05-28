const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix the names of the 3 buttons in Owner Booking
const targetButtons = `                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 px-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🏟️</span> 
                      <span>Sân Trống</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 px-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🔥</span> 
                      <span>Tìm Đối</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_book_customer')} className="w-full py-3 px-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-[10px] rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">💼</span> 
                      <span>Khách Đặt</span>
                    </button>
                  </div>`;

const replacementButtons = `                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 px-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🏟️</span> 
                      <span>Đăng Sân Trống</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 px-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">🔥</span> 
                      <span>Đăng Tìm Đối</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_book_customer')} className="w-full py-3 px-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-[9px] sm:text-[10px] rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight text-center">
                      <span className="text-lg">💼</span> 
                      <span>Khách Đã Đặt</span>
                    </button>
                  </div>`;

code = code.replace(targetButtons, replacementButtons);

// 2. Fix the filters in QL Sân
const targetFilters = `                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {['Tất cả', 'Trống', 'Giữ chỗ', 'Đã chốt'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setActiveStatusFilter(f)}
                          className={\`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all \${
                            activeStatusFilter === f ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-appDark-card text-slate-500 border border-appDark-border/50 hover:text-slate-300'
                          }\`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>`;

const replacementFilters = `                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt', 'Khách đặt', 'Giữ chỗ'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setActiveStatusFilter(f)}
                          className={\`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all \${
                            activeStatusFilter === f ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-appDark-card text-slate-500 border border-appDark-border/50 hover:text-slate-300'
                          }\`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>`;

code = code.replace(targetFilters, replacementFilters);

const targetRender = `                  {ownerDashboardData.subVenuesList.map(group => (
                    (activePitchFilter === 'Tất cả' || activePitchFilter === group.group.replace(' người', '')) && (
                      <div key={group.group} className="space-y-3 mb-6 animate-fade-in-up">
                        <h3 className="text-xs font-black text-white border-l-2 border-neon-green pl-2 tracking-wide uppercase">{group.group}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {group.venues.filter(v => activeStatusFilter === 'Tất cả' || v.slots.some(s => s.status === activeStatusFilter)).map(v => (
                              <div key={v.name} className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-xl p-3 shadow-md flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                                <span className="font-black text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b border-appDark-border/50 pb-1.5 mb-0.5 relative z-10 flex items-center justify-between">
                                  {v.name}
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <div className="flex flex-col gap-1.5 relative z-10">
                                  {v.slots.filter(s => activeStatusFilter === 'Tất cả' || s.status === activeStatusFilter).map(s => (`;

const replacementRender = `                  {ownerDashboardData.subVenuesList.map(group => {
                    if (activePitchFilter !== 'Tất cả' && activePitchFilter !== group.group.replace(' người', '')) return null;
                    
                    const filteredVenues = group.venues.map(v => {
                      const filteredSlots = v.slots.filter(s => activeStatusFilter === 'Tất cả' || s.status === activeStatusFilter);
                      return { ...v, slots: filteredSlots };
                    }).filter(v => v.slots.length > 0);
                    
                    if (filteredVenues.length === 0) return null;

                    return (
                      <div key={group.group} className="space-y-3 mb-6 animate-fade-in-up">
                        <h3 className="text-xs font-black text-white border-l-2 border-neon-green pl-2 tracking-wide uppercase">{group.group}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {filteredVenues.map(v => (
                              <div key={v.name} className="bg-gradient-to-b from-appDark-card to-appDark-deep border border-appDark-border/60 rounded-xl p-3 shadow-md flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                                <span className="font-black text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b border-appDark-border/50 pb-1.5 mb-0.5 relative z-10 flex items-center justify-between">
                                  {v.name}
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <div className="flex flex-col gap-1.5 relative z-10">
                                  {v.slots.map(s => (`;

code = code.replace(targetRender, replacementRender);

fs.writeFileSync('src/App.jsx', code);
console.log("Filters and buttons fixed");
