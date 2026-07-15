cat << 'INNER_EOF' > patch_newdoc_effect.cjs
const fs = require('fs');
const content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

const effectCode = `
  React.useEffect(() => {
    if (isNewDocOpen && !newDoc.assignedTo) {
      const sekcam = usersList.find(u => {
        const uRole = (u.role || '').toLowerCase();
        return uRole.includes('sekcam') || uRole.includes('wakapolsek') || uRole.includes('wadanramil') || uRole.includes('kasdim') || uRole.includes('kasat');
      });
      if (sekcam) {
        setNewDoc(prev => ({ ...prev, assignedTo: sekcam.name }));
      }
    }
  }, [isNewDocOpen, usersList, newDoc.assignedTo]);
`;

let updated = content;
if (!updated.includes('React.useEffect(() => {\\n    if (isNewDocOpen && !newDoc.assignedTo)')) {
  updated = updated.replace(
    /const \[newDoc, setNewDoc\] = useState[^;]+;/,
    "const [newDoc, setNewDoc] = useState({\n    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''\n  });\n" + effectCode
  );
}

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', updated);
INNER_EOF
node patch_newdoc_effect.cjs
