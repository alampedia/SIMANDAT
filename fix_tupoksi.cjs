const fs = require('fs');
let content = fs.readFileSync('src/pages/user/TupoksiPage.tsx', 'utf8');

// The UI reverts because initialTupoksi is still the old user.tupoksi.
// Let's make initialTupoksi be updated to editedTupoksi when save succeeds.
const replaceFrom = `const initialTupoksi = user?.tupoksi ? user.tupoksi.split('\\n').filter(Boolean) : defaultTupoksi;
  const [editedTupoksi, setEditedTupoksi] = useState<string[]>(initialTupoksi);
  const activeTupoksi = isEditing ? editedTupoksi : initialTupoksi;`;

const replaceTo = `const [initialTupoksi, setInitialTupoksi] = useState<string[]>(user?.tupoksi ? user.tupoksi.split('\\n').filter(Boolean) : defaultTupoksi);
  const [editedTupoksi, setEditedTupoksi] = useState<string[]>(initialTupoksi);
  const activeTupoksi = isEditing ? editedTupoksi : initialTupoksi;`;

content = content.replace(replaceFrom, replaceTo);

content = content.replace(
  /setIsEditing\(false\);/,
  "setInitialTupoksi(editedTupoksi);\n        setIsEditing(false);"
);

fs.writeFileSync('src/pages/user/TupoksiPage.tsx', content);
