const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Change mockActivities.map to activities.map and add click handler for suggestions
  const renderOld = `                              {mockActivities.map(act => (
                                <div key={act.id} className="flex flex-col justify-center gap-0.5 bg-appDark-deep/80 border border-appDark-border/40 hover:border-slate-600 rounded-xl p-3 transition-all cursor-pointer">`;
  const renderNew = `                              {activities.map(act => (
                                <div 
                                  key={act.id} 
                                  onClick={() => {
                                    if (act.type === 'suggestion') {
                                      setFilterDistrict(act.district || 'Tất cả');
                                      setCurrentTab('keo');
                                    }
                                  }}
                                  className="flex flex-col justify-center gap-0.5 bg-appDark-deep/80 border border-appDark-border/40 hover:border-slate-600 rounded-xl p-3 transition-all cursor-pointer"
                                >`;

  code = code.replace(renderOld, renderNew);

  // Update interval to inject suggestion logic
  const intervalOld = `              // EXPIRATION LOGIC FOR OPEN MATCHES
              if (startTime && (m.status === 'waiting_opponent' || m.status === 'Thiếu người')) {
                const sixtyMins = 60 * 60 * 1000;
                
                if (m.status === 'Thiếu người') {
                  // Tuyển lẻ: expires 60 mins before start
                  if (nowTime > startTime - sixtyMins) {
                    matchesChanged = true;
                    return { ...m, status: 'expired' };
                  }
                } else if (m.status === 'waiting_opponent') {
                  // Tìm đối: 
                  const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
                  const isCreatedLastMinute = (startTime - createdAt) < sixtyMins;
                  
                  if (isCreatedLastMinute) {
                    // Created last minute: expires 15 mins after creation
                    if (nowTime > createdAt + 15 * 60 * 1000) {
                      matchesChanged = true;
                      return { ...m, status: 'expired' };
                    }
                  } else {
                    // Created normally: expires 60 mins before start
                    if (nowTime > startTime - sixtyMins) {
                      matchesChanged = true;
                      return { ...m, status: 'expired' };
                    }
                  }
                }
              }`;

  const intervalNew = `              // EXPIRATION LOGIC FOR OPEN MATCHES
              if (startTime && (m.status === 'waiting_opponent' || m.status === 'Thiếu người')) {
                const sixtyMins = 60 * 60 * 1000;
                let isNowExpired = false;
                
                if (m.status === 'Thiếu người') {
                  // Tuyển lẻ: expires 60 mins before start
                  if (nowTime > startTime - sixtyMins) {
                    isNowExpired = true;
                  }
                } else if (m.status === 'waiting_opponent') {
                  // Tìm đối: 
                  const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
                  const isCreatedLastMinute = (startTime - createdAt) < sixtyMins;
                  
                  if (isCreatedLastMinute) {
                    // Created last minute: expires 15 mins after creation
                    if (nowTime > createdAt + 15 * 60 * 1000) {
                      isNowExpired = true;
                    }
                  } else {
                    // Created normally: expires 60 mins before start
                    if (nowTime > startTime - sixtyMins) {
                      isNowExpired = true;
                    }
                  }
                }

                if (isNowExpired) {
                  matchesChanged = true;
                  
                  // GỢI Ý KÈO THAY THẾ KHI HẾT HẠN
                  // Tìm các kèo tương tự đang mở
                  if (m.district && m.pitchType) {
                    const similarMatches = prevMatches.filter(sim => 
                      sim.id !== m.id &&
                      (sim.status === 'waiting_opponent' || sim.status === 'Thiếu người') &&
                      sim.district === m.district &&
                      sim.pitchType === m.pitchType &&
                      sim.rawTime === m.rawTime
                    );

                    if (similarMatches.length > 0) {
                      // Trigger notification logic safely using timeout to avoid state loop warnings
                      setTimeout(() => {
                        setActivities(prevAct => {
                          const hasSuggested = prevAct.some(act => act.matchId === m.id);
                          if (!hasSuggested) {
                            const newAct = {
                              id: Date.now() + Math.random(),
                              type: 'suggestion',
                              matchId: m.id,
                              district: m.district,
                              title: \`Kèo tại \${m.venue} đã hết hạn. Hệ thống tìm thấy \${similarMatches.length} kèo khác lúc \${m.time.split(' ')[0]} sân \${m.pitchType} tại \${m.district}. Bấm để xem!\`,
                              time: 'Vừa xong',
                            };
                            return [newAct, ...prevAct];
                          }
                          return prevAct;
                        });
                      }, 0);
                    }
                  }

                  return { ...m, status: 'expired' };
                }
              }`;

  code = code.replace(intervalOld, intervalNew);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added suggestion logic to interval.");
} catch(e) {
  console.error(e);
}
