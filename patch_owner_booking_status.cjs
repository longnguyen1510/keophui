const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `<div className="flex flex-col gap-2 items-end">
                          <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          <div className="flex gap-2">
                            <button onClick={() => triggerActionWithAuth('edit_slot', slot)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                            <button onClick={() => setSlots(slots.filter(s => s.id !== slot.id))} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">Xóa</button>
                          </div>
                        </div>`;

const replaceStr = `<div className="flex flex-col gap-2 items-end">
                          {slot.status === 'on_hold' ? (
                            <span className="px-3 py-1 border border-amber-500/50 text-amber-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(245,158,11,0.15)]">GIỮ CHỖ (40p)</span>
                          ) : (
                            <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                          )}
                          <div className="flex gap-2">
                            {slot.status !== 'on_hold' && (
                              <button onClick={() => triggerActionWithAuth('edit_slot', slot)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                            )}
                            <button onClick={() => setSlots(slots.filter(s => s.id !== slot.id))} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">
                              {slot.status === 'on_hold' ? 'Hủy kèo' : 'Xóa'}
                            </button>
                          </div>
                        </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Status update hooked up successfully");
} else {
  console.log("Target not found");
}
