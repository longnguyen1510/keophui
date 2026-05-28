const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Add EditMatchModal component
  const editModalCode = `
    // 11. FORM: EDIT MATCH
    function EditMatchModal({ match, onClose, onSubmit }) {
      const [timeSlot, setTimeSlot] = useState(match.time || "");
      const [venueName, setVenueName] = useState(match.venue || match.venueName || "");
      const [district, setDistrict] = useState(match.district || "");
      const [price, setPrice] = useState(() => {
        if (!match.price) return "";
        return String(match.price).replace(/\\D/g, '');
      });
      const [needPlayersCount, setNeedPlayersCount] = useState(match.needPlayersCount || match.missingCount || 2);
      const [pitchType, setPitchType] = useState(match.pitchType || "Sân 5");

      const handleFormSubmit = (e) => {
        e.preventDefault();
        let priceNum = parseInt(price) || 0;
        onSubmit({
          time: timeSlot,
          venue: venueName,
          district: district,
          price: priceNum,
          needPlayersCount: parseInt(needPlayersCount) || 2,
          pitchType
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-md bg-appDark-bg border-t border-appDark-border rounded-t-3xl p-5 space-y-4 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">✏️ Chỉnh Sửa Kèo</h3>
              <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Khung giờ đá</label>
                <input type="text" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Khu vực / Quận</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white">
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 7">Quận 7</option>
                  <option value="Quận 10">Quận 10</option>
                  <option value="Thủ Đức">Thủ Đức</option>
                  <option value="Bình Thạnh">Bình Thạnh</option>
                  <option value="Tân Bình">Tân Bình</option>
                  <option value="Gò Vấp">Gò Vấp</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Tên sân bóng</label>
                <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Quy mô sân</label>
                <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white">
                  <option value="Sân 5">Sân 5</option>
                  <option value="Sân 7">Sân 7</option>
                  <option value="Sân 11">Sân 11</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Giá sân (VNĐ)</label>
                <input type="text" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\\D/g, ''))} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Số lượng cần tuyển</label>
                <input type="number" min="1" max="20" value={needPlayersCount} onChange={(e) => setNeedPlayersCount(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2.5 text-white" />
              </div>
            </div>
            <button type="submit" className="w-full font-bold uppercase bg-neon-green text-appDark-deep py-3.5 rounded-xl mt-4">Lưu Thay Đổi</button>
          </form>
        </div>
      );
    }
  `;

  // Insert before function App()
  code = code.replace(`function App() {`, editModalCode + `\nfunction App() {`);

  // 2. Add handleEditMatch function inside App
  const editMatchFunc = `
      const handleEditMatch = (matchId, updatedData) => {
        setMatches(prev => prev.map(m => {
          if (m.id === matchId) {
            return {
              ...m,
              time: updatedData.time,
              venue: updatedData.venue,
              district: updatedData.district,
              price: updatedData.price,
              pitchType: updatedData.pitchType,
              needPlayersCount: updatedData.needPlayersCount
            };
          }
          return m;
        }));
        
        setActivities(prev => [
          {
            id: Date.now(),
            type: 'match_updated',
            title: \`✏️ Bạn vừa cập nhật thông tin kèo đấu.\`,
            time: 'Vừa xong',
            icon: '✏️',
            color: 'text-sky-400 bg-sky-400/10 border-sky-400/20'
          },
          ...prev
        ]);
        setHasUnreadActivities(true);
      };
  `;
  code = code.replace(`const handleCreateMatchFromSlot = (formData) => {`, editMatchFunc + `\n      const handleCreateMatchFromSlot = (formData) => {`);

  // 3. Update MatchDetailModal to have onEditMatch prop and editing state
  code = code.replace(`function MatchDetailModal({ match, currentUser, myTeams, onClose, onJoinMatch, onCancelMatch, onUpdateMatchStatus, onUpdateMatchRequests, onProcessReport }) {`, 
                      `function MatchDetailModal({ match, currentUser, myTeams, onClose, onJoinMatch, onCancelMatch, onUpdateMatchStatus, onUpdateMatchRequests, onProcessReport, onEditMatch }) {\n      const [showEditModal, setShowEditModal] = useState(false);`);

  // 4. Update the actions bottom bar
  const oldActionBtns = `<div className="flex gap-2 w-full mt-2">
              <a 
                href={\`tel:\${match.adminContact}\`} 
                onClick={(e) => {
                  if (!isOwner && (!myRequest || myRequest.status !== 'accepted')) {
                    e.preventDefault();
                    alert("🔒 Số điện thoại liên hệ của đội bóng sẽ được hiển thị sau khi yêu cầu của bạn được chấp nhận (Accepted)!");
                  }
                }}
                className={\`\${(canCancel || showCancelRequest) ? 'w-1/2' : 'w-1/3'} text-center text-xs font-bold uppercase tracking-wider bg-appDark-card border border-appDark-border text-slate-200 py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5\`}
              >
                📞 Gọi Admin
              </a>

              {canCancel ? (
                <button 
                  onClick={() => onCancelMatch && onCancelMatch(match.id)}
                  className="w-1/2 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                >
                  ❌ Hủy Trận
                </button>
              ) : showCancelRequest ? (`;

  const newActionBtns = `<div className="flex gap-2 w-full mt-2">
              {!isOwner && (
                <a 
                  href={\`tel:\${match.adminContact}\`} 
                  onClick={(e) => {
                    if (!myRequest || myRequest.status !== 'accepted') {
                      e.preventDefault();
                      alert("🔒 Số điện thoại liên hệ của đội bóng sẽ được hiển thị sau khi yêu cầu của bạn được chấp nhận (Accepted)!");
                    }
                  }}
                  className={\`\${showCancelRequest ? 'w-1/2' : 'w-1/3'} text-center text-xs font-bold uppercase tracking-wider bg-appDark-card border border-appDark-border text-slate-200 py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5\`}
                >
                  📞 Gọi Admin
                </a>
              )}

              {isOwner ? (
                <>
                  <button 
                    onClick={() => {
                      if (!match.rawDate || !match.time) {
                        setShowEditModal(true);
                        return;
                      }
                      
                      // Check if within 60 mins
                      // match.time format is "HH:mm - HH:mm (Hôm nay)"
                      const timeMatch = match.time.match(/(\\d{1,2}):(\\d{2})/);
                      if (timeMatch && match.rawDate) {
                        const matchDate = new Date(match.rawDate);
                        matchDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                        const diffMs = matchDate.getTime() - Date.now();
                        const diffMins = Math.floor(diffMs / 60000);
                        
                        if (diffMins > 0 && diffMins <= 60) {
                          alert("⏳ Trận đấu sắp diễn ra (dưới 60 phút). Bạn không thể thay đổi thông tin lúc này, chỉ có thể Hủy kèo.");
                          return;
                        }
                      }
                      setShowEditModal(true);
                    }}
                    className="flex-1 font-bold uppercase tracking-wider bg-appDark-deep text-neon-yellow border border-neon-yellow/30 py-3.5 rounded-xl hover:bg-neon-yellow/10 transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    ✏️ Sửa Kèo
                  </button>
                  <button 
                    onClick={() => onCancelMatch && onCancelMatch(match.id)}
                    className="flex-1 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                  >
                    ❌ Hủy Trận
                  </button>
                </>
              ) : showCancelRequest ? (`;
              
  code = code.replace(oldActionBtns, newActionBtns);

  // 5. Add rendering of EditMatchModal inside MatchDetailModal
  const oldModalEnd = `          </div>
        </div>
      );
    }`;
  const newModalEnd = `          </div>
          
          {showEditModal && (
            <EditMatchModal 
              match={match} 
              onClose={() => setShowEditModal(false)}
              onSubmit={(data) => {
                onEditMatch && onEditMatch(match.id, data);
                setShowEditModal(false);
              }}
            />
          )}
        </div>
      );
    }`;
  code = code.replace(oldModalEnd, newModalEnd);

  // 6. Pass onEditMatch prop from App down to MatchDetailModal
  code = code.replace(/<MatchDetailModal([\s\S]*?)onProcessReport={handleProcessReport}/g, `<MatchDetailModal$1onProcessReport={handleProcessReport}\n                  onEditMatch={handleEditMatch}`);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Edit match feature integrated.");
} catch(e) {
  console.error(e);
}
