const getWords = (str) => (str || '').toLowerCase().replace(/kepala|kasi|kasubag|sub bagian|subbag|bagian|seksi|pelaksana|staf|role/g, ' ').trim().split(/\s+/).filter(w => w.length > 2);
    
function isSubordinate(manager, staff) {
    const mWords = [...getWords(manager.title || ''), ...getWords(manager.role || ''), ...getWords(manager.unitOrganisasi || '')];
    const sWords = [...getWords(staff.title || ''), ...getWords(staff.role || ''), ...getWords(staff.unitOrganisasi || '')];
    
    if (mWords.length === 0) return true; // Fallback if manager has no specific section title
    console.log({mWords, sWords});
    return mWords.some(w => sWords.includes(w));
}

console.log(isSubordinate({role: 'kasi pempel'}, {role: 'pelaksana seksi pempel'}));
console.log(isSubordinate({role: 'kasi kesos'}, {role: 'pelaksana seksi kesos'}));
console.log(isSubordinate({role: 'kasubag umum'}, {role: 'pelaksana seksi umum'}));
console.log(isSubordinate({role: 'kasi tantrib'}, {role: 'pelaksana seksi tantrib'}));
console.log(isSubordinate({role: 'kasubag tpk'}, {role: 'pelaksana seksi tpk'}));

