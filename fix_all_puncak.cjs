const fs = require('fs');

const files = [
  'src/pages/user/ManajemenSurat.tsx',
  'src/pages/user/CetakLaporan.tsx',
  'src/pages/user/PageDisposisi.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /\(roleLower\.includes\('camat'\) && !roleLower\.includes\('sekcam'\) && !roleLower\.includes\('sekretaris'\)\) \|\| roleLower\.includes\('kapolsek'\) \|\| roleLower\.includes\('danramil'\)/g,
      "(roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris'))"
    );
    
    content = content.replace(
      /const isPimpinanU = \(uRoleLower\.includes\('camat'\) && !uRoleLower\.includes\('sekcam'\) && !uRoleLower\.includes\('sekretaris'\)\) \|\| uRoleLower\.includes\('kapolsek'\) \|\| uRoleLower\.includes\('danramil'\);/g,
      "const isPimpinanU = (uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris'));"
    );
    
    fs.writeFileSync(file, content);
  }
});
