const fs = require('fs');

let utilsContent = fs.readFileSync('src/lib/utils.ts', 'utf8');

utilsContent = utilsContent.replace(
  /export function isSubordinate[\s\S]*?return mWords\.some\(w => sWords\.includes\(w\)\);\n\}/,
  `export function isSubordinate(manager: { title?: string, role?: string, unitOrganisasi?: string }, staff: { title?: string, role?: string, unitOrganisasi?: string }): boolean {
    const getWords = (str: string) => (str || '').toLowerCase().replace(/kepala|kasi|kasubag|sub bagian|subbag|bagian|seksi|pelaksana|staf|role/g, ' ').trim().split(/\\s+/).filter(w => w.length > 2);
    
    if (manager.unitOrganisasi && staff.unitOrganisasi) {
        const mUnitWords = getWords(manager.unitOrganisasi);
        const sUnitWords = getWords(staff.unitOrganisasi);
        
        if (mUnitWords.length > 0 && mUnitWords.some(w => sUnitWords.includes(w))) {
             return true;
        }
    }
    
    const mWords = [...getWords(manager.title || ''), ...getWords(manager.role || ''), ...getWords(manager.unitOrganisasi || '')];
    const sWords = [...getWords(staff.title || ''), ...getWords(staff.role || ''), ...getWords(staff.unitOrganisasi || '')];
    
    if (mWords.length === 0) return true;
    return mWords.some(w => sWords.includes(w));
}`
);

fs.writeFileSync('src/lib/utils.ts', utilsContent);
