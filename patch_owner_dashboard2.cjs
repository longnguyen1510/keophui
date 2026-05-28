const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const startMarker = '{/* Business Results Metrics */}';
const endMarker = '</main>';
const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

const newContent = `{/* Business Results Metrics */}
                <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 shadow-lg space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-300">Kết quả kinh doanh</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 relative z-10">Doanh thu</span>
                      <span className="text-xl font-black text-white relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">1.76tr</span>
                    </div>
                    
                    {/* Total Matches */}
                    <div className="bg-gradient-to-br from-neon-green/20 to-emerald-500/10 border border-neon-green/30 rounded-xl p-3 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] font-black text-neon-green uppercase tracking-widest mb-1">Số Trận</span>
                      <span className="text-xl font-black text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">11</span>
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="space-y-3 pt-2 pb-6">
                  <h3 className="text-sm font-extrabold text-slate-300 px-1">Thao tác nhanh</h3>
                  <div className="grid grid-cols-1 gap-3.5">
                    <button 
                      onClick={() => setCurrentTab("owner_ql_san")}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-[13px] tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      ĐĂNG SÂN
                    </button>
                    
                    <button 
                      onClick={() => {
                        setCurrentTab("keo"); 
                        setTimeout(() => triggerActionWithAuth('create_match'), 100);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-[13px] tracking-wider rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl leading-none">⚡</span> GHÉP ĐỘI
                    </button>
                    
                    <button 
                      onClick={() => setCurrentTab("owner_booking")}
                      className="w-full py-4 bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green hover:to-emerald-400 text-appDark-deep font-black text-[13px] tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl leading-none">📅</span> LỊCH HÔM NAY
                    </button>
                  </div>
                </div>
                
              `;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newContent + code.substring(endIndex);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Dashboard simplified successfully!");
} else {
  console.log("Could not find markers!");
}
