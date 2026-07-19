const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  / \/\/ The notification is handled in addTask mostly, but we can keep UI updates\s*setIsNewDocOpen\(false\);/,
  "    addNotification('Surat berhasil disimpan dan diteruskan ke Sekcam untuk tindak lanjut.');\n    setIsNewDocOpen(false);"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
