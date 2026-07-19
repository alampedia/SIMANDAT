const fs = require('fs');
let content = fs.readFileSync('src/pages/menu/MobileMenu.tsx', 'utf8');

content = content.replace(
  /label: 'Disposisi Masuk',/,
  "label: 'Kotak Tugas & Mapping',"
);

fs.writeFileSync('src/pages/menu/MobileMenu.tsx', content);
