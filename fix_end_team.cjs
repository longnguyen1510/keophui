const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badBlock = `                        );
                      })()}
                    </div>

                                        </div>
                    )}`;

const goodBlock = `                        );
                      })()}

                                        </div>
                    )}`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Fixed extra div at end of team block.");
} else {
  console.log("Could not find bad block at end of team block.");
}
