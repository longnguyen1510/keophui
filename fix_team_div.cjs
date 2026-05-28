const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badBlock = `                    {profileMatchTab === 'team' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tr-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      {/* TEAM MEMBERSHIP & MANAGEMENT PANEL */}
                    <div className="bg-appDark-card border border-appDark-border rounded-2xl p-4 space-y-3.5 shadow-md">`;

const goodBlock = `                    {profileMatchTab === 'team' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tr-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                      {/* TEAM MEMBERSHIP & MANAGEMENT PANEL */}`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed extra div in team tab.");
} else {
  console.log("Could not find bad block in team tab.");
}
