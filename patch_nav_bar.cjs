const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Replace Kèo button
code = code.replace(
  'onClick={() => { resetFilters(); setCurrentTab("keo"); }}',
  'onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } resetFilters(); setCurrentTab("keo"); }}'
);

// Replace Sân button
code = code.replace(
  'onClick={() => setCurrentTab("san")}',
  'onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } setCurrentTab("san"); }}'
);

// Replace Đội button
code = code.replace(
  'onClick={() => setCurrentTab("doi")}',
  'onClick={() => { if(!currentUser) { alert("Vui lòng đăng nhập để tiếp tục thao tác!"); setCurrentTab("toi"); return; } setCurrentTab("doi"); }}'
);

fs.writeFileSync('src/App.jsx', code);
console.log("Nav bar updated");
