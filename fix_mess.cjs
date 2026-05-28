const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Remove the wrong Venue block start in Keo tab
  const wrongVenueBlockStart = `{/* VENUE OWNER MANAGEMENT BLOCK */}
                    {(() => {
                      const myVenue = venues.find(v => v.owner_user_id === currentUser.id);
                      
                      if (!myVenue) {
                        return (`;

  code = code.replace(wrongVenueBlockStart, '');

  // 2. Remove the stray `); }` at the end of Keo banner
  const strayReturnClose = `                </div>
                        );
                      }

                {/* 1. BỘ LỌC NHANH Ở ĐẦU TRANG */}`;
  code = code.replace(strayReturnClose, `                </div>\n\n                {/* 1. BỘ LỌC NHANH Ở ĐẦU TRANG */}`);

  // 3. Fix the San banner to be inside the Venue block!
  const sanBannerStart = `{/* 0. SOCCER FIELD BANNER */}
                <div 
                  className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group"`;

  const newSanBannerStart = `{/* VENUE OWNER MANAGEMENT BLOCK */}
                {(() => {
                  const myVenue = venues.find(v => v.owner_user_id === currentUser.id);
                  if (!myVenue) {
                    return (
                      <div 
                        className="relative h-28 rounded-2xl overflow-hidden border border-appDark-border shadow-lg flex items-center justify-between p-4 group"`;

  code = code.replace(sanBannerStart, newSanBannerStart);

  // 4. Replace the old small card remnants with the closing of `if (!myVenue) { return ( ... ); }`
  const restSmallCardStr = `                              <div>
                                <h4 className="text-[11px] font-extrabold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wide">Hợp Tác Chủ Sân</h4>
                                <p className="text-[9px] text-slate-400 mt-0.5">Đăng ký đối tác, thanh lý giờ trống</p>
                              </div>
                            </div>
                            <span className="text-cyan-400 text-sm font-bold group-hover:translate-x-1 transition-transform">➔</span>
                          </div>
                        );
                      }`;
  
  const newRestSmallCardStr = `                    );
                  }`;

  code = code.replace(restSmallCardStr, newRestSmallCardStr);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed mess.");

} catch(e) {
  console.error(e);
}
