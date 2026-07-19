const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace the WhatsApp message for pending_target
content = content.replace(
  /const waMsg = `\*SIMANDAT - TUGAS BARU\*\n\nHalo \*\$\{targetUser\.name\}\*,\nAnda mendapat disposisi baru dari pimpinan\.\n\n\*Dokumen:\* \$\{currentTask\.title\}\n\*Instruksi Pimpinan:\* \$\{note \|\| currentTask\.instructions \|\| '-'\}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres\. Terima kasih\.`;/,
  "const senderName = user?.name || 'Pimpinan/Atasan';\n           const waMsg = `*SIMANDAT - TUGAS BARU*\\n\\nHalo *${targetUser.name}*,\\nAnda mendapat disposisi tugas baru dari *${senderName}*.\\n\\n*Dokumen:* ${currentTask.title}\\n*Instruksi:* ${note || currentTask.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;"
);

// Second attempt just in case the first one doesn't match
content = content.replace(
  "const waMsg = `*SIMANDAT - TUGAS BARU*\\n\\nHalo *${targetUser.name}*,\\nAnda mendapat disposisi baru dari pimpinan.\\n\\n*Dokumen:* ${currentTask.title}\\n*Instruksi Pimpinan:* ${note || currentTask.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;",
  "const senderName = user?.name || 'Pimpinan/Atasan';\n           const waMsg = `*SIMANDAT - TUGAS BARU*\\n\\nHalo *${targetUser.name}*,\\nAnda mendapat disposisi tugas baru dari *${senderName}*.\\n\\n*Dokumen:* ${currentTask.title}\\n*Instruksi:* ${note || currentTask.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
