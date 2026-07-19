const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => setDisposisiDoc\(doc\)\}/g,
  "onClick={() => { setDisposisiDoc(doc); setDisposisiForm(prev => ({...prev, tujuan: doc.assignedTo || '', catatan: doc.notesSekcam || ''})); }}"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
