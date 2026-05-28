const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const uiTarget = `                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
                      {['Hôm nay', 'Ngày mai', 'Tuỳ chọn thời gian'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setActiveDateFilter(f)}
                          className={\`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all \${
                            activeDateFilter === f ? 'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-appDark-card text-slate-500 border border-appDark-border/50 hover:text-slate-300'
                          }\`}
                        >
                          {f}
                        </button>
                      ))}
                      {activeDateFilter === 'Tuỳ chọn thời gian' && (
                        <input
                          type="date"
                          value={activeCustomDate}
                          onChange={(e) => setActiveCustomDate(e.target.value)}
                          className="bg-appDark-deep border border-indigo-500/50 text-slate-200 text-[10px] font-bold rounded p-1 focus:outline-none focus:border-indigo-400"
                        />
                      )}
                    </div>`;

const uiReplacement = `                    <div className="flex gap-2 items-center w-full">
                      <div className="relative flex-1">
                        <select 
                          value={activeDateFilter}
                          onChange={(e) => setActiveDateFilter(e.target.value)}
                          className="w-full appearance-none bg-appDark-card border border-appDark-border/50 text-slate-300 text-[11px] font-bold rounded-lg p-2 pl-3 focus:outline-none focus:border-indigo-500 shadow-sm"
                        >
                          <option value="Tất cả">Thời gian: Tất cả</option>
                          <option value="Hôm nay">Thời gian: Hôm nay</option>
                          <option value="Ngày mai">Thời gian: Ngày mai</option>
                          <option value="Tuỳ chọn">Thời gian: Tuỳ chọn</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                      {(activeDateFilter === 'Tuỳ chọn thời gian' || activeDateFilter === 'Tuỳ chọn') && (
                        <input
                          type="date"
                          value={activeCustomDate}
                          onChange={(e) => setActiveCustomDate(e.target.value)}
                          className="flex-1 bg-appDark-deep border border-indigo-500/50 text-slate-200 text-[11px] font-bold rounded-lg p-2 focus:outline-none focus:border-indigo-400"
                        />
                      )}
                    </div>`;

code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("UI patched");
