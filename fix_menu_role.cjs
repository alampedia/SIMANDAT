const fs = require('fs');
let content = fs.readFileSync('src/pages/menu/MobileMenu.tsx', 'utf8');

content = content.replace(
  /else if \(userRole\.includes\('kasi'\)\) \{/,
  "else if (userRole.includes('kasi') || userRole.includes('kapolsek') || userRole.includes('danramil')) {"
);

content = content.replace(
  /else if \(userRole\.includes\('danramil'\) \|\| userRole\.includes\('kapolsek'\) \|\| \(userRole\.includes\('camat'\) && !userRole\.includes\('sekcam'\) && !userRole\.includes\('sekretaris'\)\)\) \{/,
  "else if (userRole.includes('camat') && !userRole.includes('sekcam') && !userRole.includes('sekretaris')) {"
);

fs.writeFileSync('src/pages/menu/MobileMenu.tsx', content);

let utils = fs.readFileSync('src/lib/utils.ts', 'utf8');
utils = utils.replace(
  /return r\.includes\('kasi'\) \|\| r\.includes\('kasubag'\) \|\| r\.includes\('kabag'\) \|\| r\.includes\('kanit'\);/,
  "return r.includes('kasi') || r.includes('kasubag') || r.includes('kabag') || r.includes('kanit') || r.includes('kapolsek') || r.includes('danramil');"
);
fs.writeFileSync('src/lib/utils.ts', utils);

