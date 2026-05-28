const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // 1. Change matchCount fallback to 0
  code = code.replace(
    '<span className="text-xs font-black text-white">{currentUser.matchCount || 12}</span>',
    '<span className="text-xs font-black text-white">{currentUser.matchCount || 0}</span>'
  );

  // 2. Add edit button to Vị trí
  code = code.replace(
    '<span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Vị trí</span>',
    '<span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1">Vị trí <button onClick={() => setModalType(\'change_position\')} className="text-[10px] text-slate-500 hover:text-white transition-colors">✏️</button></span>'
  );

  // 3. Find VENUE OWNER MANAGEMENT BLOCK and extract it
  const venueBlockStart = code.indexOf('{/* VENUE OWNER MANAGEMENT BLOCK */}');
  const venueBlockEndStr = `                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}`;
  const venueBlockEnd = code.indexOf(venueBlockEndStr, venueBlockStart) + venueBlockEndStr.length;
  let venueBlockFull = code.substring(venueBlockStart, venueBlockEnd);
  
  // Remove it from its current position
  code = code.substring(0, venueBlockStart) + code.substring(venueBlockEnd);

  // Now, in the "Sân" tab, there's `0. SOCCER FIELD BANNER`
  const soccerBannerStart = code.indexOf('{/* 0. SOCCER FIELD BANNER */}');
  const soccerBannerEndStr = `                    <span className="text-[10px] font-black text-sky-400 tracking-wider uppercase text-center leading-tight">Đăng<br/>Ký Ngay</span>
                  </div>
                </div>`;
  const soccerBannerEnd = code.indexOf(soccerBannerEndStr, soccerBannerStart) + soccerBannerEndStr.length;
  
  const soccerBannerCode = code.substring(soccerBannerStart, soccerBannerEnd);
  
  // Now modify the `!myVenue` block inside `venueBlockFull` to use the `soccerBannerCode`
  // Wait, let's look at how the `!myVenue` block looks currently:
  const oldSmallCardStart = venueBlockFull.indexOf('<div \n                            onClick={() => triggerActionWithAuth(\'venue_registration\')}');
  const oldSmallCardEndStr = `                          </div>`;
  const oldSmallCardEnd = venueBlockFull.indexOf(oldSmallCardEndStr, oldSmallCardStart) + oldSmallCardEndStr.length;
  
  // Replace the old small card with the soccerBannerCode
  let updatedVenueBlock = venueBlockFull.substring(0, oldSmallCardStart) + soccerBannerCode + venueBlockFull.substring(oldSmallCardEnd);
  
  // Also we need to replace the `0. SOCCER FIELD BANNER` in the Sân tab with `updatedVenueBlock`
  code = code.substring(0, soccerBannerStart) + updatedVenueBlock + code.substring(soccerBannerEnd);
  
  // 4. Add `submitChangePositionForm` handler
  const submitNameFormStr = `      const submitChangeNameForm = (newName) => {`;
  const submitPosFormStr = `
      const submitChangePositionForm = (newPosition) => {
        setCurrentUser({ ...currentUser, position: newPosition });
        setModalType(null);
      };
`;
  code = code.replace(submitNameFormStr, submitPosFormStr + '\n' + submitNameFormStr);

  // 5. Add `<ChangePositionModal />` rendering
  const changeNameModalStr = `{modalType === 'change_name' && (
              <ChangeNameModal 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitChangeNameForm}
              />
            )}`;
  const changePosModalStr = `{modalType === 'change_position' && (
              <ChangePositionModal 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitChangePositionForm}
              />
            )}`;
  code = code.replace(changeNameModalStr, changeNameModalStr + '\n\n            ' + changePosModalStr);

  // 6. Add `<ChangePositionModal>` component definition
  const changeNameCompStr = `    function ChangeNameModal({ currentUser, onClose, onSubmit }) {`;
  const changePosCompStr = `
    function ChangePositionModal({ currentUser, onClose, onSubmit }) {
      const [position, setPosition] = React.useState(currentUser?.position || 'Tự do');
      
      const positions = ['GK', 'Hậu vệ', 'Tiền vệ', 'Tiền đạo', 'Tự do'];

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-appDark-card border border-appDark-border rounded-2xl p-5 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Vị Trí Sở Trường</h3>
              <p className="text-[11px] text-slate-400 mt-1">Chọn vị trí bạn thường đá nhất</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {positions.map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={\`w-full p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-between \${
                    position === pos 
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                      : 'bg-appDark-bg border-appDark-border text-slate-300 hover:border-slate-500'
                  }\`}
                >
                  {pos}
                  {position === pos && <span>✓</span>}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-appDark-bg text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={() => onSubmit(position)}
                className="flex-1 py-3 bg-cyan-500 text-black rounded-xl font-black hover:bg-cyan-400 transition-colors shadow-lg"
              >
                Cập Nhật
              </button>
            </div>
          </div>
        </div>
      );
    }
`;
  code = code.replace(changeNameCompStr, changePosCompStr + '\n' + changeNameCompStr);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Successfully updated.");

} catch (e) {
  console.error(e);
}
