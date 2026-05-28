const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Find the start of the VENUE OWNER MANAGEMENT BLOCK inside currentTab === "san"
const startMarker = '{/* VENUE OWNER MANAGEMENT BLOCK */}';
let startIndex = code.indexOf(startMarker, code.indexOf('currentTab === "san"'));

if (startIndex !== -1) {
  // Find the end of this IIFE block: })()}
  let braceCount = 0;
  let inBlock = false;
  let endIndex = -1;
  
  for (let i = startIndex; i < code.length; i++) {
    if (code.substring(i, i + 5) === '(() =>') {
      inBlock = true;
    }
    if (inBlock) {
      if (code[i] === '{') braceCount++;
      if (code[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          // Found the end of the arrow function body, need to consume the final })()}
          const rest = code.substring(i);
          if (rest.startsWith('})()}')) {
            endIndex = i + 5;
            break;
          }
        }
      }
    }
  }

  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    console.log("Removed VENUE OWNER MANAGEMENT BLOCK successfully.");
  } else {
    console.log("Could not find the end of the block.");
  }
} else {
  console.log("Could not find the start marker.");
}

code = code.replace(
  /\{\(currentTab\.startsWith\("owner_"\) \|\| \(currentTab === "toi" && !isVenueOwnerGlobal\)\) && \(/g,
  '{currentTab.startsWith("owner_") && ('
);
console.log("Updated toi tab condition.");

fs.writeFileSync('src/App.jsx', code);
