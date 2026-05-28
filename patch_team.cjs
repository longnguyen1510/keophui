const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const funcsToInsert = `      // Leave Team
      const leaveTeam = (teamId) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn rời khỏi Đội Bóng này không?")) {
          setTeams(prev => prev.map(t => {
            if (t.id === teamId) {
              return {
                ...t,
                members: t.members.filter(m => m.user_id !== currentUser.id)
              };
            }
            return t;
          }));
          setActiveTeamId(null);
          alert("Bạn đã rời khỏi đội bóng!");
        }
      };

      // Delete Team
      const deleteTeam = (teamId) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN Đội Bóng này không? Mọi thông tin và lịch sử sẽ bị mất!")) {
          setTeams(prev => prev.filter(t => t.id !== teamId));
          setActiveTeamId(null);
          alert("Đã xóa đội bóng thành công!");
        }
      };

      // Remove Member from Team`;

code = code.replace('      // Remove Member from Team', funcsToInsert);

const uiToInsert = `                                    </div>
                                  )}

                                  {/* Team Dangerous Actions */}
                                  {isOwner && (
                                    <button 
                                      type="button"
                                      onClick={() => deleteTeam(t.id)}
                                      className="w-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/30 py-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all mt-4"
                                    >
                                      🗑 XÓA ĐỘI BÓNG
                                    </button>
                                  )}
                                  {!isOwner && myRoleObj?.status === 'joined' && (
                                    <button 
                                      type="button"
                                      onClick={() => leaveTeam(t.id)}
                                      className="w-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/30 py-2.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all mt-4"
                                    >
                                      🚪 RỜI KHỎI ĐỘI
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Nút Nhập Mã (Luôn hiển thị) */}`;

code = code.replace(`                                </div>\n                              );\n                            })()\n                            \n                            {/* Nút Nhập Mã (Luôn hiển thị) */}`, uiToInsert);

fs.writeFileSync('src/App.jsx', code);
console.log("Team logic and buttons inserted");
