const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

// Add X to imports
content = content.replace(
  /ChevronDown \} from 'lucide-react';/,
  "ChevronDown, X } from 'lucide-react';"
);

// Add states
content = content.replace(
  /const \[workingDays, setWorkingDays\] = useState<number>\(20\);/,
  `const [workingDays, setWorkingDays] = useState<number>(20);
  const [disposisiModalOpen, setDisposisiModalOpen] = useState<any>(null);
  const [disposisiForm, setDisposisiForm] = useState({ tujuan: '', instruksi: 'Tindaklanjuti' });`
);

// Add modal JSX at the very end
const modalJSX = `
      {/* Disposisi Modal untuk Kasi/Kasubag */}
      {disposisiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDisposisiModalOpen(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Disposisi ke Staf / Pelaksana</h2>
              <button onClick={() => setDisposisiModalOpen(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={(e) => { 
                e.preventDefault();
                if(!disposisiForm.tujuan) return;
                // Re-assign task to pelaksana, status remains pending_target
                updateTaskStatus(disposisiModalOpen.id, 'pending_target', disposisiForm.instruksi, disposisiForm.tujuan);
                addNotification(\`Tugas berhasil diteruskan ke \${disposisiForm.tujuan}\`);
                setDisposisiModalOpen(null);
                setDisposisiForm({ tujuan: '', instruksi: 'Tindaklanjuti' });
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Staf Pelaksana</label>
                  <div className="relative">
                    <select 
                      required
                      value={disposisiForm.tujuan}
                      onChange={e => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>-- Pilih Staf --</option>
                      {usersList.filter(u => {
                        if (!isStaffRole(u.role)) return false;
                        
                        if (user && isManagerRole(user.role)) {
                            if (!isSubordinate(user, u)) return false;
                        }
                        
                        const uOpd = (u.opd || '').toLowerCase(); const mOpd = (user?.opd || '').toLowerCase(); return !mOpd || uOpd === mOpd || uOpd.includes(mOpd) || mOpd.includes(uOpd);
                      }).map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instruksi Tambahan</label>
                  <input
                    type="text"
                    value={disposisiForm.instruksi}
                    onChange={e => setDisposisiForm({...disposisiForm, instruksi: e.target.value})}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setDisposisiModalOpen(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200">Batal</button>
                  <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 flex items-center gap-2"><Send size={14}/> Teruskan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\n  \);\n\}\n?$/, modalJSX);

// Replace the Link with a Button that opens the modal
content = content.replace(
  /<Link\n\s*to="\/disposisi-masuk"\n\s*className="w-full md:w-auto flex items-center justify-center gap-1\.5 text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-all active:scale-95 mt-0 md:mt-2"\n\s*>\n\s*<Send size=\{14\} \/> \n\s*Mapping Bawahan\n\s*<\/Link>/,
  `<button
                              onClick={() => setDisposisiModalOpen(task)}
                              className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-all active:scale-95 mt-0 md:mt-2"
                            >
                              <Send size={14} /> 
                              Mapping Bawahan
                            </button>`
);

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
