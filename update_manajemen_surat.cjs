const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// 1. Update filterDocs to use type
content = content.replace(
  /const filteredDocs = tasks\.filter\(doc => activeTab === 'masuk' \? true : false\); \/\/ simplifies logic to show all in masuk for now/,
  "const filteredDocs = tasks.filter(doc => (doc.type || 'masuk') === activeTab);"
);

// 2. update newDoc state
content = content.replace(
  /const \[newDoc, setNewDoc\] = useState\(\{[\s\S]*?\}\);/,
  `const [newDoc, setNewDoc] = useState({\n    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''\n  });`
);

// 3. update handleCreateDoc to use newDoc.type
content = content.replace(
  /priority: newDoc\.priority,\n\s*driveUrl: newDoc\.driveUrl,/,
  "priority: newDoc.priority,\n      driveUrl: newDoc.driveUrl,\n      type: newDoc.type as any,"
);

// 4. Update disposisiForm state
content = content.replace(
  /const \[disposisiForm, setDisposisiForm\] = useState\(\{[\s\S]*?\}\);/,
  `const [disposisiForm, setDisposisiForm] = useState({\n    instruksi: 'Tindaklanjuti', catatan: '', tujuan: '', deadline: '', disposisiType: 'reguler'\n  });`
);

// 5. Update handleDisposisi
content = content.replace(
  /let newStatus: any = 'pending_camat';[\s\S]*?setDisposisiForm\(\{ instruksi: 'Tindaklanjuti', catatan: '', tujuan: '', deadline: '' \}\);/,
  `let newStatus: any = 'pending_camat';
    if (isReviewer) {
        newStatus = 'pending_camat';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline, disposisiForm.disposisiType as any);
    } else if (isPimpinanPuncak) {
        newStatus = 'pending_target';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline, disposisiForm.disposisiType as any);
    } else {
        newStatus = 'in_progress';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline, disposisiForm.disposisiType as any);
    }
    addNotification(\`Surat berhasil didisposisikan ke \${disposisiForm.tujuan}.\`);
    setDisposisiDoc(null);
    setDisposisiForm({ instruksi: 'Tindaklanjuti', catatan: '', tujuan: '', deadline: '', disposisiType: 'reguler' });`
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
