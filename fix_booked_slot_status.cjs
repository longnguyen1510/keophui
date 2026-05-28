const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetRender = `                          {slot.status === 'on_hold' ? (
                            <span className="px-3 py-1 border border-amber-500/50 text-amber-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(245,158,11,0.15)]">ĐANG TÌM ĐỐI</span>
                          ) : (
                            <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          )}
                          <div className="flex gap-2">
                            {slot.status !== 'on_hold' && (
                              <button onClick={() => triggerActionWithAuth('edit_slot', slot)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                            )}`;

const replacementRender = `                          {slot.status === 'on_hold' ? (
                            <span className="px-3 py-1 border border-amber-500/50 text-amber-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(245,158,11,0.15)]">ĐANG TÌM ĐỐI</span>
                          ) : slot.status === 'booked' ? (
                            <span className="px-3 py-1 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(16,185,129,0.1)]">ĐÃ CHỐT</span>
                          ) : (
                            <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          )}
                          <div className="flex gap-2">
                            {slot.status !== 'on_hold' && slot.status !== 'booked' && (
                              <button onClick={() => triggerActionWithAuth('edit_slot', slot)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                            )}`;

code = code.replace(targetRender, replacementRender);

fs.writeFileSync('src/App.jsx', code);
console.log("Booked slot status badge fixed");
