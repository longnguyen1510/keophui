const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix the stats box
const targetStatsBox = `                    <div className="bg-appDark-card border border-amber-400/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse">{ownerDashboardData.metrics.pending}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Giữ chỗ</span>
                    </div>`;

const replacementStatsBox = `                    <div className="bg-appDark-card border border-cyan-400/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse">{ownerDashboardData.metrics.pending}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Chờ ghép đội</span>
                    </div>`;

code = code.replace(targetStatsBox, replacementStatsBox);

// 2. Fix the filter buttons
const targetFilterButtons = `{['Tất cả', 'Trống', 'Giữ chỗ', 'Đã chốt'].map(f => (`;
const replacementFilterButtons = `{['Tất cả', 'Trống', 'Chờ ghép đội', 'Đã chốt'].map(f => (`;

code = code.replace(targetFilterButtons, replacementFilterButtons);

fs.writeFileSync('src/App.jsx', code);
console.log("UI stats and filters updated to Chờ ghép đội");
