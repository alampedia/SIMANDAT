const fs = require('fs');
let content = fs.readFileSync('src/pages/user/PageDisposisi.tsx', 'utf8');

content = content.replace(
  /const isPimpinanU = \(uRoleLower\.includes\('camat'\) && !uRoleLower\.includes\('sekcam'\) && !uRoleLower\.includes\('sekretaris'\)\);\n\s*return !isPimpinanU && \(!user\?\.opd \|\| u\.opd === user\?\.opd\);/g,
  `const isPimpinanU = (uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris'));
                             const isLuarKecamatan = uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                             return !isPimpinanU && !isLuarKecamatan && (!user?.opd || u.opd === user?.opd);`
);

fs.writeFileSync('src/pages/user/PageDisposisi.tsx', content);
