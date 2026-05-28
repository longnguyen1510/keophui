const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetBtn = `<button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚙️</span>
                          <span className="text-sm font-extrabold text-slate-300">Cài đặt sân</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>`;

const newBtn = `<button onClick={() => setModalType('venue_settings')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚙️</span>
                          <span className="text-sm font-extrabold text-slate-300">Cài đặt sân (Loại sân & Ghép sân)</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>`;

code = code.replace(targetBtn, newBtn);

fs.writeFileSync('src/App.jsx', code);
console.log("Settings button patched");
