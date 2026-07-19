import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isStaffRole(role: string): boolean {
    const r = (role || '').toLowerCase();
    return r.includes('pelaksana') || r.includes('staf') || ['sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'].includes(r);
}

export function isManagerRole(role: string): boolean {
    const r = (role || '').toLowerCase();
    return r.includes('kasi') || r.includes('kasubag') || r.includes('kabag') || r.includes('kanit') || r.includes('kapolsek') || r.includes('danramil');
}

export function isSubordinate(manager: { title?: string, role?: string, unitOrganisasi?: string }, staff: { title?: string, role?: string, unitOrganisasi?: string }): boolean {
    const mStr = ((manager.role || '') + ' ' + (manager.title || '') + ' ' + (manager.unitOrganisasi || '')).toLowerCase();
    const sStr = ((staff.role || '') + ' ' + (staff.title || '') + ' ' + (staff.unitOrganisasi || '')).toLowerCase();
    
    if (mStr.includes('pempel') && sStr.includes('pempel')) return true;
    if (mStr.includes('kesos') && sStr.includes('kesos')) return true;
    if (mStr.includes('umum') && sStr.includes('umum')) return true;
    if ((mStr.includes('trantib') || mStr.includes('tantrib')) && (sStr.includes('trantib') || sStr.includes('tantrib'))) return true;
    if (mStr.includes('tpk') && sStr.includes('tpk')) return true;
    if (mStr.includes('ppk') && sStr.includes('ppk')) return true;
    if (mStr.includes('pemerintahan') && sStr.includes('pemerintahan')) return true;
    if (mStr.includes('pelayanan') && sStr.includes('pelayanan')) return true;
    if (mStr.includes('keuangan') && sStr.includes('keuangan')) return true;

    const getWords = (str: string) => (str || '').toLowerCase().replace(/kepala|kasi|kasubag|sub bagian|subbag|bagian|seksi|pelaksana|staf|role/g, ' ').trim().split(/\s+/).filter(w => w.length > 3 && w !== 'kecamatan' && w !== 'kraton');
    
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
}
