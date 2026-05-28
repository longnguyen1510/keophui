const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Button 1: Create Slot
const targetBtn = `<button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="text-lg">🏟️</span> Đăng Giờ Sân Trống (Thanh Lý)
                  </button>`;
const newBtn = `<button onClick={() => triggerActionWithAuth('create_slot')} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="text-lg">🏟️</span> Đăng Giờ Sân Trống (Thanh Lý)
                  </button>`;

// Button 2: Edit Slot
const targetEditBtn = `<button className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>`;
const newEditBtn = `<button onClick={() => triggerActionWithAuth('edit_slot', slot)} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>`;

if (code.includes(targetBtn) && code.includes(targetEditBtn)) {
  code = code.replace(targetBtn, newBtn);
  code = code.replace(targetEditBtn, newEditBtn);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Buttons hooked up successfully");
} else {
  console.log("Buttons not found");
}
