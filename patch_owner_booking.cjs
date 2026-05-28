const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = \`{(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san")) && (\`;
const newTargetStr = \`{(currentTab === "toi" || currentTab.startsWith("admin_") || (currentTab.startsWith("owner_") && currentTab !== "owner_tong_quan" && currentTab !== "owner_ql_san" && currentTab !== "owner_booking")) && (\`;

const newTabContent = \`            {/* TAB CONTENT: OWNER BOOKING */}
            {currentTab === "owner_booking" && (
              <main className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar">
                
                <div className="bg-appDark-deep border border-appDark-border rounded-xl p-4 shadow-md space-y-4">
                  {/* Header Title */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-cyan-500 text-lg leading-none">•</span>
                    <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Hợp Tác Chủ Sân Bóng</h3>
                  </div>

                  {/* Venue Info Card */}
                  <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-inner flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5"><span className="text-lg">🏟️</span> Sân: CÁ SẤU HOA CÀ</h4>
                      <button className="px-2 py-0.5 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md hover:bg-cyan-500/10 transition-all">
                        XÁC MINH ✓
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Địa chỉ: 123 phạm văn đồng, thủ đức (Thủ Đức)</p>
                  </div>

                  {/* Main Action Button */}
                  <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="text-lg">🏟️</span> Đăng Giờ Sân Trống (Thanh Lý)
                  </button>

                  {/* Filters */}
                  <div className="flex justify-between items-end pt-2">
                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Khung giờ đã đăng (3)</h4>
                    <div className="flex gap-2">
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Trạng thái</option>
                      </select>
                      <select className="bg-appDark-card border border-appDark-border text-slate-300 text-[9px] font-bold rounded p-1 focus:outline-none focus:border-cyan-500">
                        <option>Loại sân</option>
                      </select>
                    </div>
                  </div>

                  {/* Slot Cards List */}
                  <div className="space-y-3">
                    {/* Slot 1 */}
                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-extrabold text-white">17:00 - 18:30 Hôm nay</span>
                        <span className="text-[10px] font-semibold text-slate-400">500.000đ | Sân 5</span>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                          <button className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">Xóa</button>
                        </div>
                      </div>
                    </div>

                    {/* Slot 2 */}
                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-extrabold text-white">17:30 - 19:00 Hôm nay</span>
                        <span className="text-[10px] font-semibold text-slate-400">400.000đ | Sân 5</span>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="px-3 py-1 border border-cyan-500/50 text-cyan-400 text-[9px] font-extrabold rounded-md shadow-[0_0_8px_rgba(34,211,238,0.15)]">ĐANG TRỐNG</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded transition-all">Sửa</button>
                          <button className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-bold rounded transition-all">Xóa</button>
                        </div>
                      </div>
                    </div>

                    {/* Slot 3 */}
                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-extrabold text-white">20:18 - 20:20 Hôm nay</span>
                        <span className="text-[10px] font-semibold text-amber-400">Mã: M_1779 | FC A1K26</span>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="px-3 py-1 border border-cyan-500/30 text-cyan-500/70 text-[9px] font-extrabold rounded-md">HOÀN THÀNH</span>
                      </div>
                    </div>
                  </div>
                </div>

              </main>
            )}
\`;

code = code.replace(targetStr, newTabContent + '\n            ' + newTargetStr);

fs.writeFileSync('src/App.jsx', code);
console.log("Booking logic injected");
