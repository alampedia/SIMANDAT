const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => setIsNewDocOpen\(true\)\}/,
  "onClick={() => { setIsNewDocOpen(true); setNewDoc(prev => ({...prev, type: activeTab as any})); }}"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
