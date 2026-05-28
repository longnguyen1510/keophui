const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badLines = `                        </div>
                      </div>
                    );
                })()}
              </main>`;

const goodLines = `                        </div>
                      )}
                      </div>
                    );
                })()}
              </main>`;

if (code.includes(badLines)) {
  code = code.replace(badLines, goodLines);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed bad IIFE part 3.");
} else {
  console.log("Could not find bad lines part 3.");
}
