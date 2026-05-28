const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badBlock = `                        </div>
                      ) : (
                        <div className="space-y-2.5 animate-fade-in opacity-90">`;

const goodBlock = `                        </div>
                    </div>
                    )}

                    {profileMatchTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl rounded-tl-2xl p-4 space-y-4 shadow-md -mt-px relative z-0">
                        <div className="space-y-2.5 animate-fade-in opacity-90">`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed history tab!");
} else {
  console.log("Could not find bad block in history tab.");
}
