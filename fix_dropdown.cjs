const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// I need to change the dropdown filtering logic for `disposisiForm.tujuan`
const targetSelectRegex = /<select [\s\S]*?value=\{disposisiForm\.tujuan\}[\s\S]*?<\/select>/;

const newTargetSelect = `<select 
                      required
                      value={disposisiForm.tujuan}
                      onChange={e => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>-- Pilih Pejabat / Staf --</option>
                      {usersList.filter(u => {
                         if (u.role === 'admin') return false;
                         const uRoleLower = (u.role || '').toLowerCase();
                         const myRoleLower = (user?.role || '').toLowerCase();
                         const isPimpinanU = uRoleLower.includes('camat') || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                         
                         if (myRoleLower.includes('kasi') || myRoleLower.includes('kasubag')) {
                             // Kasi/Kasubag can only see pelaksana under them
                             // We assume "bawahan" means they are 'pelaksana' and their title contains keywords from Kasi's title
                             if (!uRoleLower.includes('pelaksana') && !uRoleLower.includes('staf')) return false;
                             
                             // Basic heuristic: if my title is "Kasi Kesejahteraan Sosial", I only want to see Pelaksana with "Kesejahteraan" or "Sosial" in title
                             // Or simply, we just show all pelaksana in the same OPD for now, to avoid being too restrictive if title doesn't match perfectly.
                             // But let's try to match at least one significant word if possible.
                             const myTitleWords = (user?.title || '').toLowerCase().replace(/kepala|seksi|sub|bag|bagian|&/g, '').trim().split(/\\s+/);
                             const uTitleLower = (u.title || '').toLowerCase();
                             const hasMatch = myTitleWords.some(word => word.length > 3 && uTitleLower.includes(word));
                             
                             // if hasMatch is false but they are pelaksana, maybe we should just allow all pelaksana if we can't be sure?
                             // Let's enforce it if we can find a match, otherwise show all pelaksana.
                             if (myTitleWords.length > 0 && myTitleWords.some(w => w.length > 3)) {
                                 if (!hasMatch) return false;
                             }
                             return true;
                         }
                         
                         return !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                      }).map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>`;

content = content.replace(targetSelectRegex, newTargetSelect);
fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
