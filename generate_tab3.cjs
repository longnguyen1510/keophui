const fs = require('fs');

let tab3 = `
                    {/* TAB 3: QUẢN LÝ USER */}
                    {currentTab === "admin_ql_user" && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <div className="flex justify-between items-center border-b border-appDark-border/50 pb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neon-green">
                            👥 Quản Lý Người Dùng
                          </h4>
                          <span className="text-[10px] bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded text-neon-green font-bold">
                            Tổng: {users.length} Users
                          </span>
                        </div>

                        {/* Fast Upgrade Form */}
                        <div className="bg-gradient-to-r from-emerald-900/40 to-appDark-card border border-emerald-500/30 rounded-xl p-3 flex gap-2 items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                            ⚡
                          </div>
                          <input 
                            type="text" 
                            id="fastUpgradePhone"
                            placeholder="Nhập SĐT cấp quyền Chủ Sân..." 
                            className="flex-1 bg-appDark-deep border border-appDark-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <button 
                            onClick={() => {
                              const phone = document.getElementById("fastUpgradePhone").value;
                              if (!phone) return alert("Vui lòng nhập SĐT");
                              const userToUpgrade = users.find(u => u.phone === phone);
                              if (userToUpgrade) {
                                if (window.confirm(\`Cấp quyền CHỦ SÂN cho \${userToUpgrade.name || phone}?\`)) {
                                  const newUsers = users.map(u => u.phone === phone ? { ...u, role: 'chủ sân' } : u);
                                  setUsers(newUsers);
                                  document.getElementById("fastUpgradePhone").value = "";
                                  alert("Thành công!");
                                }
                              } else {
                                alert("Không tìm thấy người dùng có SĐT này!");
                              }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all shrink-0 whitespace-nowrap"
                          >
                            Duyệt Nhanh
                          </button>
                        </div>

                        {/* Search User */}
                        <div className="bg-appDark-deep p-3 rounded-xl border border-appDark-border">
                          <input 
                            type="text" 
                            id="adminUserSearchInput"
                            placeholder="Tìm kiếm theo Tên, SĐT, Vai trò..." 
                            className="w-full bg-appDark-card border border-appDark-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-green focus:outline-none transition-all"
                            onInput={(e) => {
                               const searchTerm = e.target.value.toLowerCase();
                               const cards = document.querySelectorAll('.admin-user-card');
                               cards.forEach(card => {
                                 const text = card.getAttribute('data-search').toLowerCase();
                                 if (text.includes(searchTerm)) {
                                   card.style.display = 'flex';
                                 } else {
                                   card.style.display = 'none';
                                 }
                               });
                            }}
                          />
                        </div>

                        {/* User List */}
                        <div className="space-y-3">
                          {users.map(u => {
                            const searchString = \`\${u.name || ''} \${u.phone || ''} \${u.role || 'cầu thủ'} \${u.isAdmin ? 'admin' : ''}\`;
                            
                            let roleBadge = <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Cầu Thủ</span>;
                            if (u.isAdmin) {
                              roleBadge = <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Admin</span>;
                            } else if (u.role === 'chủ sân') {
                              roleBadge = <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Chủ Sân</span>;
                            }

                            return (
                              <div key={u.id} data-search={searchString} className="admin-user-card bg-appDark-card border border-appDark-border rounded-xl p-3 shadow-md flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                                    <span className="text-sm font-bold text-slate-300">
                                      {(u.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-sm text-white truncate">{u.name || 'Người dùng ẩn'}</h5>
                                      {roleBadge}
                                    </div>
                                    <p className="text-[11px] text-cyan-400 font-medium">{u.phone}</p>
                                    {(u.stats?.position || u.stats?.playStyle) && (
                                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                        Vị trí: {u.stats.position} {u.stats.playStyle ? \`- \${u.stats.playStyle}\` : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 shrink-0">
                                  {!u.isAdmin && u.role !== 'chủ sân' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(\`Cấp quyền Chủ Sân cho \${u.name || u.phone}?\`)) {
                                          const newUsers = users.map(user => user.id === u.id ? { ...user, role: 'chủ sân' } : user);
                                          setUsers(newUsers);
                                        }
                                      }}
                                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold transition-all w-24 text-center"
                                    >
                                      Lên Chủ Sân ⇧
                                    </button>
                                  )}
                                  {!u.isAdmin && u.role === 'chủ sân' && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(\`Thu hồi quyền Chủ Sân của \${u.name || u.phone}?\`)) {
                                          const newUsers = users.map(user => user.id === u.id ? { ...user, role: 'cầu thủ' } : user);
                                          setUsers(newUsers);
                                        }
                                      }}
                                      className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[9px] font-bold transition-all w-24 text-center"
                                    >
                                      Hạ Cấp ⇩
                                    </button>
                                  )}
                                  {!u.isAdmin && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(\`Xóa vĩnh viễn tài khoản \${u.name || u.phone}? Không thể khôi phục!\`)) {
                                          const newUsers = users.filter(user => user.id !== u.id);
                                          setUsers(newUsers);
                                        }
                                      }}
                                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded text-[9px] font-bold transition-all w-24 text-center"
                                    >
                                      Xóa Vĩnh Viễn
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
`;
fs.writeFileSync('generated_tab3.js', tab3, 'utf8');
