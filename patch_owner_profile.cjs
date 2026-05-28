const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove "Hợp Tác Chủ Sân Bóng" from owner_booking
const bookingStart = `                  {/* Header Title */}`;
const bookingEnd = `                  </div>\n\n                  {/* Main Action Button */}`;

const bookingSectionIndex = code.indexOf(bookingStart);
if (bookingSectionIndex !== -1) {
  const bookingEndIndex = code.indexOf(bookingEnd, bookingSectionIndex);
  if (bookingEndIndex !== -1) {
    code = code.substring(0, bookingSectionIndex) + `                  {/* Main Action Button */}` + code.substring(bookingEndIndex + bookingEnd.length);
  }
}

// 2. Define the new owner_tai_khoan block
const newTaiKhoanBlock = `            {/* TAB CONTENT: OWNER TÀI KHOẢN */}
            {currentTab === "owner_tai_khoan" && (
              <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
                
                <div className="space-y-5 pb-6">
                  {/* Venue Verification Header */}
                  <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md space-y-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-cyan-500 text-lg leading-none">•</span>
                      <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Hợp Tác Chủ Sân Bóng</h3>
                    </div>

                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-inner flex flex-col gap-2 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5"><span className="text-lg">🏟️</span> Sân: CÁ SẤU HOA CÀ</h4>
                        <button className="px-2 py-0.5 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md hover:bg-cyan-500/10 transition-all">
                          XÁC MINH ✓
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">Địa chỉ: 123 phạm văn đồng, thủ đức (Thủ Đức)</p>
                    </div>
                  </div>

                  {/* Settings / Other options */}
                  <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-3 border-l-2 border-neon-green pl-2">TÙY CHỌN KHÁC</h4>
                    <div className="space-y-1">
                      <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💳</span>
                          <span className="text-sm font-extrabold text-slate-300">Quản lý doanh thu</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚙️</span>
                          <span className="text-sm font-extrabold text-slate-300">Cài đặt sân</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎧</span>
                          <span className="text-sm font-extrabold text-slate-300">Trợ giúp & Hỗ trợ</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </main>
            )}

            {(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san" && currentTab !== "owner_booking" && currentTab !== "owner_tai_khoan")) && (`;

// 3. Inject it before the generic block
const targetStr = `{(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san" && currentTab !== "owner_booking")) && (`
code = code.replace(targetStr, newTaiKhoanBlock);

fs.writeFileSync('src/App.jsx', code);
console.log("Profile layout updated successfully");
