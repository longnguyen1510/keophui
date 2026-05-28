const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Find start and end of VENUE OWNER MANAGEMENT BLOCK
  const venueBlockStart = code.indexOf('{/* VENUE OWNER MANAGEMENT BLOCK */}');
  const headPostActionStart = code.indexOf('{/* HEAD & POST ACTION FOR OWNERS */}');
  
  if (venueBlockStart === -1 || headPostActionStart === -1) {
    throw new Error("Could not find venue block markers");
  }

  // The block spans from venueBlockStart to right before headPostActionStart
  const venueBlockStr = code.substring(venueBlockStart, headPostActionStart);

  // Remove the block from the Sân Trống tab
  code = code.substring(0, venueBlockStart) + code.substring(headPostActionStart);

  // Now find where to insert it in the Tôi tab
  const authStateMarker = '// AUTHENTICATED STATE\n                  <div className="space-y-5 pb-6">\n';
  const insertPos = code.indexOf(authStateMarker);
  
  if (insertPos === -1) {
    throw new Error("Could not find AUTHENTICATED STATE marker");
  }

  const finalInsertPos = insertPos + authStateMarker.length;
  
  // Insert it!
  code = code.substring(0, finalInsertPos) + '                    ' + venueBlockStr + code.substring(finalInsertPos);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Successfully moved venue block back to Tôi tab.");

} catch(e) {
  console.error(e);
}
