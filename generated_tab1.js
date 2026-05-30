                  // ADMIN SYSTEM DASHBOARD
                  <div className="space-y-5 pb-6">
                    {/* Admin Header Card */}
                    <div className="bg-gradient-to-r from-red-950/80 to-appDark-card border border-red-900/30 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 text-white flex items-center justify-center text-xl font-black shadow-md">
                            ⚙️
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white flex items-center gap-1.5 leading-tight">
                              Portal Admin
                              <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">ADMIN</span>
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Xin chào, {currentUser.name}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleLogout} 
                          className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-red-500/30 active:scale-95 transition-all"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="flex items-center justify-between bg-appDark-deep p-1.5 rounded-xl border border-appDark-border">
                      <span className="text-xs font-semibold text-slate-400 pl-2">Xem với tư cách:</span>
                      <div className="flex bg-appDark-card rounded-lg p-0.5">
                        <button 
                          onClick={() => setActiveRoleMode("admin")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                            activeRoleMode === "admin"
                              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Admin
                        </button>
                        <button 
                          onClick={() => setActiveRoleMode("cầu thủ")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                            activeRoleMode === "cầu thủ"
                              ? "bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep shadow-md"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Cầu Thủ
                        </button>
                      </div>
                    </div>

                    {/* TAB 1: TỔNG QUAN */}
                    {(currentTab === "admin_tong_quan" || currentTab === "admin" || !["admin_ql_keo", "admin_ql_user", "admin_ql_san"].includes(currentTab)) && (
                      <div className="space-y-4 animate-fade-in">
                        
                        {/* PENDING NOTIFICATION ALERTS */}
                        {venues.filter(v => v.verification_status === "pending_verification").length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs animate-pulse">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-red-400">🚨 Yêu Cầu Duyệt Chủ Sân Mới!</p>
                              <p className="text-[10px] text-slate-400">
                                Có <strong>{venues.filter(v => v.verification_status === "pending_verification").length} sân bóng</strong> đang chờ xét duyệt quyền đối tác.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentTab("admin_ql_san");
                              }}
                              className="text-[10px] font-black bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all shadow shrink-0"
                            >
                              Xem Ngay ➜
                            </button>
                          </div>
                        )}

                        {/* STATS OVERVIEW */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ghép Thành Công</span>
                            <span className="text-xl font-black text-neon-green">
                              {matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người').length} trận
                            </span>
                          </div>
                          <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hủy / Thất Bại</span>
                            <span className="text-xl font-black text-red-400">
                              {matches.filter(m => m.status === 'Đã hủy').length} trận
                            </span>
                          </div>
                          <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đang Chờ Đối</span>
                            <span className="text-xl font-black text-neon-yellow">
                              {matches.filter(m => m.status === 'Cần đối' || m.status === 'Thiếu người').length} kèo
                            </span>
                          </div>
                          <div className="bg-appDark-card border border-appDark-border rounded-xl p-3 text-center shadow-md">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sân Trống Sẵn Có</span>
                            <span className="text-xl font-black text-cyan-400">
                              {slots.filter(s => s.status === 'available').length} sân
                            </span>
                          </div>
                        </div>

                        {/* LỊCH SỬ GHÉP KÈO */}
                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center border-b border-appDark-border/50 pb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                              <span>📜 Lịch sử ghép kèo</span>
                            </h4>
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase animate-pulse">
                              Realtime
                            </span>
                          </div>

                          {matches.filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người' || m.status === 'Đã hủy').length === 0 ? (
                            <div className="bg-appDark-card border border-appDark-border rounded-xl p-8 text-center text-xs text-slate-400">
                              Chưa có lịch sử ghép kèo thành công hay hủy trận nào.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {matches
                                .filter(m => m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người' || m.status === 'Đã hủy')
                                .sort((a,b) => new Date(b.date || '2000-01-01').getTime() - new Date(a.date || '2000-01-01').getTime())
                                .slice(0, 15)
                                .map(m => {
                                  const isSuccess = m.status === 'Đã chốt kèo' || m.status === 'confirmed' || m.status === 'Đã đủ người';
                                  return (
                                    <div 
                                      key={m.id}
                                      className={`bg-appDark-card border-y border-r border-l-4 rounded-xl p-4 space-y-2 shadow relative overflow-hidden ${
                                        isSuccess 
                                          ? 'border-emerald-500/20 border-l-emerald-500' 
                                          : 'border-red-500/20 border-l-red-500'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-white text-sm">{m.teamName || 'Đội Ẩn'}</span>
                                            {m.opponentName && (
                                              <>
                                                <span className="text-[10px] text-slate-500 italic">vs</span>
                                                <span className="font-bold text-slate-300 text-xs">{m.opponentName}</span>
                                              </>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-400 font-medium">
                                            {m.date || 'Chưa rõ'} | {m.time || 'Chưa rõ'}
                                          </p>
                                          {m.venueId && venues.find(v => v.id === m.venueId) && (
                                            <p className="text-[10px] text-cyan-400">
                                              📍 {venues.find(v => v.id === m.venueId).name}
                                            </p>
                                          )}
                                          {m.district && (
                                            <p className="text-[10px] text-slate-500">
                                              Khu vực: {m.district}
                                            </p>
                                          )}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                          isSuccess
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                                        }`}>
                                          {m.status}
                                        </span>
                                      </div>
                                      
                                      {!isSuccess && m.cancelReason && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mt-2">
                                          <p className="text-[10px] text-red-400 italic">
                                            <span className="font-bold">Lý do hủy:</span> {m.cancelReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
