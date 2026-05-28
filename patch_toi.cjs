const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update the outer wrapper
code = code.replace(
  '{currentTab === "toi" && (',
  '{(currentTab === "toi" || currentTab.startsWith("admin_") || currentTab.startsWith("owner_")) && ('
);

// 2. Hide unauthenticated state if not in 'toi' tab
code = code.replace(
  '{/* UNATHENTICATED STATE */}\n                {!currentUser ? (',
  '{/* UNATHENTICATED STATE */}\n                {!currentUser && currentTab === "toi" ? ('
);

// 3. Admin section handling
const adminStart = code.indexOf('{/* ---------------- ADMIN / SUPER ADMIN VIEW ---------------- */}');
const adminEnd = code.indexOf('{/* ---------------- HỢP TÁC CHỦ SÂN BÓNG ---------------- */}');
if (adminStart !== -1 && adminEnd !== -1) {
  let adminBlock = code.substring(adminStart, adminEnd);
  // We need to split adminBlock into the stats, manage, and pitch_owners.
  // Actually, the easiest way is to wrap the whole adminBlock in `currentTab.startsWith("admin_")`
  // AND inside adminBlock, replace `adminSubTab` checks with `currentTab === "admin_ql_keo"` etc.
  adminBlock = adminBlock.replace(
    /currentUser\.roles && currentUser\.roles\.includes\("super_admin"\)/g,
    'currentTab.startsWith("admin_")'
  );
  // Replace the adminSubTab selector with nothing (we use bottom nav now)
  const tabSelectorStart = adminBlock.indexOf('{/* TAB SELECTOR INSIDE ADMIN PANEL */}');
  const tabSelectorEnd = adminBlock.indexOf('{/* TAB CONTENT: Lịch Sử */}');
  if (tabSelectorStart !== -1 && tabSelectorEnd !== -1) {
    adminBlock = adminBlock.substring(0, tabSelectorStart) + adminBlock.substring(tabSelectorEnd);
  }
  
  // Replace adminSubTab === 'history' with currentTab === 'admin_tong_quan'
  adminBlock = adminBlock.replace(/adminSubTab === "history"/g, 'currentTab === "admin_tong_quan"');
  adminBlock = adminBlock.replace(/adminSubTab === "manage"/g, 'currentTab === "admin_ql_keo"');
  adminBlock = adminBlock.replace(/adminSubTab === "pitch_owners"/g, 'currentTab === "admin_ql_san"');
  
  // We also need to add a fake admin_ql_user section
  const endOfAdminBlock = adminBlock.lastIndexOf('</div>');
  const userListBlock = `
                    {/* TAB CONTENT: QL User */}
                    {currentTab === "admin_ql_user" && (
                      <div className="space-y-4">
                        <h4 className="font-extrabold text-sm text-neon-yellow uppercase border-b border-appDark-border/50 pb-2">Danh sách người dùng ({users.length})</h4>
                        {users.map(u => (
                          <div key={u.id} className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-xs">
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-slate-400">SĐT: {u.phone}</p>
                            <p className="text-slate-500 text-[10px]">Roles: {u.roles ? u.roles.join(", ") : "player"}</p>
                          </div>
                        ))}
                      </div>
                    )}
  `;
  adminBlock = adminBlock.substring(0, endOfAdminBlock) + userListBlock + '\n' + adminBlock.substring(endOfAdminBlock);
  
  code = code.substring(0, adminStart) + adminBlock + code.substring(adminEnd);
}

// 4. Venue Owner section handling
const ownerStart = code.indexOf('{/* ---------------- HỢP TÁC CHỦ SÂN BÓNG ---------------- */}');
const ownerEnd = code.indexOf('{/* ---------------- PLAYER SPECIFIC VIEW ---------------- */}');
if (ownerStart !== -1 && ownerEnd !== -1) {
  let ownerBlock = code.substring(ownerStart, ownerEnd);
  // We want to show this block if currentTab starts with "owner_" or if currentTab === "toi" and they are NOT an owner.
  // Wait, if they are NOT an owner, they only have player layout, so they stay in `toi`.
  // They should see the "Đăng ký làm chủ sân" button in `toi`.
  
  // Let's replace the outer condition
  ownerBlock = ownerBlock.replace(
    /<div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 shadow-md space-y-4 relative overflow-hidden">/g,
    `{(currentTab.startsWith("owner_") || (currentTab === "toi" && !isVenueOwnerGlobal)) && (
                      <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 shadow-md space-y-4 relative overflow-hidden">`
  );
  
  // We need to close this new condition at the end of ownerBlock
  const lastDiv = ownerBlock.lastIndexOf('</div>');
  if (lastDiv !== -1) {
    ownerBlock = ownerBlock.substring(0, lastDiv + 6) + '\n                    )}\n';
  }
  
  // Inside owner block, we can conditionally render sub-sections
  // "owner_tong_quan": we can add a basic stat
  // "owner_ql_san": the list of venues
  // "owner_booking": the list of slots
  
  ownerBlock = ownerBlock.replace(
    '{/* My Registered Venues */}',
    `{currentTab === "owner_tong_quan" && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Số sân của tôi</span>
                                    <span className="text-xl font-black text-cyan-400">{myVenues.length}</span>
                                  </div>
                                  <div className="bg-appDark-deep border border-appDark-border rounded-xl p-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Slot đã đăng</span>
                                    <span className="text-xl font-black text-emerald-400">{mySlots.length}</span>
                                  </div>
                                </div>
                              )}
                              {/* My Registered Venues */}`
  );
  
  ownerBlock = ownerBlock.replace(
    /myVenues\.length === 0/g,
    '(currentTab === "owner_ql_san" || currentTab === "toi") && myVenues.length === 0'
  );
  
  ownerBlock = ownerBlock.replace(
    /myVenues\.map\(\(myVenue, idx\)/g,
    '(currentTab === "owner_ql_san" || currentTab === "toi") && myVenues.map((myVenue, idx)'
  );
  
  ownerBlock = ownerBlock.replace(
    /<button\s+type="button"\s+onClick=\{\(\) => triggerActionWithAuth\('create_slot', myVenue\)\}/g,
    '{currentTab === "owner_booking" && <button type="button" onClick={() => triggerActionWithAuth(\'create_slot\', myVenue)}'
  );
  
  ownerBlock = ownerBlock.replace(
    /<div className="space-y-2">\s*\{\(\(\) => \{/g,
    '{currentTab === "owner_booking" && (\n                              <div className="space-y-2">\n                                {(() => {'
  );
  
  ownerBlock = ownerBlock.replace(
    /                                \}\)\(\)\}\n                              <\/div>/g,
    '                                })()}\n                              </div>\n                              )}'
  );

  code = code.substring(0, ownerStart) + ownerBlock + code.substring(ownerEnd);
}

// 5. Player Specific View handling (Tài khoản, Đội bóng, Lịch sử)
const playerStart = code.indexOf('{/* ---------------- PLAYER SPECIFIC VIEW ---------------- */}');
if (playerStart !== -1) {
  let playerBlock = code.substring(playerStart);
  
  // Wrap the entire player specific view to only show if `toi` or `owner_tai_khoan`
  playerBlock = playerBlock.replace(
    '<div className="space-y-6">',
    '{(currentTab === "toi" || currentTab === "owner_tai_khoan") && (\n                    <div className="space-y-6">'
  );
  
  // Close it before the </main>
  const mainEnd = playerBlock.indexOf('</main>');
  if (mainEnd !== -1) {
    playerBlock = playerBlock.substring(0, mainEnd) + '                    )}\n              ' + playerBlock.substring(mainEnd);
  }
  
  code = code.substring(0, playerStart) + playerBlock;
}

fs.writeFileSync('src/App.jsx', code);
console.log("Patched toi tab successfully");
