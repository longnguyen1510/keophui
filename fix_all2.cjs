const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Find start of Venue block
  const venueStart = code.indexOf('{/* VENUE OWNER MANAGEMENT BLOCK */}');
  
  // Since we deleted the end fragment, we can't search for it.
  // We know it currently ends before `                    {/* Admin Header Card */}`
  const adminHeaderStart = code.indexOf('{/* Admin Header Card */}');
  
  // The venue block was pasted at 2329, and Admin Header Card is at 2542.
  let venueBlockBroken = code.substring(venueStart, adminHeaderStart);
  
  // We need to remove it from here.
  let newCode = code.substring(0, venueStart) + code.substring(adminHeaderStart);
  
  // Now we need to reconstruct the Venue Block correctly.
  // It should end with:
  const venueEndFragment = `                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}`;
                  
  const fullVenueBlock = venueBlockBroken.trim() + '\n' + venueEndFragment + '\n';
  
  // Now, where should it go?
  // It should go at the top of AUTHENTICATED STATE.
  const authStateMarker = '// AUTHENTICATED STATE\n                  <div className="space-y-5 pb-6">\n';
  const authStateIndex = newCode.indexOf(authStateMarker);
  
  if (authStateIndex === -1) {
    console.log("Could not find AUTHENTICATED STATE exactly. Let's find it loosely.");
    const authLooseIndex = newCode.indexOf('// AUTHENTICATED STATE');
    const spaceY5Index = newCode.indexOf('<div className="space-y-5 pb-6">', authLooseIndex);
    const insertPos = spaceY5Index + '<div className="space-y-5 pb-6">'.length;
    
    newCode = newCode.substring(0, insertPos) + '\n                    ' + fullVenueBlock + newCode.substring(insertPos);
  } else {
    const insertPos = authStateIndex + authStateMarker.length;
    newCode = newCode.substring(0, insertPos) + '                    ' + fullVenueBlock + newCode.substring(insertPos);
  }

  fs.writeFileSync('src/App.jsx', newCode, 'utf8');
  console.log("Successfully fixed and moved Venue block.");

} catch(e) {
  console.error(e);
}
