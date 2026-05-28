const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStart = `<h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Khung giờ đã đăng (3)</h4>`;
const targetEnd = `                  </div>\n                </div>\n\n              </main>`;

const startIndex = code.indexOf(targetStart);
if (startIndex !== -1) {
  const endIndex = code.indexOf(targetEnd, startIndex);
  if (endIndex !== -1) {
    const newContent = `<h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Khung giờ đã đăng ({slots.length + matches.filter(m => m.status === 'Đã chốt kèo').length})</h4>
                    <div className="flex gap-2">
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Trạng thái</option>
                      </select>
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Loại sân</option>
                      </select>
                    </div>
                  </div>

                  {/* Slot Cards List */}
                  <div className="space-y-3">
                    {slots.map(slot => (
                      <div key={slot.id} className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-extrabold text-white">{slot.timeSlot}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{slot.price} | {slot.pitchType}</span>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                            <button onClick={() => setSlots(slots.filter(s => s.id !== slot.id))} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">Xóa</button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {matches.filter(m => m.status === 'Đã chốt kèo').map(m => (
                      <div key={m.id} className="bg-appDark-card border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-extrabold text-white">{m.time}</span>
                          <span className="text-[10px] font-semibold text-amber-400">Mã: {m.id} | {m.teamName} vs {m.pairedWith}</span>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="px-3 py-1 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(16,185,129,0.1)]">ĐÃ CHỐT</span>
                        </div>
                      </div>
                    ))}
`;
    code = code.substring(0, startIndex) + newContent + code.substring(endIndex);
    fs.writeFileSync('src/App.jsx', code);
    console.log("Dynamic mapping updated successfully");
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
