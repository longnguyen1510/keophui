const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix 1: CreateSlotFormModal Price & Date
code = code.replace(
  `      const [price, setPrice] = useState("");
      const [contact, setContact] = useState(currentUser ? currentUser.phone : "");`,
  `      const [price, setPrice] = useState("");
      const [contact, setContact] = useState(currentUser ? currentUser.phone : "");

      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };`
);

code = code.replace(
  `                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required
                    placeholder="Ví dụ: 600000"`,
  `                  <input 
                    type="text" 
                    value={price} 
                    onChange={handlePriceFormat} 
                    required
                    placeholder="Ví dụ: 600.000"`
);

code = code.replace(
  `        let finalDateLabel = date;
        if (date === "Chọn ngày cụ thể") {
          if (customDate) {
            const [yr, mn, dy] = customDate.split("-");
            finalDateLabel = \`\${dy}/\${mn}/\${yr}\`;
          } else {
            finalDateLabel = "Hôm nay";
          }
        }`,
  `        let finalDateLabel = date;
        if (date === "Hôm nay") {
          const d = new Date();
          finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        } else if (date === "Ngày mai") {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        } else if (date === "Chọn ngày cụ thể") {
          if (customDate) {
            const [yr, mn, dy] = customDate.split("-");
            finalDateLabel = \`\${dy}/\${mn}/\${yr}\`;
          } else {
            const d = new Date();
            finalDateLabel = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
          }
        }`
);

// Fix 2: EditSlotFormModal Price
code = code.replace(
  `      const [price, setPrice] = useState(() => {
        if (!slot.price) return "";
        return slot.price.replace(/\\D/g, '');
      });`,
  `      const [price, setPrice] = useState(() => {
        if (!slot.price) return "";
        const raw = String(slot.price).replace(/\\D/g, '');
        return raw ? parseInt(raw).toLocaleString('vi-VN') : "";
      });
      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };`
);

code = code.replace(
  `        onSubmit({
          id: slot.id,
          timeSlot,
          price: parseInt(price) || 0,`,
  `        onSubmit({
          id: slot.id,
          timeSlot,
          price: parseInt(String(price).replace(/\\D/g, '')) || 0,`
);

code = code.replace(
  `                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required
                  placeholder="Ví dụ: 600000"`,
  `                <input 
                  type="text" 
                  value={price} 
                  onChange={handlePriceFormat} 
                  required
                  placeholder="Ví dụ: 600.000"`
);


// Fix 3: EditMatchModal Price
code = code.replace(
  `      const [price, setPrice] = useState(() => {
        if (!match.price) return "";
        return String(match.price).replace(/\\D/g, '');
      });`,
  `      const [price, setPrice] = useState(() => {
        if (!match.price) return "";
        const raw = String(match.price).replace(/\\D/g, '');
        return raw ? parseInt(raw).toLocaleString('vi-VN') : "";
      });
      const handlePriceFormat = (e) => {
        const rawValue = String(e.target.value).replace(/\\D/g, '');
        if (!rawValue) {
          setPrice('');
          return;
        }
        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
        setPrice(formatted);
      };`
);

code = code.replace(
  `      const handleFormSubmit = (e) => {
        e.preventDefault();
        let priceNum = parseInt(price) || 0;
        onSubmit({`,
  `      const handleFormSubmit = (e) => {
        e.preventDefault();
        let priceNum = parseInt(String(price).replace(/\\D/g, '')) || 0;
        onSubmit({`
);

// Assuming EditMatchModal has an input for price: (we will use regex to find type="number" value={price})
code = code.replace(
  /<input[^>]*type="number"[^>]*value=\{price\}[^>]*onChange=\{\(e\) => setPrice\(e.target.value\)\}[^>]*>/g,
  `<input type="text" value={price} onChange={handlePriceFormat} required placeholder="Ví dụ: 600.000" className="w-full text-xs font-semibold bg-appDark-deep border border-appDark-border rounded-xl px-3 py-2 text-white focus:outline-none" />`
);


// Fix 4: MatchSuggestionModal notes rendering (remove quotes)
code = code.replace(
  `                <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                  "{match.notes}"
                </p>`,
  `                <p className="bg-slate-900/60 p-3 rounded-xl border border-appDark-border/40 text-xs text-slate-300 leading-relaxed italic">
                  {match.notes}
                </p>`
);

fs.writeFileSync('src/App.jsx', code);
console.log("All fixes applied");
