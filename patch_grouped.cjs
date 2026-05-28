const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const createdStartStr = '<div className="space-y-2.5">\n                                {myCreatedMatches.map(m => (\n                                  <ProfileMatchListItem key={m.id} match={m} personalStatus={getPersonalStatus(m)} onSelect={() => setSelectedMatch(m)} />\n                                ))}\n                              </div>';

const createdReplaceStr = '{renderGroupedMatches(myCreatedMatches)}';

const joinedStartStr = '<div className="space-y-2.5">\n                                {myJoinedMatches.map(m => (\n                                  <ProfileMatchListItem key={m.id} match={m} personalStatus={getPersonalStatus(m)} onSelect={() => setSelectedMatch(m)} />\n                                ))}\n                              </div>';

const joinedReplaceStr = '{renderGroupedMatches(myJoinedMatches)}';

code = code.replace(createdStartStr, createdReplaceStr);
code = code.replace(joinedStartStr, joinedReplaceStr);

fs.writeFileSync('src/App.jsx', code);
console.log("Replaced correctly");
