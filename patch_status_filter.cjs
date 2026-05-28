const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add state
const stateTarget = `const [activePitchFilter, setActivePitchFilter] = useState("Tất cả");`;
const stateReplacement = `const [activePitchFilter, setActivePitchFilter] = useState("Tất cả");
      const [activeStatusFilter, setActiveStatusFilter] = useState("Tất cả");`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add UI for status filter
const uiTarget = `                  {/* Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Tất cả', 'Sân 5', 'Sân 7', 'Sân 11'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setActivePitchFilter(f)}
                        className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all \${
                          activePitchFilter === f ? 'bg-neon-green text-appDark-deep shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-appDark-card text-slate-400 border border-appDark-border hover:text-slate-200 hover:border-slate-600'
                        }\`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>`;
const uiReplacement = `                  {/* Filter Tabs */}
                  <div className="flex flex-col gap-2 pb-1">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {['Tất cả', 'Sân 5', 'Sân 7', 'Sân 11'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setActivePitchFilter(f)}
                          className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all \${
                            activePitchFilter === f ? 'bg-neon-green text-appDark-deep shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-appDark-card text-slate-400 border border-appDark-border hover:text-slate-200 hover:border-slate-600'
                          }\`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
                    </div>
                  </div>`;
code = code.replace(uiTarget, uiReplacement);

// 3. Filter slots
const filterTarget = `                                <div className="flex flex-col gap-1.5 relative z-10">
                                  {v.slots.map(s => (`;
const filterReplacement = `                                <div className="flex flex-col gap-1.5 relative z-10">
                                  {v.slots.filter(s => activeStatusFilter === 'Tất cả' || s.status === activeStatusFilter).map(s => (`;
code = code.replace(filterTarget, filterReplacement);

// Hide empty sub-venues
const venueMapTarget = `{group.venues.map(v => (`;
const venueMapReplacement = `{group.venues.filter(v => activeStatusFilter === 'Tất cả' || v.slots.some(s => s.status === activeStatusFilter)).map(v => (`;
code = code.replace(venueMapTarget, venueMapReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Status filter added");
