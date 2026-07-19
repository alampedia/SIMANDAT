const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// In addTask
content = content.replace(
  /return targetRoles\.some\(r => uRoleLower\.includes\(r\)\) && \(\!u\.opd \|\| u\.opd === \(task\.opd \|\| user\.opd\)\);/,
  "return targetRoles.some(r => uRoleLower.includes(r)) && (!u.opd || u.opd === (task.opd || user.opd) || (user?.role || '').toLowerCase() === 'admin');"
);

// In updateTaskStatus for camats
content = content.replace(
  /return \(uRoleLower\.includes\('camat'\) \|\| uRoleLower\.includes\('kapolsek'\) \|\| uRoleLower\.includes\('danramil'\)\) && \(\!u\.opd \|\| u\.opd === user\.opd\);/,
  "return (uRoleLower.includes('camat') || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil')) && (!u.opd || u.opd === user.opd || (user?.role || '').toLowerCase() === 'admin');"
);

// In updateTaskStatus for atasans
content = content.replace(
  /return \(uRoleLower\.includes\('camat'\) \|\| uRoleLower\.includes\('kapolsek'\) \|\| uRoleLower\.includes\('danramil'\) \|\| uRoleLower\.includes\('sekcam'\)\) && \(\!u\.opd \|\| u\.opd === user\.opd\);/,
  "return (uRoleLower.includes('camat') || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil') || uRoleLower.includes('sekcam')) && (!u.opd || u.opd === user.opd || (user?.role || '').toLowerCase() === 'admin');"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
