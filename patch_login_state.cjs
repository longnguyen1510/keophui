const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Initial tab state
code = code.replace(
  'const [currentTab, setCurrentTab] = useState("keo");',
  'const [currentTab, setCurrentTab] = useState(() => getStorageItem("user", null) ? "keo" : "toi");'
);

// 2. Initial loginPhone state
code = code.replace(
  'const [loginPhone, setLoginPhone] = useState("");',
  'const [loginPhone, setLoginPhone] = useState(() => localStorage.getItem("lastLoginPhone") || "");'
);

// 3. Update login logic to save phone and not clear it
// There are multiple places where login is handled:
// - `handleLogin`
// - `handleCodeSubmit`
// Let's replace `setLoginPhone("");` with `localStorage.setItem("lastLoginPhone", trimmedPhone);`

// In App.jsx, lines 848-849:
// setLoginName("");
// setLoginPhone("");
code = code.replace(
  /setLoginName\(""\);\s*setLoginPhone\(""\);/g,
  'setLoginName("");\n          localStorage.setItem("lastLoginPhone", targetUser.phone || trimmedPhone);'
);

// There might be another one around line 911
code = code.replace(
  /setLoginPhone\(""\);/g,
  '/* setLoginPhone(""); removed to remember phone */'
);

// 4. Update logout logic to navigate to "toi"
// Around line 3109: `setCurrentTab('keo');` inside logout block
code = code.replace(
  /setCurrentUser\(null\);\s*localStorage\.removeItem\('user'\);\s*setCurrentTab\('keo'\);/g,
  "setCurrentUser(null);\n                                    localStorage.removeItem('user');\n                                    setCurrentTab('toi');"
);

// Admin portal login might have `setLoginPhone("");` but we used global replace.
fs.writeFileSync('src/App.jsx', code);
console.log("Login states updated.");
