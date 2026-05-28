const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Sort logic
  const oldFilter = `const myTeams = teams.filter(t => 
                          t.owner_user_id === currentUser.id || 
                          (t.members && t.members.some(m => m.user_id === currentUser.id && (m.status === 'joined' || m.status === 'pending')))
                        );`;

  const newFilter = `const myTeams = teams.filter(t => 
                          t.owner_user_id === currentUser.id || 
                          (t.members && t.members.some(m => m.user_id === currentUser.id && (m.status === 'joined' || m.status === 'pending')))
                        ).sort((a, b) => {
                          const aIsOwner = a.owner_user_id === currentUser.id;
                          const bIsOwner = b.owner_user_id === currentUser.id;
                          if (aIsOwner && !bIsOwner) return -1;
                          if (!aIsOwner && bIsOwner) return 1;
                          return 0;
                        });`;

  code = code.replace(oldFilter, newFilter);

  // 2. Crown icon logic
  const oldMap = `                              {myTeams.map(team => {
                                const isSelected = activeTeamId ? team.id === activeTeamId : team.id === myTeams[0].id;
                                return (
                                  <div 
                                    key={team.id}
                                    onClick={() => setActiveTeamId(team.id)}
                                    className={\`flex flex-col items-center gap-1 cursor-pointer transition-all shrink-0 w-[52px] \${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}\`}
                                  >
                                    <div className={\`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm uppercase overflow-hidden border-2 transition-all \${isSelected ? 'border-neon-yellow shadow-[0_0_10px_rgba(202,243,36,0.3)]' : 'border-transparent bg-appDark-deep'}\`}>
                                      {team.avatar ? (
                                        <img src={team.avatar} alt={team.name || team.teamName} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                          {(team.name || team.teamName || 'FC').substring(0,2).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <span className={\`text-[8.5px] truncate w-full text-center font-bold \${isSelected ? 'text-neon-yellow' : 'text-slate-400'}\`}>
                                      {team.name || team.teamName}
                                    </span>
                                  </div>
                                );
                              })}`;

  const newMap = `                              {myTeams.map(team => {
                                const isSelected = activeTeamId ? team.id === activeTeamId : team.id === myTeams[0].id;
                                const isCaptain = team.owner_user_id === currentUser.id;
                                return (
                                  <div 
                                    key={team.id}
                                    onClick={() => setActiveTeamId(team.id)}
                                    className={\`flex flex-col items-center gap-1 cursor-pointer transition-all shrink-0 w-[52px] relative \${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}\`}
                                  >
                                    <div className={\`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm uppercase overflow-hidden border-2 transition-all \${isSelected ? 'border-neon-yellow shadow-[0_0_10px_rgba(202,243,36,0.3)]' : 'border-transparent bg-appDark-deep'}\`}>
                                      {team.avatar ? (
                                        <img src={team.avatar} alt={team.name || team.teamName} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                          {(team.name || team.teamName || 'FC').substring(0,2).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    {isCaptain && (
                                      <div className="absolute -top-1 -right-0.5 text-[10px] rotate-12 drop-shadow-md z-10">👑</div>
                                    )}
                                    <span className={\`text-[8.5px] truncate w-full text-center font-bold \${isSelected ? 'text-neon-yellow' : 'text-slate-400'}\`}>
                                      {team.name || team.teamName}
                                    </span>
                                  </div>
                                );
                              })}`;

  code = code.replace(oldMap, newMap);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated sort and crown UI.");
} catch(e) {
  console.error(e);
}
