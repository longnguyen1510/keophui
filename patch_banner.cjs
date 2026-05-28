const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const bannerCode = `                {/* VENUE OWNER REGISTRATION BANNER */}
                {(() => {
                  const myVenue = venues.find(v => v.owner_user_id === currentUser?.id);
                  if (!myVenue && !isVenueOwnerGlobal) {
                    return (
                      <div 
                        className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group mb-4"
                        style={{
                          backgroundImage: "url('./image/soccer_field_banner_bg.png')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center 60%'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10"></div>
                        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl group-hover:scale-110 transition-all duration-700 z-10"></div>
                        
                        <div className="relative z-20 space-y-1 max-w-[70%] text-left">
                          <span className="inline-block text-[9px] font-black tracking-widest text-appDark-deep bg-gradient-to-r from-sky-400 to-blue-500 px-2 py-0.5 rounded-full uppercase shadow-[0_0_8px_#38BDF8]">
                            HỢP TÁC CHỦ SÂN
                          </span>
                          <h2 className="text-xs font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            BẠN SỞ HỮU SÂN BÓNG CỎ NHÂN TẠO?
                          </h2>
                          <p className="text-[9.5px] text-slate-300 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-snug">
                            Hãy đăng ký vai trò Chủ Sân để đăng tin bán giờ trống, slot ưu đãi cho các đội bóng!
                          </p>
                        </div>
                        
                        <div className="relative z-20 shrink-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-sky-400/30 rounded-xl p-2.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all duration-350"
                            onClick={() => triggerActionWithAuth('venue_registration')}>
                          <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase text-center leading-tight">Đăng<br/>Ký Ngay</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}`;

// Insert into currentTab === "san"
const sanRegex = /(<main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">)/;
code = code.replace(sanRegex, `$1\n${bannerCode}\n`);

// Insert into currentTab === "toi"
const toiRegex = /(\{\/\* User Intro Card & Quick Actions \*\/})/;
code = code.replace(toiRegex, `${bannerCode}\n                    $1`);

fs.writeFileSync('src/App.jsx', code);
console.log("Banner injected");
