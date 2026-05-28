const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badBlock = `                        </div>
                      )}
                    </div>

                  </div>
                )}`;

const goodBlock = `                        </div>
                      </div>
                    )}

                  </div>
                )}`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed end of history tab.");
} else {
  console.log("Could not find bad block at end of history tab.");
}
