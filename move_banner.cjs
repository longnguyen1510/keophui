const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const bannerMarker = '{/* VENUE OWNER REGISTRATION BANNER */}';
const startIndex = code.indexOf(bannerMarker);
if (startIndex !== -1) {
  // Find the end: "return null;\n                })()"
  const endStr = '                })()}';
  const endIndex = code.indexOf(endStr, startIndex) + endStr.length;
  if (endIndex !== -1) {
    const bannerCode = code.substring(startIndex, endIndex);
    // Remove it from the current keo location
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    // Now insert it right after:
    //             {currentTab === "san" && (
    //              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
    
    const targetStr = '{currentTab === "san" && (\n              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">\n';
    code = code.replace(targetStr, targetStr + '                ' + bannerCode + '\n');
    
    fs.writeFileSync('src/App.jsx', code);
    console.log("Moved banner successfully.");
  } else {
    console.log("End of banner not found.");
  }
} else {
  console.log("Banner start not found.");
}
