const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `<div className="grid grid-cols-4 gap-2">
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
                  </div>`;

const newStr = `<div className="grid grid-cols-3 gap-2">
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
                  </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/App.jsx', code);
  console.log("Metrics updated successfully");
} else {
  console.log("Target string not found");
}
