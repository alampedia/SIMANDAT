const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /const targetUser = usersList\.find\(u => u\.name === newDoc\.assignedTo\);[\s\S]*?newStatus = 'pending_target';\s*\}\s*\}/,
  "let newStatus = 'pending_sekcam'; // Selalu ke sekcam dulu untuk verifikasi"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
