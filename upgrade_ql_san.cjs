const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines in file: ${lines.length}`);

// Strategy: 
// 1. Find line "// ADMIN SYSTEM DASHBOARD" (around line 7944)
// 2. Find the next line with "<div className=\"space-y-5 pb-6\">" (line 7945)
// 3. After that div opening, wrap the existing admin content in a condition:
//    {currentTab !== "admin_ql_san" && (<> ... existing content ... </>)}
// 4. Add the QL SÂN block after that

// Actually, simpler approach:
// Find the admin header card line and wrap everything in the admin block with a condition
// Then insert QL SÂN block

// Step 1: Find "// ADMIN SYSTEM DASHBOARD"
let adminDashboardLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// ADMIN SYSTEM DASHBOARD')) {
    adminDashboardLine = i;
    break;
  }
}

if (adminDashboardLine === -1) {
  console.error('ERROR: Could not find "// ADMIN SYSTEM DASHBOARD"');
  process.exit(1);
}
console.log(`Found ADMIN SYSTEM DASHBOARD at line ${adminDashboardLine + 1}`);

// Step 2: Find the "{/* Admin Header Card */}" line after it
let adminHeaderLine = -1;
for (let i = adminDashboardLine; i < lines.length; i++) {
  if (lines[i].includes('Admin Header Card')) {
    adminHeaderLine = i;
    break;
  }
}

if (adminHeaderLine === -1) {
  console.error('ERROR: Could not find Admin Header Card');
  process.exit(1);
}
console.log(`Found Admin Header Card at line ${adminHeaderLine + 1}`);

// Step 3: Find the closing of admin block: "                </div>" followed by ") : ("
let adminCloseDiv = -1;
for (let i = adminHeaderLine; i < lines.length; i++) {
  if (lines[i].trim() === '</div>' && i + 1 < lines.length && lines[i + 1].includes(') : (')) {
    adminCloseDiv = i;
    break;
  }
}

if (adminCloseDiv === -1) {
  console.error('ERROR: Could not find admin block closing div');
  process.exit(1);
}
console.log(`Found admin block closing at line ${adminCloseDiv + 1} ("${lines[adminCloseDiv].trim()}" followed by "${lines[adminCloseDiv + 1].trim()}")`);

// Now build the new content:
// Before adminHeaderLine, insert: {currentTab !== "admin_ql_san" && (<>
// Before adminCloseDiv, insert: </>)}
// Then add the QL SÂN block

const qlSanBlock = `
                    {/* ═══════════════════════════════════════════════ */}
                    {/* TAB 4: QUẢN LÝ SÂN - FULL UPGRADE */}
                    {/* ═══════════════════════════════════════════════ */}
                    {currentTab === "admin_ql_san" && (
                      <div className="space-y-4 animate-fade-in text-left">

                        {/* ═══════ HEADER ═══════ */}
                        <div className="flex justify-between items-center border-b border-appDark-border/30 pb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neon-green flex items-center gap-2">
                            🏟️ Quản Lý Sân & Slot
                          </h4>
                          <span className="text-[10px] bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded text-neon-green font-bold">
                            Tổng: {venues.length} cụm sân
                          </span>
                        </div>

                        {/* ═══════ KPI METRICS GRID ═══════ */}
                        {(() => {
                          const verifiedVenues = venues.filter(v => v.verification_status === "verified");
                          const allSlots = slots || [];
                          const now = new Date();
                          const startOfWeek = new Date(now);
                          startOfWeek.setDate(now.getDate() - now.getDay());
                          startOfWeek.setHours(0,0,0,0);
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 7);
                          
                          const weekSlots = allSlots.filter(s => {
                            try {
                              const parts = (s.date || "").split("/");
                              if (parts.length === 3) {
                                const slotDate = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
                                return slotDate >= startOfWeek && slotDate < endOfWeek;
                              }
                            } catch(e) {}
                            return false;
                          });
                          const totalWeekSlots = weekSlots.length || allSlots.length;
                          const bookedSlots = allSlots.filter(s => s.status === "booked" || s.bookedBy);
                          const bookedWeekSlots = weekSlots.filter(s => s.status === "booked" || s.bookedBy);
                          const fillRate = totalWeekSlots > 0 ? ((bookedWeekSlots.length / totalWeekSlots) * 100).toFixed(1) : "0.0";
                          const revenue = bookedSlots.reduce((sum, s) => sum + (parseInt(String(s.price || "0").replace(/\\D/g, "")) || 0), 0);
                          const commission = bookedSlots.length * 50000;

                          const kpis = [
                            { label: "Tổng sân", value: venues.length, icon: "🏟️", color: "text-cyan-400", bg: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/20" },
                            { label: "Sân active", value: verifiedVenues.length, icon: "🟢", color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
                            { label: "Slot tuần này", value: totalWeekSlots, icon: "📅", color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20" },
                            { label: "Slot filled", value: bookedWeekSlots.length, icon: "✅", color: "text-green-400", bg: "from-green-500/10 to-green-600/5", border: "border-green-500/20" },
                            { label: "Fill Rate", value: fillRate + "%", icon: "📊", color: "text-purple-400", bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20" },
                            { label: "Doanh thu App", value: (revenue / 1000000).toFixed(1) + "M", icon: "💰", color: "text-neon-yellow", bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
                            { label: "Hoa hồng DK", value: (commission / 1000000).toFixed(1) + "M", icon: "🏦", color: "text-orange-400", bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20" },
                          ];

                          return (
                            <div className="grid grid-cols-4 gap-1.5">
                              {kpis.map((k, i) => (
                                <div key={i} className={\`bg-gradient-to-br \${k.bg} border \${k.border} rounded-xl p-2 flex flex-col items-center justify-center text-center backdrop-blur-sm\`}>
                                  <span className="text-sm mb-0.5">{k.icon}</span>
                                  <span className={\`text-sm font-black \${k.color}\`}>{k.value}</span>
                                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">{k.label}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* ═══════ SUB-TAB NAVIGATION ═══════ */}
                        <div className="flex gap-1 bg-appDark-deep/60 rounded-xl p-1 border border-appDark-border/30">
                          {[
                            { key: "venues", label: "🏢 Danh sách Sân" },
                            { key: "registrations", label: "⌛ Duyệt Chủ Sân" },
                            { key: "slots", label: "📅 Lịch Slot" },
                          ].map(tab => (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setAdminVenueSubTab(tab.key)}
                              className={\`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 \${
                                adminVenueSubTab === tab.key
                                  ? "bg-gradient-to-r from-neon-green/20 to-emerald-500/10 text-neon-green border border-neon-green/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                  : "text-slate-400 hover:text-slate-300 hover:bg-appDark-card/50"
                              }\`}
                            >
                              {tab.label}
                              {tab.key === "registrations" && venues.filter(v => v.verification_status === "pending_verification").length > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[8px] font-black bg-red-500 text-white rounded-full animate-pulse">
                                  {venues.filter(v => v.verification_status === "pending_verification").length}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* ═══════ SUB-TAB 1: VENUE LIST ═══════ */}
                        {adminVenueSubTab === "venues" && (
                          <div className="space-y-3">
                            {/* Search */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Tìm kiếm sân theo tên, quận, địa chỉ..."
                                value={adminVenueSearch}
                                onChange={(e) => setAdminVenueSearch(e.target.value)}
                                className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-neon-green transition-all"
                              />
                              <span className="absolute left-2.5 top-2.5 text-xs text-slate-500">🔍</span>
                              {adminVenueSearch && (
                                <button onClick={() => setAdminVenueSearch("")} className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-black">✕</button>
                              )}
                            </div>

                            {/* Venue Cards */}
                            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar">
                              {(() => {
                                const allSlots = slots || [];
                                const filteredVenues = venues.filter(v => {
                                  const s = adminVenueSearch.toLowerCase();
                                  return (v.name || "").toLowerCase().includes(s) ||
                                    (v.district || "").toLowerCase().includes(s) ||
                                    (v.address || "").toLowerCase().includes(s);
                                });

                                if (filteredVenues.length === 0) {
                                  return (
                                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-8 text-center text-xs text-slate-400">
                                      Không tìm thấy cụm sân nào.
                                    </div>
                                  );
                                }

                                return filteredVenues.map(v => {
                                  const ownerUser = users.find(u => u.id === v.owner_user_id) || { name: "Chủ sân", phone: v.phone };
                                  const venueFields = (fields || []).filter(f => f.venueId === v.id);
                                  const venueFieldIds = venueFields.map(f => f.fieldId);
                                  const venueSlots = allSlots.filter(s => venueFieldIds.includes(s.fieldId));
                                  const bookedVSlots = venueSlots.filter(s => s.status === "booked" || s.bookedBy);
                                  const vFillRate = venueSlots.length > 0 ? ((bookedVSlots.length / venueSlots.length) * 100).toFixed(0) : "0";
                                  const vRevenue = bookedVSlots.reduce((sum, s) => sum + (parseInt(String(s.price || "0").replace(/\\D/g, "")) || 0), 0);
                                  const vCommission = bookedVSlots.length * 50000;

                                  const isVerified = v.verification_status === "verified";
                                  const isPending = v.verification_status === "pending_verification";
                                  const isRejected = v.verification_status === "rejected";

                                  const badgeConfig = isVerified
                                    ? { text: "🟢 Verified", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
                                    : isPending
                                    ? { text: "🟡 Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
                                    : isRejected
                                    ? { text: "🔴 Rejected", cls: "bg-red-500/10 text-red-400 border-red-500/20" }
                                    : { text: "⚫ Inactive", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" };

                                  return (
                                    <div key={v.id} className="bg-appDark-card border border-appDark-border/60 rounded-xl p-3 space-y-2 text-xs hover:border-neon-green/30 transition-all">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-0.5 flex-1 min-w-0">
                                          <h6 className="font-extrabold text-white flex items-center gap-1.5 flex-wrap">
                                            🏟️ {v.name}
                                            <span className={\`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border \${badgeConfig.cls}\`}>
                                              {badgeConfig.text}
                                            </span>
                                          </h6>
                                          <p className="text-[10px] text-slate-400">
                                            👤 <strong className="text-slate-300">{ownerUser.name}</strong> • 📞 <strong className="text-neon-green">{v.phone || ownerUser.phone}</strong>
                                          </p>
                                          <p className="text-[10px] text-slate-500">📍 {v.district} — {v.address}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextStatus = isVerified ? "rejected" : "verified";
                                              setVenues(prev => prev.map(x => x.id === v.id ? { ...x, verification_status: nextStatus } : x));
                                            }}
                                            className={\`text-[8px] font-bold px-2 py-1 rounded transition-all border \${isVerified ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border-red-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/20'}\`}
                                          >
                                            {isVerified ? "Ngưng HĐ" : "Kích Hoạt"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm(\`Xóa vĩnh viễn cụm sân "\${v.name}"?\`)) {
                                                setVenues(prev => prev.filter(x => x.id !== v.id));
                                              }
                                            }}
                                            className="text-[8px] font-bold bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/30 px-2 py-1 rounded transition-all"
                                          >
                                            Xóa
                                          </button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-appDark-border/20">
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Slot đăng</div>
                                          <div className="text-[11px] font-black text-cyan-400">{venueSlots.length}</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Booked</div>
                                          <div className="text-[11px] font-black text-emerald-400">{bookedVSlots.length}</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Fill Rate</div>
                                          <div className={\`text-[11px] font-black \${parseInt(vFillRate) >= 60 ? "text-emerald-400" : parseInt(vFillRate) >= 30 ? "text-amber-400" : "text-red-400"}\`}>{vFillRate}%</div>
                                        </div>
                                        <div className="bg-appDark-deep/50 rounded-lg p-1.5 text-center">
                                          <div className="text-[8px] text-slate-500 font-bold uppercase">Doanh thu</div>
                                          <div className="text-[11px] font-black text-neon-yellow">{(vRevenue / 1000).toFixed(0)}K</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
                                        <span>⭐ {v.rating || "N/A"}</span>
                                        <span>🏦 Hoa hồng: {(vCommission / 1000).toFixed(0)}K</span>
                                        <span>📏 {venueFields.length} sân con</span>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        )}

                        {/* ═══════ SUB-TAB 2: VENUE OWNER APPROVAL ═══════ */}
                        {adminVenueSubTab === "registrations" && (
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-neon-yellow uppercase tracking-wider flex items-center gap-1.5">
                              ⌛ YÊU CẦU ĐĂNG KÝ LÀM CHỦ SÂN ({venues.filter(v => v.verification_status === "pending_verification").length})
                            </h5>

                            {venues.filter(v => v.verification_status === "pending_verification").length === 0 ? (
                              <div className="bg-appDark-card border border-appDark-border rounded-xl p-8 text-center space-y-2">
                                <p className="text-2xl">✅</p>
                                <p className="text-xs text-slate-400 font-semibold">Không có yêu cầu duyệt sân nào đang chờ.</p>
                                <p className="text-[10px] text-slate-500">Tất cả yêu cầu đã được xử lý.</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar">
                                {venues.filter(v => v.verification_status === "pending_verification").map((v) => {
                                  const ownerUser = users.find(u => u.id === v.owner_user_id) || { name: "Người dùng ẩn", phone: v.phone };
                                  return (
                                    <div key={v.id} className="bg-appDark-card border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 text-xs shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1 flex-1">
                                          <h6 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                            🏟️ {v.name}
                                            <span className="text-[7px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                                              CHỜ DUYỆT
                                            </span>
                                          </h6>
                                          <p className="text-[10px] text-slate-400">👤 Chủ sân: <strong className="text-slate-200">{ownerUser.name}</strong></p>
                                          <p className="text-[10px] text-slate-400">📞 SĐT: <strong className="text-neon-green">{v.phone || ownerUser.phone}</strong></p>
                                          <p className="text-[10px] text-slate-400">📍 Khu vực: <strong className="text-slate-300">{v.district}</strong></p>
                                          <p className="text-[10px] text-slate-500">🗺️ {v.address}</p>
                                          {v.notes && (
                                            <p className="text-[10px] text-amber-400/70 italic bg-amber-500/5 rounded-lg px-2 py-1 border border-amber-500/10">
                                              💬 "{v.notes}"
                                            </p>
                                          )}
                                        </div>
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                                          🏗️
                                        </div>
                                      </div>

                                      {v.amenities && v.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {v.amenities.slice(0, 5).map((a, ai) => (
                                            <span key={ai} className="text-[8px] bg-appDark-deep/60 border border-appDark-border/30 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">
                                              {a}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      <div className="flex gap-2 pt-2 border-t border-appDark-border/20">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setVenues(prev => prev.map(x => x.id === v.id ? { ...x, verification_status: "verified" } : x));
                                            const ownerPhone = v.phone || ownerUser.phone;
                                            if (ownerPhone && !pitchOwners.includes(ownerPhone)) {
                                              setPitchOwners(prev => [...prev, ownerPhone]);
                                            }
                                            alert(\`✅ Đã phê duyệt sân "\${v.name}" và cấp quyền CHỦ SÂN cho số \${ownerPhone}!\`);
                                          }}
                                          className="flex-1 font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2 rounded-lg text-[10px] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                                        >
                                          ✓ Phê Duyệt
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(\`Từ chối yêu cầu của sân "\${v.name}"?\`)) {
                                              setVenues(prev => prev.map(x => x.id === v.id ? { ...x, verification_status: "rejected" } : x));
                                            }
                                          }}
                                          className="font-bold bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-lg text-[10px] uppercase border border-red-500/30 transition-all"
                                        >
                                          Từ Chối
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => alert(\`📋 CHI TIẾT SÂN: \${v.name}\\n📍 Địa chỉ: \${v.address}\\n📞 SĐT: \${v.phone || ownerUser.phone}\\n🏢 Quận: \${v.district}\\n⭐ Rating: \${v.rating || "Chưa có"}\\n📝 Ghi chú: \${v.notes || "Không có"}\\n🎯 Tiện ích: \${(v.amenities || []).join(", ")}\`)}
                                          className="font-bold bg-appDark-deep hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-[10px] uppercase border border-appDark-border/50 transition-all"
                                        >
                                          🔍
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ═══════ SUB-TAB 3: SLOT DIRECTORY ═══════ */}
                        {adminVenueSubTab === "slots" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-1.5">
                              <select
                                value={adminSlotFilterVenue}
                                onChange={(e) => setAdminSlotFilterVenue(e.target.value)}
                                className="text-[10px] bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-green appearance-none"
                              >
                                <option value="all">🏟️ Tất cả sân</option>
                                {venues.filter(v => v.verification_status === "verified").map(v => (
                                  <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                              </select>
                              <select
                                value={adminSlotFilterStatus}
                                onChange={(e) => setAdminSlotFilterStatus(e.target.value)}
                                className="text-[10px] bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-green appearance-none"
                              >
                                <option value="all">📊 Tất cả TT</option>
                                <option value="available">🟢 Available</option>
                                <option value="on_hold">🟡 On Hold</option>
                                <option value="booked">🔵 Booked</option>
                                <option value="expired">⚫ Expired</option>
                                <option value="cancelled">🔴 Cancelled</option>
                              </select>
                              <input
                                type="date"
                                value={adminSlotFilterDate}
                                onChange={(e) => setAdminSlotFilterDate(e.target.value)}
                                className="text-[10px] bg-appDark-deep border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-green"
                              />
                            </div>

                            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto no-scrollbar">
                              {(() => {
                                const allSlots = slots || [];
                                const allFields = fields || [];
                                
                                let filtered = [...allSlots];

                                if (adminSlotFilterVenue !== "all") {
                                  const vFields = allFields.filter(f => f.venueId === adminSlotFilterVenue).map(f => f.fieldId);
                                  filtered = filtered.filter(s => vFields.includes(s.fieldId));
                                }

                                if (adminSlotFilterStatus !== "all") {
                                  filtered = filtered.filter(s => {
                                    const slotStatus = s.status || (s.bookedBy ? "booked" : "available");
                                    return slotStatus === adminSlotFilterStatus;
                                  });
                                }

                                if (adminSlotFilterDate) {
                                  const [y, m, d] = adminSlotFilterDate.split("-");
                                  const filterDateStr = d + "/" + m + "/" + y;
                                  filtered = filtered.filter(s => s.date === filterDateStr);
                                }

                                if (filtered.length === 0) {
                                  return (
                                    <div className="bg-appDark-card border border-appDark-border rounded-xl p-8 text-center text-xs text-slate-400">
                                      Không có slot nào phù hợp bộ lọc.
                                    </div>
                                  );
                                }

                                return filtered.slice(0, 50).map((s, si) => {
                                  const slotField = allFields.find(f => f.fieldId === s.fieldId) || {};
                                  const slotVenue = venues.find(v => v.id === slotField.venueId) || {};
                                  const slotStatus = s.status || (s.bookedBy ? "booked" : "available");
                                  
                                  const statusBadge = {
                                    available: { text: "Available", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
                                    on_hold: { text: "On Hold", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
                                    booked: { text: "Booked", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                                    expired: { text: "Expired", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
                                    cancelled: { text: "Cancelled", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
                                  }[slotStatus] || { text: slotStatus, cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" };

                                  return (
                                    <div
                                      key={s.id || si}
                                      onClick={() => setAdminSelectedSlotForDetail(s)}
                                      className="bg-appDark-card border border-appDark-border/50 rounded-lg p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:border-neon-green/40 hover:bg-appDark-card/80 transition-all active:scale-[0.99]"
                                    >
                                      <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-white text-[11px]">{slotField.fieldName || s.fieldId}</span>
                                          <span className="text-[8px] text-slate-500 font-semibold">• {slotVenue.name || "—"}</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 flex items-center gap-2 flex-wrap">
                                          <span>📅 {s.date}</span>
                                          <span>⏰ {s.time}</span>
                                          <span>📏 {slotField.fieldType || s.pitchType || "—"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[10px] font-black text-neon-yellow">{s.price || "—"}</span>
                                        <span className={\`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border \${statusBadge.cls}\`}>
                                          {statusBadge.text}
                                        </span>
                                        {s.confirmedPlayed && <span className="text-[9px]" title="Trận đã diễn ra">✅</span>}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>

                            <p className="text-[9px] text-slate-500 text-center font-semibold">
                              Hiển thị tối đa 50 slot • Tổng slot hệ thống: {(slots || []).length}
                            </p>
                          </div>
                        )}

                        {/* ═══════ SLOT DETAIL MODAL ═══════ */}
                        {adminSelectedSlotForDetail && (() => {
                          const s = adminSelectedSlotForDetail;
                          const allFields = fields || [];
                          const slotField = allFields.find(f => f.fieldId === s.fieldId) || {};
                          const slotVenue = venues.find(v => v.id === slotField.venueId) || {};
                          const slotStatus = s.status || (s.bookedBy ? "booked" : "available");

                          return (
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-end justify-center animate-fade-in" onClick={() => setAdminSelectedSlotForDetail(null)}>
                              <div
                                className="bg-appDark-card border-t border-l border-r border-neon-green/30 rounded-t-2xl w-full max-w-md p-4 space-y-3 max-h-[80vh] overflow-y-auto no-scrollbar animate-slide-up"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-between items-center pb-2 border-b border-appDark-border/30">
                                  <h5 className="text-xs font-black text-neon-green uppercase tracking-wider flex items-center gap-1.5">
                                    ⚙️ CHI TIẾT & TÁC VỤ SLOT
                                  </h5>
                                  <button onClick={() => setAdminSelectedSlotForDetail(null)} className="text-slate-400 hover:text-white text-sm font-black transition-all">✕</button>
                                </div>

                                <div className="bg-appDark-deep/60 rounded-xl p-3 space-y-1.5 text-xs border border-appDark-border/30">
                                  <p className="font-extrabold text-white">🏟️ {slotField.fieldName || s.fieldId} — {slotVenue.name || "Sân chưa xác định"}</p>
                                  <p className="text-slate-400">📅 Ngày: <strong className="text-white">{s.date}</strong> • ⏰ Giờ: <strong className="text-white">{s.time}</strong></p>
                                  <p className="text-slate-400">📏 Loại: <strong className="text-cyan-400">{slotField.fieldType || s.pitchType || "—"}</strong> • 💰 Giá: <strong className="text-neon-yellow">{s.price || "—"}</strong></p>
                                  {s.bookedBy && <p className="text-slate-400">👤 Booked bởi: <strong className="text-emerald-400">{s.bookedBy}</strong></p>}
                                  {s.confirmedPlayed && <p className="text-emerald-400 font-bold">✅ Trận đã được xác nhận diễn ra</p>}
                                  {s.internalNotes && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-1">
                                      <p className="text-[9px] text-amber-400/70 font-semibold">📝 Ghi chú nội bộ:</p>
                                      <p className="text-[10px] text-amber-300 italic">{s.internalNotes}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Đổi trạng thái Slot</label>
                                  <select
                                    value={slotStatus}
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      setSlots(prev => prev.map(x => (x.id || x.fieldId + x.date + x.time) === (s.id || s.fieldId + s.date + s.time) ? { ...x, status: newStatus } : x));
                                      setAdminSelectedSlotForDetail({ ...s, status: newStatus });
                                    }}
                                    className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green appearance-none"
                                  >
                                    <option value="available">🟢 Available</option>
                                    <option value="on_hold">🟡 On Hold</option>
                                    <option value="booked">🔵 Booked</option>
                                    <option value="expired">⚫ Expired</option>
                                    <option value="cancelled">🔴 Cancelled</option>
                                  </select>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Ghi chú nội bộ Admin</label>
                                  <textarea
                                    value={s.internalNotes || ""}
                                    onChange={(e) => {
                                      const notes = e.target.value;
                                      setSlots(prev => prev.map(x => (x.id || x.fieldId + x.date + x.time) === (s.id || s.fieldId + s.date + s.time) ? { ...x, internalNotes: notes } : x));
                                      setAdminSelectedSlotForDetail({ ...s, internalNotes: notes });
                                    }}
                                    placeholder='Ví dụ: "Khách đã cọc 100K" hoặc "Hoãn do mưa"...'
                                    className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green resize-none h-16"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-appDark-border/20">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSlots(prev => prev.map(x => (x.id || x.fieldId + x.date + x.time) === (s.id || s.fieldId + s.date + s.time) ? { ...x, confirmedPlayed: true, status: "booked" } : x));
                                      setAdminSelectedSlotForDetail({ ...s, confirmedPlayed: true, status: "booked" });
                                      alert("✅ Đã xác nhận trận đấu đã diễn ra!");
                                    }}
                                    disabled={s.confirmedPlayed}
                                    className={\`font-bold py-2 rounded-lg text-[10px] uppercase transition-all \${s.confirmedPlayed ? "bg-emerald-500/10 text-emerald-400/50 border border-emerald-500/10 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_10px_rgba(16,185,129,0.2)]"}\`}
                                  >
                                    {s.confirmedPlayed ? "✅ Đã xác nhận" : "✅ Xác nhận đã đá"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("Bạn có chắc chắn muốn HỦY slot này?")) {
                                        setSlots(prev => prev.map(x => (x.id || x.fieldId + x.date + x.time) === (s.id || s.fieldId + s.date + s.time) ? { ...x, status: "cancelled" } : x));
                                        setAdminSelectedSlotForDetail({ ...s, status: "cancelled" });
                                      }
                                    }}
                                    className="font-bold bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white py-2 rounded-lg text-[10px] uppercase border border-red-500/30 transition-all"
                                  >
                                    ❌ Hủy Slot
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setAdminSelectedSlotForDetail(null)}
                                  className="w-full text-[10px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-all text-slate-300"
                                >
                                  Đóng ✕
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    )}`;

// Now build the new file
// We need to:
// 1. After the admin header card line (adminHeaderLine), insert a condition to hide existing content when QL SAN is active
// Actually, let's do it differently. Insert the QL SAN block BEFORE the closing </div> of the admin section

// Step: Insert the QL SAN block right before adminCloseDiv
const newLines = [
  ...lines.slice(0, adminCloseDiv),
  '',
  qlSanBlock,
  '',
  ...lines.slice(adminCloseDiv)
];

const newContent = newLines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`SUCCESS: Inserted QL SAN block before line ${adminCloseDiv + 1}.`);
console.log(`New file has ${newContent.split('\n').length} lines.`);
