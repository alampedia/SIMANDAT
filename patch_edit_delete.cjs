const fs = require('fs');
const content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// Add updateTask, deleteTask
let updated = content.replace(
  /const { config, user, tasks, addTask, updateTaskStatus, addNotification, usersList } = useAppContext\(\);/,
  "const { config, user, tasks, addTask, updateTaskStatus, updateTask, deleteTask, addNotification, usersList } = useAppContext();"
);

// Add edit states
const editStates = `
  const [editDoc, setEditDoc] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '' });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    updateTask(editDoc.id, {
       nomorSurat: editForm.nomorSurat,
       title: editForm.title,
       sender: editForm.sender,
       priority: editForm.priority,
       driveUrl: editForm.driveUrl,
       assignedTo: editForm.assignedTo
    });
    setEditDoc(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus naskah ini?")) {
      deleteTask(id);
    }
  };
`;

updated = updated.replace(
  /const \[newDoc, setNewDoc\] = useState/,
  editStates + "\n  const [newDoc, setNewDoc] = useState"
);

// Add Edit / Delete buttons
const buttons = `
                        <button onClick={() => doc.driveUrl ? window.open(doc.driveUrl, "_blank") : alert("Link dokumen tidak tersedia.")} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                           <ExternalLink size={14} />
                           Buka Detail
                        </button>
                        {(isReviewer || doc.sender === user?.name) && (
                           <>
                             <button onClick={() => {
                                setEditDoc(doc);
                                setEditForm({
                                  nomorSurat: doc.nomorSurat || '',
                                  title: doc.title || '',
                                  sender: doc.sender || '',
                                  type: 'masuk',
                                  priority: doc.priority || 'Biasa',
                                  driveUrl: doc.driveUrl || '',
                                  assignedTo: doc.assignedTo || ''
                                });
                             }} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                                Edit
                             </button>
                             <button onClick={() => handleDelete(doc.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                                Hapus
                             </button>
                           </>
                        )}
`;

updated = updated.replace(
  /<button onClick=\{\(\) => doc\.driveUrl \? window\.open\(doc\.driveUrl, "_blank"\) : alert\("Link dokumen tidak tersedia\."\)\} className="flex-1 sm:flex-none flex items-center justify-center gap-1\.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">\s*<ExternalLink size=\{14\} \/>\s*Buka Detail\s*<\/button>/,
  buttons.trim()
);

// Add Edit Modal JSX (at the end)
const editModal = `
      {/* Edit Document Modal */}
      {editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setEditDoc(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Edit Naskah</h2>
              <button onClick={() => setEditDoc(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="editDocForm" onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    value={editForm.nomorSurat}
                    onChange={e => setEditForm({...editForm, nomorSurat: e.target.value})}
                    placeholder="Contoh: 005/123/SETDA/2026"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Perihal / Judul Naskah</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Contoh: Undangan Rapat Koordinasi"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instansi / Pengirim</label>
                  <input
                    type="text"
                    required
                    value={editForm.sender}
                    onChange={e => setEditForm({...editForm, sender: e.target.value})}
                    placeholder="Contoh: Sekretariat Daerah"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Derajat Keamanan / Prioritas</label>
                    <select 
                      value={editForm.priority}
                      onChange={e => setEditForm({...editForm, priority: e.target.value})}
                      className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Segera">Segera</option>
                      <option value="Mendesak">Mendesak</option>
                      <option value="Sangat Rahasia">Sangat Rahasia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL dari Drive (Bersifat Opsional)</label>
                  <input
                    type="url"
                    value={editForm.driveUrl}
                    onChange={e => setEditForm({...editForm, driveUrl: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target / Arah Surat</label>
                  <div className="relative">
                    <select 
                      value={editForm.assignedTo}
                      onChange={e => setEditForm({...editForm, assignedTo: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
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
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setEditDoc(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="editDocForm"
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
`;

updated = updated.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/m, editModal + "\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', updated);
