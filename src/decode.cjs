const fs = require('fs');
let content = fs.readFileSync('extracted_content.txt', 'utf8');
if (content.startsWith('"') && content.endsWith('"')) {
  content = JSON.parse(content);
}
fs.writeFileSync('extracted_content_decoded.txt', content, 'utf8');
