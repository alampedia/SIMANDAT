const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace the actionMsg logic
content = content.replace(
  /let actionMsg = `Status diubah ke \$\{newStatus\}`;\s+if \(newStatus === 'pending_camat'\) actionMsg = `Diteruskan ke Pimpinan \(Mapping oleh Reviewer\)`;\s+if \(newStatus === 'pending_target'\) actionMsg = `Disetujui Pimpinan dan diteruskan ke Target`;/,
  `let actionMsg = \`Status diubah ke \$\{newStatus\}\`;
    if (newStatus === 'pending_camat') actionMsg = \`Diteruskan ke Pimpinan (Mapping oleh Reviewer)\`;
    if (newStatus === 'pending_target') {
       const currentTaskCheck = tasks.find(t => t.id === taskId);
       if (currentTaskCheck && currentTaskCheck.status === 'pending_target') {
           actionMsg = \`Diteruskan ke Staf Pelaksana oleh Atasan\`;
       } else {
           actionMsg = \`Disetujui Pimpinan dan diteruskan ke Target\`;
       }
    }`
);

// Replace the WhatsApp message for pending_target
content = content.replace(
  /const waMsg = `\*SIMANDAT - TUGAS BARU\*\n\nHalo \*\$\{targetUser\.name\}\*,\nAnda mendapat disposisi baru dari pimpinan\.\n\n\*Dokumen:\* \$\{currentTask\.title\}\n\*Instruksi Pimpinan:\* \$\{note \|\| currentTask\.instructions \|\| '-'\}\n\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres\. Terima kasih\.`;/,
  "const senderName = user?.name || 'Pimpinan/Atasan';\n           const waMsg = `*SIMANDAT - TUGAS BARU*\\n\\nHalo *${targetUser.name}*,\\nAnda mendapat disposisi tugas baru dari *${senderName}*.\\n\\n*Dokumen:* ${currentTask.title}\\n*Instruksi:* ${note || currentTask.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
