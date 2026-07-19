const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /const \[newDoc, setNewDoc\] = useState\(\{\n    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''\n  \}\);/,
  "const [newDoc, setNewDoc] = useState({ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '', tindakLanjut: 'verifikasi_sekcam' });"
);

// We should also check line 51 if it was a single line
content = content.replace(
  /const \[newDoc, setNewDoc\] = useState\(\{    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''  \}\);/,
  "const [newDoc, setNewDoc] = useState({ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '', tindakLanjut: 'verifikasi_sekcam' });"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
