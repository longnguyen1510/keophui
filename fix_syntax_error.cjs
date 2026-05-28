const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                      </div>
                    )
                  ))}
                </div>`;

const replacement = `                      </div>
                    );
                  })}
                </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Syntax error fixed");
