const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove "Quản lý doanh thu"
const revenueBtnTarget = `<button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💳</span>
                          <span className="text-sm font-extrabold text-slate-300">Quản lý doanh thu</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>`;
code = code.replace(revenueBtnTarget, '');

// 2. Update VenueSettingsModal component
const modalTarget = `    function VenueSettingsModal({ venue, onClose, onSubmit }) {
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
      };`;

const modalReplacement = `    function VenueSettingsModal({ venue, onClose, onSubmit }) {
      const [venueName, setVenueName] = useState(venue?.name || "");
      const [venuePhone, setVenuePhone] = useState(venue?.phone || "");
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
          name: venueName.trim(),
          phone: venuePhone.trim(),
          capacities: {
            '5': parseInt(cap5) || 0,
            '7': parseInt(cap7) || 0,
            '11': parseInt(cap11) || 0
          },
          combinations
        });
      };`;

code = code.replace(modalTarget, modalReplacement);

// 3. Add inputs to VenueSettingsModal UI
const uiTarget = `            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-green uppercase border-b border-appDark-border pb-1">1. Số Lượng Sân</h4>`;

const uiReplacement = `            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase border-b border-appDark-border pb-1">1. Thông Tin Chung</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Tên sân bóng</span>
                    <input type="text" value={venueName} onChange={e => setVenueName(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Số điện thoại liên hệ</span>
                    <input type="tel" value={venuePhone} onChange={e => setVenuePhone(e.target.value)} required className="w-full text-xs bg-appDark-deep border border-appDark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neon-green uppercase border-b border-appDark-border pb-1">2. Số Lượng Sân</h4>`;

code = code.replace(uiTarget, uiReplacement);
code = code.replace("2. Quy Tắc Ghép Sân", "3. Quy Tắc Ghép Sân");

// 4. Update the render logic for VenueSettingsModal
const renderTarget = `                onSubmit={(data) => {
                  setVenues(prev => prev.map(v => {
                    if (v.phone === currentUser.phone || v.owner_user_id === currentUser.id) {
                      return { ...v, capacities: data.capacities, combinations: data.combinations };
                    }
                    return v;
                  }));
                  alert("✅ Cập nhật cài đặt sân thành công!");
                  closeModal();
                }}`;

const renderReplacement = `                onSubmit={(data) => {
                  setVenues(prev => prev.map(v => {
                    if (v.phone === currentUser.phone || v.owner_user_id === currentUser.id) {
                      return { ...v, name: data.name, phone: data.phone, capacities: data.capacities, combinations: data.combinations };
                    }
                    return v;
                  }));
                  alert("✅ Cập nhật thông tin & cài đặt sân thành công!");
                  closeModal();
                }}`;

code = code.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Patched everything successfully");
