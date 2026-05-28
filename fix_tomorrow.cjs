const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
              
              if (isSameDay(d, today)) dateLabel = \`Hôm nay (\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')})\`;
              else if (isSameDay(d, yesterday)) dateLabel = \`Hôm qua (\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')})\`;
              else dateLabel = \`Ngày \${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')}/\${d.getFullYear()}\`;
`;

const replaceStr = `              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
              
              if (isSameDay(d, today)) dateLabel = \`Hôm nay (\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')})\`;
              else if (isSameDay(d, yesterday)) dateLabel = \`Hôm qua (\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')})\`;
              else if (isSameDay(d, tomorrow)) dateLabel = \`Ngày mai (\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')})\`;
              else dateLabel = \`Ngày \${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth()+1).toString().padStart(2, '0')}/\${d.getFullYear()}\`;
`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.jsx', code);
console.log("Tomorrow added");
