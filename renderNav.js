      const renderBottomNav = () => {
        if (activeRoleMode === "admin") {
          return (
            <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
              {/* Tab Tổng quan */}
              <button onClick={() => setCurrentTab("admin_tong_quan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_tong_quan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_tong_quan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tổng quan</span>
                {currentTab === "admin_tong_quan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL Kèo */}
              <button onClick={() => setCurrentTab("admin_ql_keo")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_keo" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_keo" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Kèo</span>
                {currentTab === "admin_ql_keo" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL User */}
              <button onClick={() => setCurrentTab("admin_ql_user")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_user" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_user" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL User</span>
                {currentTab === "admin_ql_user" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              {/* Tab QL Sân */}
              <button onClick={() => setCurrentTab("admin_ql_san")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "admin_ql_san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "admin_ql_san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Sân</span>
                {currentTab === "admin_ql_san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>
            </nav>
          );
        }

        if (activeRoleMode === "chủ sân") {
          return (
            <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
              <button onClick={() => setCurrentTab("owner_tong_quan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_tong_quan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_tong_quan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tổng quan</span>
                {currentTab === "owner_tong_quan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_ql_san")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_ql_san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_ql_san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>QL Sân</span>
                {currentTab === "owner_ql_san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_booking")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_booking" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_booking" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Booking</span>
                {currentTab === "owner_booking" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>

              <button onClick={() => setCurrentTab("owner_tai_khoan")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
                <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "owner_tai_khoan" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "owner_tai_khoan" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tài khoản</span>
                {currentTab === "owner_tai_khoan" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
              </button>
            </nav>
          );
        }

        // Cầu thủ
        return (
          <nav className="glass-nav absolute bottom-0 inset-x-0 h-16 flex items-center justify-around z-40 border-t border-appDark-border/80">
            <button onClick={() => { resetFilters(); setCurrentTab("keo"); }} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "keo" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5M5 14l5 5M4 20l2-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5M19 14l-5 5M20 20l-2-2" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "keo" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Kèo</span>
              {currentTab === "keo" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => setCurrentTab("san")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "san" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "san" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Sân</span>
              {currentTab === "san" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => setCurrentTab("doi")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "doi" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "doi" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Đội</span>
              {currentTab === "doi" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>

            <button onClick={() => setCurrentTab("toi")} className="flex flex-col items-center justify-center w-16 h-full transition-all relative group">
              <div className={`p-1 rounded-xl transition-all duration-300 ${currentTab === "toi" ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider transition-all duration-300 ${currentTab === "toi" ? "text-neon-green text-shadow-green scale-105" : "text-slate-500 font-semibold"}`}>Tôi</span>
              {currentTab === "toi" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#10b981] animate-pulse"></div>}
            </button>
          </nav>
        );
      };
