const fs = require('fs');
let content = fs.readFileSync('src/pages/user/TupoksiPage.tsx', 'utf8');

const regex = /const initialTupoksi = user\?\.tupoksi \? user\.tupoksi\.split\('\\n'\)\.filter\(Boolean\) : defaultTupoksi;/;
content = content.replace(regex, "const [initialTupoksi, setInitialTupoksi] = useState<string[]>(user?.tupoksi ? user.tupoksi.split('\\n').filter(Boolean) : defaultTupoksi);");

fs.writeFileSync('src/pages/user/TupoksiPage.tsx', content);
