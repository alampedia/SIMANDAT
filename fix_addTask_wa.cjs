const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const addTaskLogic = `  const addTask = async (task: Omit<DisposisiTask, 'id' | 'history'>) => {
    const id = \`ND-\${new Date().getTime().toString().slice(-4)}\`;
    const historyUpdate = { date: new Date().toISOString(), action: 'Naskah dibuat dan diteruskan ke Reviewer', actor: user?.name || 'Sistem' };
    
    // Default fallback locally
    setTasks(prev => [{ id, ...task, history: [historyUpdate] }, ...prev]);
    
    // ----- WHATSAPP FONNTE LOGIC -----
    if (config.waApiKey && user) {
       let targetRoles = [];
       if (task.status === 'pending_sekcam' || !task.status) {
           targetRoles = ['sekcam', 'wakapolsek', 'wadanramil', 'kasdim', 'kasat'];
       } else if (task.status === 'pending_camat') {
           targetRoles = ['camat', 'kapolsek', 'danramil'];
       }
       
       if (targetRoles.length > 0) {
           const targets = dbUsers.filter(u => {
               const uRoleLower = (u.role || '').toLowerCase();
               return targetRoles.some(r => uRoleLower.includes(r)) && (!u.opd || u.opd === (task.opd || user.opd));
           });
           
           for (const target of targets) {
              if (target.phone) {
                 const waMsg = \`*SIMANDAT - NASKAH MASUK*\\n\\nHalo *\${target.name}*,\\n\\nAda naskah dinas baru yang perlu direview/didisposisikan:\\n*Nomor Surat:* \${task.nomorSurat || '-'}\\n*Dokumen:* \${task.title}\\n*Pengirim:* \${task.sender}\\n\\nSilakan cek aplikasi SIMANDAT.\`;
                 import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, target.phone, waMsg));
              }
           }
       } else if (task.status === 'pending_target' && task.assignedTo) {
           const targetUser = dbUsers.find(u => u.name === task.assignedTo || u.username === task.assignedTo);
           if (targetUser && targetUser.phone) {
               const waMsg = \`*SIMANDAT - TUGAS BARU*\\n\\nHalo *\${targetUser.name}*,\\nAnda mendapat disposisi langsung dari pimpinan.\\n\\n*Dokumen:* \${task.title}\\n*Instruksi Pimpinan:* \${task.instructions || '-'}\\n\\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.\`;
               import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, targetUser.phone, waMsg));
           }
       }
    }
    // ---------------------------------
`;

content = content.replace(
  /const addTask = async \(task: Omit<DisposisiTask, 'id' \| 'history'>\) => \{[\s\S]*?setTasks\(prev => \[\{ id, \.\.\.task, history: \[historyUpdate\] \}, \.\.\.prev\]\);/,
  addTaskLogic
);

fs.writeFileSync('src/context/AppContext.tsx', content);
