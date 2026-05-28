const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Update MatchDetailModal signature
  code = code.replace(`    function MatchDetailModal({ match, onClose, currentUser, teams = [], onAction, onRequestHandler, onCancelMatch, onCancelRequest }) {`, 
                      `    function MatchDetailModal({ match, onClose, currentUser, teams = [], onAction, onRequestHandler, onCancelMatch, onCancelRequest, onAttendanceAction }) {`);

  // Update getStatusBadge translation
  const oldGetStatusBadge = `                      const getStatusBadge = (status) => {
                        switch(status) {
                          case 'accepted': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
                          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
                          case 'waitlist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                          default: return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
                        }
                      };`;

  const newGetStatusBadge = `                      const getStatusBadge = (status) => {
                        switch(status) {
                          case 'accepted': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
                          case 'present': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
                          case 'noshow': return 'bg-red-500/20 text-red-500 border-red-500/30';
                          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
                          case 'waitlist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                          default: return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
                        }
                      };`;

  code = code.replace(oldGetStatusBadge, newGetStatusBadge);

  const oldGetStatusText = `                                {req.status === 'accepted' ? 'Đã duyệt' : 
                                 req.status === 'rejected' ? 'Đã từ chối' : 
                                 req.status === 'waitlist' ? 'Dự bị' : 'Chờ duyệt'}`;

  const newGetStatusText = `                                {req.status === 'accepted' ? 'Đã nhận' : 
                                 req.status === 'present' ? 'Đã có mặt' :
                                 req.status === 'noshow' ? 'Không tới' :
                                 req.status === 'rejected' ? 'Từ chối' : 
                                 req.status === 'waitlist' ? 'Dự bị' : 'Chờ duyệt'}`;

  code = code.replace(oldGetStatusText, newGetStatusText);

  // Update normal player list text
  const oldListStatus = `                      <span className={\`text-[8.5px] font-bold uppercase px-1 py-0.5 rounded border \${
                        req.status === 'accepted' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                        req.status === 'waitlist' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      }\`}>
                        {req.status === 'accepted' ? 'Đã duyệt' : req.status === 'waitlist' ? 'Dự bị' : 'Chờ duyệt'}
                      </span>`;

  const newListStatus = `                      <span className={\`text-[8.5px] font-bold uppercase px-1 py-0.5 rounded border \${
                        req.status === 'accepted' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                        req.status === 'present' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                        req.status === 'noshow' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                        req.status === 'waitlist' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-amber-500/20 text-amber-500 border-amber-500/30'
                      }\`}>
                        {req.status === 'accepted' ? 'Đã nhận' : req.status === 'present' ? 'Đã có mặt' : req.status === 'noshow' ? 'Không tới' : req.status === 'waitlist' ? 'Dự bị' : 'Chờ duyệt'}
                      </span>`;

  code = code.replace(oldListStatus, newListStatus);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated status text.");
} catch(e) {
  console.error(e);
}
