const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// in addTask
content = content.replace(
  /targetRoles = \['sekcam', 'wakapolsek', 'wadanramil', 'kasdim', 'kasat'\];/,
  "targetRoles = ['sekcam'];"
);
content = content.replace(
  /targetRoles = \['camat', 'kapolsek', 'danramil'\];/,
  "targetRoles = ['camat'];"
);

// in updateTaskStatus
content = content.replace(
  /targetRoles = \['camat', 'kapolsek', 'danramil'\];/,
  "targetRoles = ['camat'];"
);

content = content.replace(
  /targetRoles = \['sekcam', 'wakapolsek', 'wadanramil', 'kasdim', 'kasat'\];/,
  "targetRoles = ['sekcam'];"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
