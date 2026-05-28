const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add State
const stateTarget = `const [activeStatusFilter, setActiveStatusFilter] = useState("Tất cả");`;
const stateReplacement = `const [activeStatusFilter, setActiveStatusFilter] = useState("Tất cả");
      const [activeDateFilter, setActiveDateFilter] = useState("Hôm nay");
      const [activeCustomDate, setActiveCustomDate] = useState("");`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add UI
const uiTarget = `                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {['Tất cả', 'Trống', 'Giữ chỗ', 'Đã chốt'].map(f => (`;
const uiReplacement = `                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
                      {['Hôm nay', 'Ngày mai', 'Tuỳ chọn thời gian'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setActiveDateFilter(f)}
                          className={\`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all \${
                            activeDateFilter === f ? 'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-appDark-card text-slate-500 border border-appDark-border/50 hover:text-slate-300'
                          }\`}
                        >
                          {f}
                        </button>
                      ))}
                      {activeDateFilter === 'Tuỳ chọn thời gian' && (
                        <input
                          type="date"
                          value={activeCustomDate}
                          onChange={(e) => setActiveCustomDate(e.target.value)}
                          className="bg-appDark-deep border border-indigo-500/50 text-slate-200 text-[10px] font-bold rounded p-1 focus:outline-none focus:border-indigo-400"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {['Tất cả', 'Trống', 'Giữ chỗ', 'Đã chốt'].map(f => (`;
code = code.replace(uiTarget, uiReplacement);

// 3. Update Filtering logic in useMemo
const filterTarget = `const ownerSlots = slots.filter(s => s.contact === currentUser.phone);`;
const filterReplacement = `const ownerSlots = slots.filter(s => {
          if (s.contact !== currentUser.phone) return false;
          
          let dateMatches = false;
          if (activeDateFilter === "Tất cả") {
            dateMatches = true; // if we had "Tất cả", but we only have Hôm nay, Ngày mai, Tuỳ chọn
          } else if (activeDateFilter === "Tuỳ chọn thời gian") {
            if (!activeCustomDate) {
              dateMatches = true;
            } else {
              const [yr, mn, dy] = activeCustomDate.split("-");
              const formattedCustom = \`\${dy}/\${mn}/\${yr}\`;
              dateMatches = (s.date === formattedCustom);
            }
          } else {
            dateMatches = (s.date === activeDateFilter);
          }
          
          return dateMatches;
        });`;
code = code.replace(filterTarget, filterReplacement);

// Fix dependencies of useMemo
const memoDepTarget = `}, [slots, matches, currentUser]);`;
const memoDepReplacement = `}, [slots, matches, currentUser, activeDateFilter, activeCustomDate]);`;
code = code.replace(memoDepTarget, memoDepReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Date filter patched");
