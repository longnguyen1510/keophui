const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update Metrics
const oldMetrics = `<div className="bg-appDark-card border border-neon-green/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
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
                    </div>`;

const newMetrics = `<div className="bg-appDark-card border border-neon-green/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-neon-green/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-neon-green drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">{ownerDashboardData.metrics.empty}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Trống</span>
                    </div>
                    <div className="bg-appDark-card border border-red-500/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">{ownerDashboardData.metrics.booked}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Đã chốt</span>
                    </div>
                    <div className="bg-appDark-card border border-amber-400/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/10 rounded-full blur-xl"></div>
                      <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse">{ownerDashboardData.metrics.pending}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Giữ chỗ</span>
                    </div>`;

code = code.replace(oldMetrics, newMetrics);

// 2. Update Grid
const oldGridStart = `                  {[
                    { group: 'Sân 5 người', venues: [
                      { name: '5A', slots: [{ time: '17:00', status: 'Trống', type: 'empty' }, { time: '18:30', status: 'Có người hỏi', type: 'pending' }, { time: '20:00', status: 'Đã chốt', type: 'booked' }] },
                      { name: '5B', slots: [{ time: '17:00', status: 'Đang ghép đội', type: 'matching' }, { time: '18:30', status: 'Đã chốt', type: 'booked' }, { time: '20:00', status: 'Trống', type: 'empty' }] },
                      { name: '5C', slots: [{ time: '17:00', status: 'Trống', type: 'empty' }, { time: '19:00', status: 'Đã huỷ', type: 'canceled' }] }
                    ]},
                    { group: 'Sân 7 người', venues: [
                      { name: '7A', slots: [{ time: '17:30', status: 'Đã chốt', type: 'booked' }, { time: '19:00', status: 'Chờ cọc', type: 'deposit' }] },
                      { name: '7B', slots: [{ time: '18:00', status: 'Trống', type: 'empty' }, { time: '20:00', status: 'Có người hỏi', type: 'pending' }] }
                    ]}
                  ].map(group => (`;
const newGridStart = `                  {ownerDashboardData.subVenuesList.map(group => (`;

code = code.replace(oldGridStart, newGridStart);

fs.writeFileSync('src/App.jsx', code);
console.log("Render patched");
