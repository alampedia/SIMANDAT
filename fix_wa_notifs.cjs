const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const waLogic = `    // ----- WHATSAPP FONNTE LOGIC -----
    if (newStatus === 'pending_target' && config.waApiKey) {
      const targetUserAlias = assignedTo || currentTask.assignedTo;
      if (targetUserAlias) {
        const targetUser = dbUsers.find(u => u.name === targetUserAlias || u.username === targetUserAlias);
        if (targetUser && targetUser.phone) {
           const waMsg = \`*SIMANDAT - TUGAS BARU*\\n\\nHalo *\${targetUser.name}*,\\nAnda mendapat disposisi baru dari pimpinan.\\n\\n*Dokumen:* \${currentTask.title}\\n*Instruksi Pimpinan:* \${note || currentTask.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.\`;
           import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, targetUser.phone, waMsg));
        }
      }
    }
    
    if (newStatus === 'pending_camat' && config.waApiKey && user) {
       const camats = dbUsers.filter(u => {
           const uRoleLower = (u.role || '').toLowerCase();
           return (uRoleLower.includes('camat') || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil')) && (!u.opd || u.opd === user.opd);
       });
       for (const camat of camats) {
          if (camat.phone) {
             const waMsg = \`*SIMANDAT - PERSETUJUAN DISPOSISI*\\n\\nHalo *\${camat.name}*,\\n\\nAda naskah dinas masuk yang memerlukan persetujuan disposisi dari Anda:\\n*Dokumen:* \${currentTask.title}\\n*Catatan Reviewer:* \${note || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk meneruskan disposisi.\`;
             import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, camat.phone, waMsg));
          }
       }
    }

    if (newStatus === 'completed' && config.waApiKey && user) {`;

content = content.replace(
  /\/\/ ----- WHATSAPP FONNTE LOGIC -----[\s\S]*?if \(newStatus === 'completed' && config\.waApiKey && user\) \{/,
  waLogic
);

fs.writeFileSync('src/context/AppContext.tsx', content);
