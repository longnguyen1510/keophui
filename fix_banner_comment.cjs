const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Find the exact occurrence inside the return
  const errorSnippet = `return (
                          {/* 0. SOCCER FIELD BANNER */}`;
  
  if (code.includes(errorSnippet)) {
    code = code.replace(errorSnippet, `return (`);
    fs.writeFileSync('src/App.jsx', code, 'utf8');
    console.log("Fixed syntax error.");
  } else {
    console.log("Snippet not found.");
  }
} catch (e) {
  console.error(e);
}
