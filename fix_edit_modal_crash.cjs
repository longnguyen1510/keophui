const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Fix 1: Add showEditModal state
  const oldSignature = `function MatchDetailModal({ match, onClose, currentUser, teams = [], onAction, onRequestHandler, onCancelMatch, onCancelRequest, onAttendanceAction }) {`;
  const newSignature = `function MatchDetailModal({ match, onClose, currentUser, teams = [], onAction, onRequestHandler, onCancelMatch, onCancelRequest, onAttendanceAction, onEditMatch }) {
      const [showEditModal, setShowEditModal] = useState(false);`;
  code = code.replace(oldSignature, newSignature);

  // Fix 2: Find the exact Cancel button to replace with Edit + Cancel
  // First, find the 'canCancel' button.
  const oldActionBtns = `{canCancel ? (
                <button 
                  onClick={() => onCancelMatch && onCancelMatch(match.id)}
                  className="w-1/2 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                >
                  ❌ Hủy Trận
                </button>
              ) : showCancelRequest ? (`;
              
  const newActionBtns = `{isOwner ? (
                <>
                  <button 
                    onClick={() => {
                      if (!match.rawDate || !match.time) {
                        setShowEditModal(true);
                        return;
                      }
                      
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
              ) : canCancel ? (
                <button 
                  onClick={() => onCancelMatch && onCancelMatch(match.id)}
                  className="w-1/2 font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md neon-glow-red text-xs flex items-center justify-center gap-1.5"
                >
                  ❌ Hủy Trận
                </button>
              ) : showCancelRequest ? (`;
              
  code = code.replace(oldActionBtns, newActionBtns);

  // Pass onEditMatch when MatchDetailModal is rendered in App
  code = code.replace(/onCancelMatch=\{handleCancelMatch\}/g, `onCancelMatch={handleCancelMatch}\n                  onEditMatch={handleEditMatch}`);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed MatchDetailModal crash and added buttons.");
} catch(e) {
  console.error(e);
}
