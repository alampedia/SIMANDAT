const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

const modals = `
      {/* Detail Document Modal */}
      {detailDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetailDoc(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Detail Naskah</h2>
              <button onClick={() => setDetailDoc(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nomor Surat</span>
                   <p className="font-medium text-gray-900">{detailDoc.nomorSurat || '-'}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Judul / Perihal</span>
                   <p className="font-medium text-gray-900">{detailDoc.title}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Pengirim</span>
                   <p className="font-medium text-gray-900">{detailDoc.sender}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</span>
                     <p className="font-medium text-gray-900">{detailDoc.status.replace(/_/g, ' ')}</p>
                   </div>
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Prioritas</span>
                     <p className="font-medium text-gray-900">{detailDoc.priority}</p>
                   </div>
                 </div>
                 {detailDoc.driveUrl && (
                   <div className="pt-2">
                     <button onClick={() => window.open(detailDoc.driveUrl, "_blank")} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                        <ExternalLink size={16} /> Buka Dokumen Asli
                     </button>
                   </div>
                 )}
                 {(isReviewer || detailDoc.sender === user?.name) && (
                   <div className="pt-4 flex gap-2 border-t border-gray-200 mt-4">
                      <button onClick={() => {
                        setEditDoc(detailDoc);
                        setEditForm({
                          nomorSurat: detailDoc.nomorSurat || '',
                          title: detailDoc.title || '',
                          sender: detailDoc.sender || '',
                          type: 'masuk',
                          priority: detailDoc.priority || 'Biasa',
                          driveUrl: detailDoc.driveUrl || '',
                          assignedTo: detailDoc.assignedTo || ''
                        });
                        setDetailDoc(null);
                      }} className="flex-1 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => {
                         handleDelete(detailDoc.id);
                         setDetailDoc(null);
                      }} className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                        Hapus
                      </button>
                   </div>
                 )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <Clock size={18} className="text-gray-400" />
                   Riwayat & Progres
                </h3>
                <div className="space-y-4">
                  {detailDoc.history && detailDoc.history.map((h: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5"></div>
                        {idx !== detailDoc.history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex-1">
                        <p className="text-sm text-gray-800 font-medium">{h.action}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="font-bold">{h.actor}</span>
                          <span>•</span>
                          <span>{new Date(h.date).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!detailDoc.history || detailDoc.history.length === 0) && (
                    <p className="text-sm text-gray-500 italic">Belum ada riwayat.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

if (!content.includes('Detail Naskah')) {
  // Let's insert the modals before the very last `</div>`
  const lastDivIndex = content.lastIndexOf('</div>');
  content = content.slice(0, lastDivIndex) + modals + content.slice(lastDivIndex);
  fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
}
