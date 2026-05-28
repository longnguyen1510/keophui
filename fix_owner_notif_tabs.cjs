const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetNotifTabs = `                  {ownerAccountTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 shadow-md -mt-px relative z-0">
                      <div className="flex gap-2 border-b border-appDark-border pb-3 mb-4">
                        <button 
                          onClick={() => setNotificationSubTab('pending')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${notificationSubTab === 'pending' ? 'bg-amber-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Chờ xử lý ({notifications.filter(n => (!n.recipientPhone || (currentUser && n.recipientPhone === currentUser.phone)) && n.actionRequired && n.status === 'pending').length})
                        </button>
                        <button 
                          onClick={() => setNotificationSubTab('activity')}
                          className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all \${notificationSubTab === 'activity' ? 'bg-sky-400 text-appDark-deep' : 'bg-appDark-deep text-slate-400 hover:text-slate-200'}\`}
                        >
                          Hoạt động
                        </button>
                      </div>

                      <div className="space-y-2.5 animate-fade-in opacity-90 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
                        {(() => {
                          const ownerRelevantKeywords = ['nhận kèo', 'xin một suất', 'đặt sân', 'giữ chỗ', 'chốt kèo', 'thành công', 'hủy', 'huỷ', 'rút', 'phê duyệt', 'cấp quyền'];
                          const myNotifs = notifications.filter(n => {
                            if (n.recipientPhone && currentUser && n.recipientPhone !== currentUser.phone) return false;
                            
                            const msg = (n.message || '').toLowerCase();
                            return ownerRelevantKeywords.some(kw => msg.includes(kw));
                          });
                          
                          let displayNotifs = [];
                          if (notificationSubTab === 'pending') {
                            displayNotifs = myNotifs.filter(n => n.actionRequired && n.status === 'pending');
                          } else {
                            displayNotifs = myNotifs.filter(n => !n.actionRequired || n.status === 'resolved');
                          }`;

const replacementNotifTabs = `                  {ownerAccountTab === 'history' && (
                    <div className="bg-appDark-card border border-appDark-border rounded-b-2xl p-4 shadow-md -mt-px relative z-0">
                      <div className="space-y-2.5 animate-fade-in opacity-90 max-h-[50vh] overflow-y-auto no-scrollbar pb-4 pt-2">
                        {(() => {
                          const ownerRelevantKeywords = ['nhận kèo', 'xin một suất', 'đặt sân', 'giữ chỗ', 'chốt kèo', 'thành công', 'hủy', 'huỷ', 'rút', 'phê duyệt', 'cấp quyền'];
                          const myNotifs = notifications.filter(n => {
                            if (n.recipientPhone && currentUser && n.recipientPhone !== currentUser.phone) return false;
                            
                            const msg = (n.message || '').toLowerCase();
                            return ownerRelevantKeywords.some(kw => msg.includes(kw));
                          });
                          
                          let displayNotifs = myNotifs;`;

code = code.replace(targetNotifTabs, replacementNotifTabs);

fs.writeFileSync('src/App.jsx', code);
console.log("Notif subtabs removed for owner");
