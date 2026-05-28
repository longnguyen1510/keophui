const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetRender = `{modalType === 'venue_registration' && (
              <VenueRegModal`;

const renderReplacement = `{modalType === 'venue_settings' && (
              <VenueSettingsModal
                venue={venues.find(v => v.phone === currentUser.phone || v.owner_user_id === currentUser.id)}
                onClose={closeModal}
                onSubmit={(data) => {
                  setVenues(prev => prev.map(v => {
                    if (v.phone === currentUser.phone || v.owner_user_id === currentUser.id) {
                      return { ...v, capacities: data.capacities, combinations: data.combinations };
                    }
                    return v;
                  }));
                  alert("✅ Cập nhật cài đặt sân thành công!");
                  closeModal();
                }}
              />
            )}

            {modalType === 'venue_registration' && (
              <VenueRegModal`;

code = code.replace(targetRender, renderReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log("Render patched");
