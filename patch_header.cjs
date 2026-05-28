const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetRegex = /<header className="glass-header px-4 py-3 flex items-center justify-between border-b border-appDark-border\/30">[\s\S]*?<\/header>/;

const newHeader = `<header className="glass-header px-3 py-2 flex items-center justify-between border-b border-appDark-border/30">
                <div className="flex items-center gap-2" onClick={() => resetFilters()}>
                  <img src="./image/logo1.png" alt="Kèo Phủi" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer" />
                  <div>
                    <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-neon-green bg-clip-text text-transparent cursor-pointer">
                      KÈO PHỦI
                    </h1>
                    <p className="text-[9px] text-neon-green font-semibold tracking-wider uppercase -mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse inline-block"></span>
                      Chợ kèo bóng realtime
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative">
                  {currentUser ? (
                    <div className="relative">
                      <div 
                        onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)} 
                        className="flex items-center gap-2 bg-appDark-card px-2 py-1.5 rounded-xl border border-appDark-border cursor-pointer hover:border-neon-green transition-all"
                      >
                        <div className="w-6 h-6 rounded-full bg-neon-yellow text-appDark-deep flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-start pr-1">
                          <span className="text-[11px] font-bold max-w-[80px] truncate text-slate-200 leading-tight">{currentUser.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold leading-tight flex items-center gap-1">
                            {activeRoleMode === "admin" ? "👑 Admin" : activeRoleMode === "chủ sân" ? "🏟️ Chủ sân" : "⚽ Cầu thủ"} ▼
                          </span>
                        </div>
                      </div>
                      
                      {isHeaderMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)}></div>
                          <div className="absolute right-0 top-full mt-2 w-44 bg-appDark-card border border-appDark-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                            <div className="flex flex-col p-1">
                              <button 
                                onClick={() => { setActiveRoleMode("cầu thủ"); setCurrentTab("toi"); setIsHeaderMenuOpen(false); }}
                                className={\`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all \${activeRoleMode === "cầu thủ" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}\`}
                              >
                                ⚽ Chế độ cầu thủ
                              </button>
                              {availableRoles.includes("chủ sân") && (
                                <button 
                                  onClick={() => { setActiveRoleMode("chủ sân"); setCurrentTab("owner_tong_quan"); setIsHeaderMenuOpen(false); }}
                                  className={\`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all \${activeRoleMode === "chủ sân" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}\`}
                                >
                                  🏟️ Chế độ chủ sân
                                </button>
                              )}
                              {availableRoles.includes("admin") && (
                                <button 
                                  onClick={() => { setActiveRoleMode("admin"); setCurrentTab("admin_tong_quan"); setIsHeaderMenuOpen(false); }}
                                  className={\`flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg transition-all \${activeRoleMode === "admin" ? "bg-neon-green/20 text-neon-green" : "text-slate-300 hover:bg-appDark-deep"}\`}
                                >
                                  👑 Chế độ admin
                                </button>
                              )}
                              <div className="h-px bg-appDark-border/50 my-1 mx-2"></div>
                              <button 
                                onClick={() => { 
                                  setIsHeaderMenuOpen(false);
                                  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                                    setCurrentUser(null);
                                    localStorage.removeItem('user');
                                    setCurrentTab('keo');
                                  }
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                🚪 Đăng xuất
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCurrentTab("toi")} 
                      className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-neon-yellow to-amber-400 text-appDark-deep rounded-xl hover:scale-105 transition-all shadow-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Đăng nhập
                    </button>
                  )}
                </div>
              </header>`;

code = code.replace(targetRegex, newHeader);

fs.writeFileSync('src/App.jsx', code);
console.log("Header replaced");
