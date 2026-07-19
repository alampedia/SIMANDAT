const fs = require('fs');
let content = fs.readFileSync('src/lib/utils.ts', 'utf8');

content += `
export function isStaffRole(role: string): boolean {
    const r = (role || '').toLowerCase();
    return r.includes('pelaksana') || r.includes('staf') || ['sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'].includes(r);
}

export function isManagerRole(role: string): boolean {
    const r = (role || '').toLowerCase();
    return r.includes('kasi') || r.includes('kasubag') || r.includes('kabag') || r.includes('kanit');
}

export function isSubordinate(manager: { title?: string, role?: string }, staff: { title?: string, role?: string }): boolean {
    const getWords = (str: string) => (str || '').toLowerCase().replace(/kepala|kasi|kasubag|sub bagian|subbag|bagian|seksi|pelaksana|staf|role/g, ' ').trim().split(/\\s+/).filter(w => w.length > 2);
    
    const mWords = [...getWords(manager.title || ''), ...getWords(manager.role || '')];
    const sWords = [...getWords(staff.title || ''), ...getWords(staff.role || '')];
    
    if (mWords.length === 0) return true; // Fallback if manager has no specific section title
    return mWords.some(w => sWords.includes(w));
}
`;

fs.writeFileSync('src/lib/utils.ts', content);
