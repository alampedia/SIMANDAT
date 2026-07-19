const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
  /targetRoles = \['sekcam'\];/,
  "targetRoles = ['sekcam', 'wakapolsek', 'wadanramil', 'kasdim', 'kasat'];"
);
content = content.replace(
  /targetRoles = \['camat'\];/,
  "targetRoles = ['camat', 'kapolsek', 'danramil'];"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
