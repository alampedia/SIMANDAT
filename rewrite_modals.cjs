const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// The corrupted block starts from `{isNewDocOpen && (` and ends right before `{/* Detail Document Modal */}`
const corruptedRegex = /\{isNewDocOpen && \([\s\S]*?Kir[\s\S]*?Instruksi\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*(?=\{[\s]*\/\*\s*Detail Document Modal\s*\*\/)/;

const newModals = `{isNewDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg">Input Naskah Baru</h2>
              <button onClick={() => setIsNewDocOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="form-naskah" onSubmit={handleCreateDoc} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    required
                    value={newDoc.nomorSurat}
                    onChange={e => setNewDoc({...newDoc, nomorSurat: e.target.value})}
                    placeholder="Contoh: 005/123/SETDA/2026"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Perihal / Judul Naskah</label>
                  <input
                    type="text"
                    required
                    value={newDoc.title}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                    placeholder="Contoh: Undangan Rapat Koordinasi"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instansi / Pengirim</label>
                  <input
                    type="text"
                    required
                    value={newDoc.sender}
                    onChange={e => setNewDoc({...newDoc, sender: e.target.value})}
                    placeholder="Contoh: Sekretariat Daerah"
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Naskah</label>
                    <div className="relative">
                      <select 
                        value={newDoc.type}
                        onChange={e => setNewDoc({...newDoc, type: e.target.value as any})}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                      >
                        <option value="masuk">Masuk</option>
                        <option value="keluar">Keluar</option>
                        <option value="arsip">Arsip</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan / Kepada (Opsional)</label>
                    <div className="relative">
                      <select 
                        value={newDoc.assignedTo}
                        onChange={e => setNewDoc({...newDoc, assignedTo: e.target.value})}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                      >
                        <option value="">-- Pilih --</option>
                        {usersList.map(u => (
                          <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setIsNewDocOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                type="submit" form="form-naskah"
                className="px-6 py-2 text-sm font-bold text-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                style={{ backgroundColor: config.primaryColor }}
              >
                Simpan Naskah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disposisi Modal */}
      {disposisiDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDisposisiDoc(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Tindak Lanjut / Disposisi</h2>
              <button onClick={() => setDisposisiDoc(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Dokumen</p>
                <p className="font-medium text-gray-900">{disposisiDoc.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">Dari: {disposisiDoc.sender}</p>
              </div>

              <form id="form-disposisi" onSubmit={handleDisposisi} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan Disposisi / Mapping Target</label>
                  <div className="relative">
                    <select 
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
                             if (!uRoleLower.includes('pelaksana') && !uRoleLower.includes('staf')) return false;
                             const myTitleWords = (user?.title || '').toLowerCase().replace(/kepala|seksi|sub|bag|bagian|&/g, '').trim().split(/\\s+/);
                             const uTitleLower = (u.title || '').toLowerCase();
                             const hasMatch = myTitleWords.some(word => word.length > 3 && uTitleLower.includes(word));
                             if (myTitleWords.length > 0 && myTitleWords.some(w => w.length > 3)) {
                                 if (!hasMatch) return false;
                             }
                             return true;
                         }
                         return !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                      }).map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Tipe Disposisi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Mapping Tugas</label>
                  <div className="relative">
                    <select 
                      required
                      value={disposisiForm.disposisiType}
                      onChange={e => setDisposisiForm({...disposisiForm, disposisiType: e.target.value as any})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="reguler">Tugas Reguler (Dapat Dimapping Lanjut)</option>
                      <option value="akhir">Tugas Akhir (Harus Dikerjakan Target)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Arahan Khusus</label>
                  <textarea
                    required
                    rows={3}
                    value={disposisiForm.catatan}
                    onChange={e => setDisposisiForm({...disposisiForm, catatan: e.target.value})}
                    placeholder="Contoh: Tolong siapkan draft bahan tayang rapat ini segera."
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batas Waktu (Deadline) opsional</label>
                  <input
                    type="datetime-local"
                    value={disposisiForm.deadline}
                    onChange={e => setDisposisiForm({...disposisiForm, deadline: e.target.value})}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setDisposisiDoc(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                type="submit" form="form-disposisi"
                className="px-6 py-2 text-sm font-bold flex items-center gap-2 text-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Send size={16} /> Kirim Instruksi
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(corruptedRegex, newModals);
fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
