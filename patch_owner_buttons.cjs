const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetBtn = `                  {/* Main Action Button */}
                  <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="text-lg">🏟️</span> Đăng Giờ Sân Trống (Thanh Lý)
                  </button>`;

const replacementBtn = `                  {/* Main Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-[11px] rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight">
                      <span className="text-xl">🏟️</span> 
                      <span>Đăng Sân Trống</span>
                    </button>
                    <button onClick={() => triggerActionWithAuth('owner_create_match')} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-[11px] rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex flex-col items-center justify-center gap-1 leading-tight">
                      <span className="text-xl">🔥</span> 
                      <span>Đăng Kèo Tìm Đối</span>
                    </button>
                  </div>`;

code = code.replace(targetBtn, replacementBtn);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched Owner Booking UI Buttons");
