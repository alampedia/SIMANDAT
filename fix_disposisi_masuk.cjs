const fs = require('fs');
let content = fs.readFileSync('src/pages/user/DisposisiMasuk.tsx', 'utf8');

content = content.replace(
  /<h1 className="text-2xl font-bold text-gray-900">Disposisi Masuk<\/h1>/,
  '<h1 className="text-2xl font-bold text-gray-900">Kotak Tugas & Mapping</h1>'
);

content = content.replace(
  /<p className="text-gray-500 text-sm mt-1">Daftar naskah dan tugas dari pimpinan yang tertuju pada Anda\.<\/p>/,
  '<p className="text-gray-500 text-sm mt-1">Daftar tugas yang perlu diselesaikan atau dipetakan ke pelaksana.</p>'
);

fs.writeFileSync('src/pages/user/DisposisiMasuk.tsx', content);
