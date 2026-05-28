const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `<div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quy mô sân</label>
                  <select 
                    value={pitchType} 
                    onChange={(e) => setPitchType(e.target.value)}
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Sân 5">Sân 5 người</option>
                    <option value="Sân 7">Sân 7 người</option>
                    <option value="Sân 11">Sân 11 người</option>
                  </select>
                </div>`;

const target2 = `<div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SĐT Chủ sân / Quản lý</label>
                  <input 
                    type="tel" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)} 
                    required
                    pattern="[0-9]{10}"
                    placeholder="SĐT liên hệ đặt..."
                    className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>`;

code = code.replace(target1, "<!-- SWAP_MARK_1 -->");
code = code.replace(target2, target1);
code = code.replace("<!-- SWAP_MARK_1 -->", target2);

const targetTime = `<div className="flex flex-wrap gap-1 mt-1">
                    {["17:30 - 19:00", "19:00 - 20:30", "20:30 - 22:00", "18:00 - 19:30"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-green/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-neon-green/40 transition-all shrink-0"
                      >
                        {t}
                      </button>
                    ))}
                  </div>`;

const newTime = `<div className="flex flex-wrap gap-1 mt-1">
                    {["05:00 - 06:30", "06:00 - 07:30", "16:00 - 17:30", "17:30 - 19:00", "19:00 - 20:30", "19:30 - 21:00", "20:00 - 21:30", "22:00 - 23:30", "23:00 - 00:30", "00:00 - 01:30"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className="text-[9px] font-bold bg-appDark-deep hover:bg-neon-green/20 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-appDark-border/60 hover:border-neon-green/40 transition-all shrink-0"
                      >
                        {t}
                      </button>
                    ))}
                  </div>`;

code = code.replace(targetTime, newTime);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched Form UI successfully");
