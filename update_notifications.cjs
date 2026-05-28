const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Add state
  const stateOld = `      const [activities, setActivities] = useState([`;
  const stateNew = `      const [hasUnreadActivities, setHasUnreadActivities] = useState(false);
      const [activities, setActivities] = useState([`;
  code = code.replace(stateOld, stateNew);

  // Update setActivities occurrences
  const oldSetAct1 = `                        setActivities(prevAct => {`;
  const newSetAct1 = `                        setHasUnreadActivities(true);
                        setActivities(prevAct => {`;
  // First match in suggestion
  code = code.replace(oldSetAct1, newSetAct1);

  const oldSetAct2 = `              // Add notification
              setActivities(prevAct => {`;
  const newSetAct2 = `              // Add notification
              setHasUnreadActivities(true);
              setActivities(prevAct => {`;
  // Second match in attendance
  code = code.replace(oldSetAct2, newSetAct2);

  // Add notification when submitJoinForm
  const oldSubmitJoin = `        const newReq = {
          id: 'req_' + Date.now(),
          teamId: myTeam.id,
          teamName: myTeam.name,
          phone: currentUser.phone,
          name: currentUser.name,
          position: formData.position || "Tự do",
          level: formData.level || myTeam.level,
          note: formData.note || "Xin tham gia đá",
          status: 'pending'
        };`;

  const newSubmitJoin = `        const newReq = {
          id: 'req_' + Date.now(),
          teamId: myTeam.id,
          teamName: myTeam.name,
          phone: currentUser.phone,
          name: currentUser.name,
          position: formData.position || "Tự do",
          level: formData.level || myTeam.level,
          note: formData.note || "Xin tham gia đá",
          status: 'pending'
        };

        // Notify owner
        setHasUnreadActivities(true);
        setActivities(prevAct => [
          {
            id: Date.now() + Math.random(),
            type: 'join_request',
            matchId: match.id,
            title: \`👤 \${currentUser.name} vừa xin tham gia trận đấu của bạn vào lúc \${match.time.split(' ')[0]}. Hãy duyệt ngay!\`,
            time: 'Vừa xong',
            icon: '👤',
            color: 'text-sky-400 bg-sky-400/10 border-sky-400/20'
          },
          ...prevAct
        ]);`;

  code = code.replace(oldSubmitJoin, newSubmitJoin);

  // Clear unread when viewing activities
  const oldActivitiesTab = `                          <button 
                            onClick={() => setNotificationSubTab('activities')}
                            className={\`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase transition-all \${notificationSubTab === 'activities' ? 'bg-appDark-card text-neon-green shadow-sm border border-appDark-border' : 'text-slate-500 hover:text-slate-400'}\`}
                          >
                            Hoạt Động 🔔
                          </button>`;
  const newActivitiesTab = `                          <button 
                            onClick={() => {
                              setNotificationSubTab('activities');
                              setHasUnreadActivities(false);
                            }}
                            className={\`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase transition-all \${notificationSubTab === 'activities' ? 'bg-appDark-card text-neon-green shadow-sm border border-appDark-border' : 'text-slate-500 hover:text-slate-400'}\`}
                          >
                            Hoạt Động 🔔
                          </button>`;
  
  code = code.replace(oldActivitiesTab, newActivitiesTab);

  // Add Red Dot to THÔNG BÁO tab button
  const oldThongBaoTab = `                      <button 
                        onClick={() => setProfileMatchTab('history')} 
                        className={\`flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${profileMatchTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                      >
                        Thông Báo
                      </button>`;
  const newThongBaoTab = `                      <button 
                        onClick={() => {
                          setProfileMatchTab('history');
                          if (notificationSubTab === 'activities') setHasUnreadActivities(false);
                        }} 
                        className={\`relative flex-1 py-3 font-extrabold text-[11px] uppercase rounded-t-xl transition-all \${profileMatchTab === 'history' ? 'bg-appDark-card border-t border-l border-r border-appDark-border text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)]' : 'bg-appDark-deep/50 text-slate-400 border-b border-appDark-border hover:bg-appDark-deep'}\`}
                      >
                        Thông Báo
                        {hasUnreadActivities && <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>}
                      </button>`;

  code = code.replace(oldThongBaoTab, newThongBaoTab);

  // Add Red Dot to BOTTOM NAV Hồ Sơ button
  const oldBottomNavToi = `                <div className={\`p-1 rounded-xl transition-all duration-300 \${
                  currentTab === "toi" 
                    ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" 
                    : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"
                }\`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>`;
  const newBottomNavToi = `                <div className={\`relative p-1 rounded-xl transition-all duration-300 \${
                  currentTab === "toi" 
                    ? "text-neon-green scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.75)]" 
                    : "text-slate-400 group-hover:text-slate-300 group-hover:scale-105"
                }\`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {hasUnreadActivities && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-appDark-bg shadow-[0_0_6px_#ef4444]"></span>}
                </div>`;

  code = code.replace(oldBottomNavToi, newBottomNavToi);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Added red dots and unread logic.");
} catch(e) {
  console.error(e);
}
