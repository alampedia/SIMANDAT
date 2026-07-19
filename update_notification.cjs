const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /addNotification\('Surat berhasil disimpan dan diteruskan ke Sekcam untuk tindak lanjut\.'\);/,
  "addNotification(newStatus === 'pending_target' ? 'Surat berhasil disimpan dan langsung ditugaskan ke target.' : 'Surat berhasil disimpan dan diteruskan ke Sekcam untuk tindak lanjut.');"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
