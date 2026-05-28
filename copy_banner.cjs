const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Replace ✏️ with ▾ for position
  const posRegex = /<span className="text-\[9px\] text-slate-400 uppercase font-bold tracking-wider mb-0\.5 flex items-center gap-1">Vị trí <button onClick=\{\(\) => setModalType\('change_position'\)\} className="text-\[10px\] text-slate-500 hover:text-white transition-colors">✏️<\/button><\/span>/;
  const newPosHtml = '<span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">Vị trí <button onClick={() => setModalType(\'change_position\')} className="text-[12px] text-slate-500 hover:text-white transition-colors">▾</button></span>';
  code = code.replace(posRegex, newPosHtml);

  // 2. Replace Tạo Mới with Thêm đội
  code = code.replace(
    '<span className="text-[8.5px] truncate w-full text-center font-bold text-slate-400">\n                                  Tạo Mới\n                                </span>',
    '<span className="text-[8.5px] truncate w-full text-center font-bold text-slate-400">\n                                  Thêm đội\n                                </span>'
  );

  // 3. Find VENUE OWNER MANAGEMENT BLOCK
  const venueBlockStart = code.indexOf('{/* VENUE OWNER MANAGEMENT BLOCK */}');
  
  // Find where it ends. We know it ends with `})()}` and is followed by User Intro Card
  const userIntroCardMarker = '{/* User Intro Card & Quick Actions */}';
  const userIntroCardPos = code.indexOf(userIntroCardMarker, venueBlockStart);
  
  // We want to capture up to just before User Intro Card
  const venueBlockStr = code.substring(venueBlockStart, userIntroCardPos).trim();

  // 4. Now find Sân Trống tab: 
  const sanTabStart = '            {/* TAB CONTENT: SÂN */}\n            {currentTab === "san" && (\n              <main className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">\n';
  const insertPos = code.indexOf(sanTabStart);
  
  if (insertPos !== -1) {
    const finalInsertPos = insertPos + sanTabStart.length;
    // Inject the block into Sân Trống tab
    code = code.substring(0, finalInsertPos) + '                ' + venueBlockStr + '\n\n' + code.substring(finalInsertPos);
    console.log("Copied venue block to San Trong tab.");
  } else {
    console.log("Could not find San Trong tab marker.");
  }

  fs.writeFileSync('src/App.jsx', code, 'utf8');

} catch(e) {
  console.error(e);
}
