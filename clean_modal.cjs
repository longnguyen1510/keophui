const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  // Remove Modal Rendering
  const modalRender = `{modalType === 'change_position' && (
              <ChangePositionModal 
                currentUser={currentUser}
                onClose={closeModal} 
                onSubmit={submitChangePositionForm}
              />
            )}`;
  code = code.replace(modalRender, '');

  // Remove Modal Component Definition
  const modalDefStart = code.indexOf('    function ChangePositionModal({ currentUser, onClose, onSubmit }) {');
  const modalDefEndStr = `        </div>
      );
    }`;
  
  if (modalDefStart !== -1) {
    const modalDefEnd = code.indexOf(modalDefEndStr, modalDefStart) + modalDefEndStr.length;
    code = code.substring(0, modalDefStart) + code.substring(modalDefEnd);
  }

  // Remove submit handler
  const submitHandler = `      const submitChangePositionForm = (newPosition) => {
        setCurrentUser({ ...currentUser, position: newPosition });
        setModalType(null);
      };`;
  code = code.replace(submitHandler, '');

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Cleaned up unused modal code.");

} catch(e) {
  console.error(e);
}
