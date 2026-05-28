const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.jsx', 'utf8');

  const oldLogout = `      const handleLogout = () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
          setCurrentUser(null);
        }
      };`;
      
  const newLogout = `      const handleLogout = () => {
        if(confirm("Bạn có chắc muốn đăng xuất?")) {
          if (currentUser && currentUser.phone) {
            setLoginPhone(currentUser.phone);
          }
          setCurrentUser(null);
        }
      };`;
      
  code = code.replace(oldLogout, newLogout);

  fs.writeFileSync('src/App.jsx', code, 'utf8');
  console.log("Updated logout to preserve phone.");
} catch(e) {
  console.error(e);
}
