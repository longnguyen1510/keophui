const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');

// The venue block starts at `                    {/* VENUE OWNER MANAGEMENT BLOCK */}`
// and ends at `                  })()}` at line 3008.

const venueStart = code.indexOf('{/* VENUE OWNER MANAGEMENT BLOCK */}');
if (venueStart === -1) throw new Error('Cannot find venue block start');

const venueEndMarker = '                  })()}';
const venueEndIndex = code.indexOf(venueEndMarker, venueStart) + venueEndMarker.length;
const venueBlock = code.substring(venueStart, venueEndIndex);

// Remove the venue block from its current position
let newCode = code.substring(0, venueStart) + code.substring(venueEndIndex);

// Let's also restore the Stats Grid and Quick Actions inside the User Intro Card
const userIntroEnd = newCode.indexOf('</button>\n                      </div>', venueStart - 500);
if (userIntroEnd === -1) throw new Error('Cannot find user intro end');

const afterUserIntro = userIntroEnd + '</button>\n                      </div>'.length;

const statsAndActions = `
                      {/* STATS GRID */}
                      <div className="grid grid-cols-4 gap-2 mb-4 relative z-10">
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Số trận</span>
                          <span className="text-xs font-black text-white">{currentUser.matchCount || 12}</span>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Vị trí</span>
                          <span className="text-xs font-black text-cyan-400">{currentUser.position || 'Tự do'}</span>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Rating</span>
                          <span className="text-xs font-black text-neon-yellow">{currentUser.rating || '4.8'} ⭐</span>
                        </div>
                        <div className="bg-appDark-deep/50 border border-appDark-border rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Hủy kèo</span>
                          <span className="text-xs font-black text-red-400">{currentUser.cancellationRate || '0%'}</span>
                        </div>
                      </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="grid grid-cols-3 gap-3">
                      <button className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-neon-green transition-all group">
                        <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🔥</div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Tạo Kèo</span>
                      </button>
                      <button className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-amber-400 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">⚔️</div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Tìm Đối</span>
                      </button>
                      <button className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-cyan-400 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🏃</div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Tìm Cầu</span>
                      </button>
                    </div>
`;

// Wait, the User Intro Card ends with `</div>` (the one at line 3009 currently).
// By extracting VENUE block, `</div>` is left behind right after `afterUserIntro`.
// So we insert statsAndActions at `afterUserIntro`, which will OVERWRITE the `</div>` if we don't include it.
// Actually, `afterUserIntro` is just after `</button>\n                      </div>`. We need to insert `statsAndActions` there.

newCode = newCode.substring(0, afterUserIntro) + '\n' + statsAndActions + newCode.substring(afterUserIntro);

// Next, insert the VENUE OWNER MANAGEMENT BLOCK at the top of AUTHENTICATED STATE
const authStateMarker = '<div className="space-y-5 pb-6">';
const authStateIndex = newCode.indexOf(authStateMarker) + authStateMarker.length;
if (authStateIndex === -1 + authStateMarker.length) throw new Error('Cannot find auth state');

newCode = newCode.substring(0, authStateIndex) + '\n                    ' + venueBlock + '\n' + newCode.substring(authStateIndex);

// Wait, there's a stray `</div>` that was originally wrapping User Intro + Venue block.
// Since we now closed User Intro Card inside `statsAndActions` (with `</div>`), and Quick Actions is its own block,
// we must remove the old stray `</div>` that was at line 3009.
// But let's check what `statsAndActions` contains. It contains `</div>` for User Intro Card, and then `<div className="grid grid-cols-3 gap-3">...</div>` for Quick Actions.
// The old stray `</div>` will just close `<div className="space-y-5 pb-6">` prematurely? No, it will close it. But `TEAM MEMBERSHIP & MANAGEMENT PANEL` is supposed to be inside `space-y-5 pb-6`.
// Let's replace `</div>\n\n                    {/* TEAM MEMBERSHIP` with just `\n\n                    {/* TEAM MEMBERSHIP`.

newCode = newCode.replace('                    </div>\n\n                    {/* TEAM MEMBERSHIP', '                    {/* TEAM MEMBERSHIP');

fs.writeFileSync('src/App.jsx', newCode, 'utf8');
console.log('Reordering successful');
