const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');
content = content.replace(
  /const isPimpinanPuncak = \(roleLower\.includes\('camat'\) && !roleLower\.includes\('sekcam'\) && !roleLower\.includes\('sekretaris'\)\) \|\| roleLower\.includes\('kapolsek'\) \|\| roleLower\.includes\('danramil'\);/,
  "const isPimpinanPuncak = (roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris'));"
);
fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
