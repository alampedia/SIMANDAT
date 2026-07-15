const fs = require('fs');
const content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

const targetDropdown = `
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target / Arah Surat</label>
                  <div className="relative">
                    <select 
                      value={newDoc.assignedTo}
                      onChange={e => setNewDoc({...newDoc, assignedTo: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                    >
                      <option value="" disabled>-- Pilih Target Pejabat --</option>
                      {usersList.filter(u => {
                         return u.role !== 'admin' && (!user?.opd || u.opd === user?.opd);
                      }).map(u => (
                         <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
`;

const updated = content.replace(
  /<\/div>\n\s*<\/form>\n\s*<\/div>/,
  "</div>\n" + targetDropdown + "\n              </form>\n            </div>"
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', updated);
