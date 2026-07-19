const user = { role: 'kasi pempel' };
const menuConfig = [
    { roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam'] }
];
const accessibleMenus = menuConfig.filter(menu => {
     let userRole = (user?.role || '').toLowerCase().trim();
     let mappedRole = userRole;

     if (userRole === 'admin') {
         mappedRole = 'admin';
     } else if (['pelaksana', 'sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'].some(r => userRole.includes(r)) || userRole.includes('staf')) {
         mappedRole = 'staf_pelaksana';
     } else if (userRole.includes('kasi')) {
         mappedRole = 'kasi';
     } else if (userRole.includes('kasubag')) {
         mappedRole = 'kasubag';
     } else if (userRole.includes('kabag')) {
         mappedRole = 'kabag';
     } else if (userRole.includes('sekcam') || userRole.includes('wakapolsek') || userRole.includes('wadanramil') || userRole.includes('kasdim') || userRole.includes('kasat')) {
         mappedRole = 'sekcam';
     } else if (userRole.includes('danramil') || userRole.includes('kapolsek') || (userRole.includes('camat') && !userRole.includes('sekcam') && !userRole.includes('sekretaris'))) {
         mappedRole = 'camat';
     }
     
     if (mappedRole === 'admin') return true;
     return menu.roles.includes(mappedRole);
});
console.log(accessibleMenus.length);
