const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const newComponent = `
    // 17. VENUE SETTINGS MODAL (CÀI ĐẶT SÂN & GHÉP SÂN)
    function VenueSettingsModal({ venue, onClose, onSubmit }) {
      const [cap5, setCap5] = useState(venue?.capacities?.['5'] || 0);
      const [cap7, setCap7] = useState(venue?.capacities?.['7'] || 0);
      const [cap11, setCap11] = useState(venue?.capacities?.['11'] || 0);
      
      const [combinations, setCombinations] = useState(venue?.combinations || []);
      const [newTarget, setNewTarget] = useState('7A');
      const [newParts, setNewParts] = useState('5A, 5B');

      const handleAddCombination = () => {
        if (!newTarget.trim() || !newParts.trim()) return;
        const partsArray = newParts.split(',').map(p => p.trim()).filter(Boolean);
        setCombinations([...combinations, { target: newTarget.trim(), parts: partsArray }]);
        setNewTarget('');
        setNewParts('');
      };

      const handleRemoveCombination = (idx) => {
        setCombinations(combinations.filter((_, i) => i !== idx));
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
          capacities: {
            '5': parseInt(cap5) || 0,
            '7': parseInt(cap7) || 0,
            '11': parseInt(cap11) || 0
          },
          combinations
        });
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={onClose}></div>
          <div className="w-[90%] max-w-sm bg-appDark-bg border border-appDark-border rounded-2xl p-5 space-y-4 relative z-10 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">⚙️ Cài Đặt Sân Bóng</h3>
                <p className="text-[10px] text-slate-400">Sửa số lượng & cấu hình ghép sân</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 border border-appDark-border flex items-center justify-center hover:bg-slate-700 text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-green uppercase border-b border-appDark-border pb-1">1. Số Lượng Sân</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 5</span>
                    <input type="number" min="0" value={cap5} onChange={e => setCap5(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 7</span>
                    <input type="number" min="0" value={cap7} onChange={e => setCap7(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sân 11</span>
                    <input type="number" min="0" value={cap11} onChange={e => setCap11(e.target.value)} className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-2 py-2 text-white focus:outline-none focus:border-neon-green text-center" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-yellow uppercase border-b border-appDark-border pb-1">2. Quy Tắc Ghép Sân</h4>
                <p className="text-[10px] text-slate-400 italic">Ví dụ: Để gộp 2 sân 5 thành 1 sân 7, cấu hình: 7A = 5A, 5B. Hệ thống sẽ khóa 5A và 5B nếu 7A có người đặt.</p>
                
                <div className="bg-appDark-deep p-3 rounded-xl border border-appDark-border space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Sân Đích (Gộp thành)</label>
                      <input type="text" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="VD: 7A" className="w-full text-xs bg-appDark-bg border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-yellow" />
                    </div>
                    <div className="text-slate-400 font-bold mb-2">=</div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Các Sân Con (Cách nhau dấu phẩy)</label>
                      <input type="text" value={newParts} onChange={e => setNewParts(e.target.value)} placeholder="VD: 5A, 5B" className="w-full text-xs bg-appDark-bg border border-appDark-border rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-neon-yellow" />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddCombination} className="w-full py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 hover:bg-slate-700">
                    + Thêm quy tắc
                  </button>
                </div>

                {combinations.length > 0 && (
                  <div className="space-y-1.5 mt-3">
                    {combinations.map((comb, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-appDark-deep px-3 py-2 rounded-lg border border-appDark-border text-xs">
                        <div>
                          <span className="font-extrabold text-neon-yellow">{comb.target}</span> 
                          <span className="text-slate-400 mx-2">=</span> 
                          <span className="font-bold text-slate-300">{comb.parts.join(' + ')}</span>
                        </div>
                        <button onClick={() => handleRemoveCombination(idx)} className="text-red-400 hover:text-red-300 font-bold">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleFormSubmit} className="w-full font-bold bg-gradient-to-r from-neon-green to-emerald-500 text-appDark-deep py-2.5 rounded-xl text-sm uppercase mt-4">
              Lưu Cài Đặt
            </button>
          </div>
        </div>
      );
    }
`;

const insertMarker = `    function VenueRegModal({ currentUser, onClose, onSubmit }) {`;

code = code.replace(insertMarker, newComponent + "\n" + insertMarker);

fs.writeFileSync('src/App.jsx', code);
console.log("Component injected");
