const fs = require('fs');
let content = fs.readFileSync('src/pages/user/PageDisposisi.tsx', 'utf8');

// Add state for active tab
content = content.replace(
  /const \[disposisiForm, setDisposisiForm\] = useState/,
  `const [targetTab, setTargetTab] = useState<'pegawai' | 'kapolsek' | 'danramil'>('pegawai');\n  const [disposisiForm, setDisposisiForm] = useState`
);

// Replace the Target Pejabat / Staf section
const oldTarget = `<div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Target Pejabat / Staf</label>
                 <div className="relative">
                   <select 
                      required={isReviewer || !selectedTask.assignedTo}
                      value={disposisiForm.tujuan}
                      onChange={(e) => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                   >
                      <option value="" disabled>-- Pilih Pejabat / Staf Tujuan --</option>
                      {usersList.filter(u => {
                         const uRoleLower = (u.role || '').toLowerCase();
                         const isPimpinanU = (uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')) || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                         return u.role !== 'admin' && !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                      }).map(u => (
                         <option key={u.id} value={u.name}>
                            {u.name} ({u.title})
                         </option>
                      ))}
                   </select>
                   <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={18} />
                 </div>
               </div>`;

const newTarget = `<div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Target Pejabat / Staf</label>
                 {isReviewer ? (
                   <div className="mb-3 flex rounded-xl bg-gray-100 p-1">
                     <button
                       type="button"
                       onClick={() => { setTargetTab('pegawai'); setDisposisiForm({...disposisiForm, tujuan: ''}); }}
                       className={\`flex-1 rounded-lg py-2 text-xs font-bold transition-all \${targetTab === 'pegawai' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}\`}
                     >
                       Pegawai Kecamatan
                     </button>
                     <button
                       type="button"
                       onClick={() => { setTargetTab('kapolsek'); setDisposisiForm({...disposisiForm, tujuan: ''}); }}
                       className={\`flex-1 rounded-lg py-2 text-xs font-bold transition-all \${targetTab === 'kapolsek' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}\`}
                     >
                       Kapolsek
                     </button>
                     <button
                       type="button"
                       onClick={() => { setTargetTab('danramil'); setDisposisiForm({...disposisiForm, tujuan: ''}); }}
                       className={\`flex-1 rounded-lg py-2 text-xs font-bold transition-all \${targetTab === 'danramil' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}\`}
                     >
                       Danramil
                     </button>
                   </div>
                 ) : null}
                 <div className="relative">
                   <select 
                      required={isReviewer || !selectedTask.assignedTo}
                      value={disposisiForm.tujuan}
                      onChange={(e) => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                   >
                      <option value="" disabled>-- Pilih Pejabat / Staf Tujuan --</option>
                      {usersList.filter(u => {
                         if (u.role === 'admin') return false;
                         const uRoleLower = (u.role || '').toLowerCase();
                         
                         if (isReviewer) {
                             if (targetTab === 'kapolsek') return uRoleLower.includes('kapolsek');
                             if (targetTab === 'danramil') return uRoleLower.includes('danramil');
                             // Pegawai Kecamatan
                             const isPimpinanU = (uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')) || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                             return !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                         } else {
                             const isPimpinanU = (uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')) || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                             return !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                         }
                      }).map(u => (
                         <option key={u.id} value={u.name}>
                            {u.name} ({u.title})
                         </option>
                      ))}
                   </select>
                   <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={18} />
                 </div>
               </div>`;

content = content.replace(oldTarget, newTarget);
fs.writeFileSync('src/pages/user/PageDisposisi.tsx', content);
