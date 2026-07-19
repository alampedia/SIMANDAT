const fs = require('fs');
let dFile = fs.readFileSync('src/pages/user/DisposisiMasuk.tsx', 'utf8');
dFile = dFile.replace(
  /const isKasiOrKasubag = \(user\?\.role \|\| ''\)\.toLowerCase\(\)\.includes\('kasi'\) \|\| \(user\?\.role \|\| ''\)\.toLowerCase\(\)\.includes\('kasubag'\);/,
  "const isKasiOrKasubag = (user?.role || '').toLowerCase().includes('kasi') || (user?.role || '').toLowerCase().includes('kasubag') || (user?.role || '').toLowerCase().includes('kabag');"
);
fs.writeFileSync('src/pages/user/DisposisiMasuk.tsx', dFile);

let mFile = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');
mFile = mFile.replace(
  /if \(myRoleLower\.includes\('kasi'\) \|\| myRoleLower\.includes\('kasubag'\)\) \{/,
  "if (myRoleLower.includes('kasi') || myRoleLower.includes('kasubag') || myRoleLower.includes('kabag')) {"
);
fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', mFile);
