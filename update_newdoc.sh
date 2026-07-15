cat << 'INNER_EOF' > patch_manajemen_surat.cjs
const fs = require('fs');
const content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// Update state
let updated = content.replace(
  /const \[newDoc, setNewDoc\] = useState\(\{\n\s*nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: ''\n\s*\}\);/,
  "const [newDoc, setNewDoc] = useState({\n    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''\n  });"
);

// Update handleCreateDoc
const newHandleCreateDoc = `
  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;
    
    const targetUser = usersList.find(u => u.name === newDoc.assignedTo);
    let newStatus = 'pending_sekcam';
    if (targetUser) {
        const uRole = targetUser.role.toLowerCase();
        if (uRole.includes('sekcam') || uRole.includes('wakapolsek') || uRole.includes('wadanramil') || uRole.includes('kasdim') || uRole.includes('kasat')) {
            newStatus = 'pending_sekcam';
        } else if (uRole.includes('camat') || uRole.includes('kapolsek') || uRole.includes('danramil')) {
            newStatus = 'pending_camat';
        } else {
            newStatus = 'pending_target';
        }
    }

    // Add task to global state
    addTask({
      nomorSurat: newDoc.nomorSurat,
      title: newDoc.title,
      sender: newDoc.sender,
      date: new Date().toISOString(),
      status: newStatus as any,
      priority: newDoc.priority,
      driveUrl: newDoc.driveUrl,
      assignedTo: newDoc.assignedTo,
      progress: 0
    });

    // The notification is handled in addTask mostly, but we can keep UI updates
    setIsNewDocOpen(false);
    setNewDoc({ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '' });
  };
`;

updated = updated.replace(
  /const handleCreateDoc = \(e: React\.FormEvent\) => \{[\s\S]*?setNewDoc\(\{ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '' \}\);\n  \};/,
  newHandleCreateDoc.trim()
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', updated);
INNER_EOF
node patch_manajemen_surat.cjs
