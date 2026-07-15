import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Filter, Plus, Archive, ExternalLink, Clock, FileText, Send, UserCheck, AlertCircle, X, ChevronDown, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ManajemenSurat() {
  const { config, user, tasks, addTask, updateTaskStatus, updateTask, deleteTask, addNotification, usersList } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar' | 'arsip'>('masuk');
  
  const roleLower = (user?.role || '').toLowerCase();
  const isPimpinanPuncak = roleLower.includes('camat') || roleLower.includes('kapolsek') || roleLower.includes('danramil');
  const isReviewer = roleLower.includes('sekcam') || roleLower.includes('wakapolsek') || roleLower.includes('wadanramil') || roleLower.includes('kasdim') || roleLower.includes('kasat') || roleLower === 'admin';

  const filteredDocs = tasks.filter(doc => activeTab === 'masuk' ? true : false); // simplifies logic to show all in masuk for now

  // Modal States
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [disposisiDoc, setDisposisiDoc] = useState<any>(null);

  // New Document Form State
  
  const [detailDoc, setDetailDoc] = useState<any>(null);
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

  const [newDoc, setNewDoc] = useState({
    nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: ''
  });

  React.useEffect(() => {
    if (isNewDocOpen && !newDoc.assignedTo) {
      const sekcam = usersList.find(u => {
        const uRole = (u.role || '').toLowerCase();
        return uRole.includes('sekcam') || uRole.includes('wakapolsek') || uRole.includes('wadanramil') || uRole.includes('kasdim') || uRole.includes('kasat');
      });
      if (sekcam) {
        setNewDoc(prev => ({ ...prev, assignedTo: sekcam.name }));
      }
    }
  }, [isNewDocOpen, usersList, newDoc.assignedTo]);


  // Disposisi Form State
  const [disposisiForm, setDisposisiForm] = useState({
    instruksi: 'Tindaklanjuti', catatan: '', tujuan: '', deadline: ''
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;
    
    const targetUser = usersList.find(u => u.name === newDoc.assignedTo);
    let newStatus = 'pending_sekcam';
    if (targetUser) {
        const uRole = targetUser.role.toLowerCase();
        if (uRole.includes('sekcam') || uRole.includes('wakapolsek') || uRole.includes('wadanramil') || uRole.includes('kasdim') || uRole.includes('kasat')) {
            newStatus = 'pending_sekcam';
        } else if (uRole.includes('camat') || uRole.includes('kapolsek') || uRole.includes('danramil')) {
            newStatus = 'pending_camat';
        } else {
            newStatus = 'pending_target';
        }
    }

    // Add task to global state
    addTask({
      nomorSurat: newDoc.nomorSurat,
      title: newDoc.title,
      sender: newDoc.sender,
      date: new Date().toISOString(),
      status: newStatus as any,
      priority: newDoc.priority,
      driveUrl: newDoc.driveUrl,
      assignedTo: newDoc.assignedTo,
      progress: 0
    });

    // The notification is handled in addTask mostly, but we can keep UI updates
    setIsNewDocOpen(false);
    setNewDoc({ nomorSurat: '', title: '', sender: '', type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '' });
  };

  const handleDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposisiDoc || !disposisiForm.tujuan) return;
    // Only Sekcam routing to Camat OR Camat routing to Target
    // Simple logic based on current user:
    let newStatus: any = 'pending_camat';
    if (isReviewer) {
        newStatus = 'pending_camat';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline);
    } else if (isPimpinanPuncak) {
        newStatus = 'pending_target';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline);
    } else {
        newStatus = 'in_progress';
        updateTaskStatus(disposisiDoc.id, newStatus, disposisiForm.catatan, disposisiForm.tujuan, undefined, disposisiForm.deadline);
    }

    addNotification(`Surat berhasil didisposisikan ke ${disposisiForm.tujuan}.`);
    setDisposisiDoc(null);
    setDisposisiForm({ instruksi: 'Tindaklanjuti', catatan: '', tujuan: '', deadline: '' });
  };

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Surat</h1>
          <p className="text-gray-500 text-sm mt-1">Pengarsipan, pencatatan, dan tindak lanjut naskah dinas.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'staf_agenda') && (
           <button 
             onClick={() => setIsNewDocOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
           >
             <Plus size={18} /> <span className="hidden sm:inline">Naskah Baru</span>
           </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['masuk', 'keluar', 'arsip'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all",
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {tab === 'masuk' ? 'Surat Masuk' : tab === 'keluar' ? 'Surat Keluar' : 'Arsip Digital'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nomor surat, perihal, pengirim..." 
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50">
             <Filter size={18} /> Filter
          </button>
        </div>

        <div className="space-y-4">
          {filteredDocs.length === 0 ? (
             <div className="py-12 text-center text-gray-500">
                <Archive size={48} className="mx-auto text-gray-300 mb-3" />
                <p>Belum ada naskah dinas di kategori ini.</p>
             </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="group block bg-gray-50/50 hover:bg-blue-50/30 border border-gray-100 rounded-2xl p-5 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex flex-col flex-1 gap-2">
                     <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase w-fit inline-flex items-center gap-1.5">
                        <FileText size={12} /> {doc.nomorSurat || doc.id}
                     </span>
                     <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                        {doc.title}
                     </h3>
                     <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                        <span className="flex items-center gap-1"><UserCheck size={14} /> {doc.sender}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(doc.date), 'dd MMM yyyy', { locale: localeId })}</span>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                     {doc.priority === 'Mendesak' ? (
                       <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl flex items-center gap-1.5 w-full sm:w-auto justify-center">
                          <AlertCircle size={14} /> Mendesak
                       </span>
                     ) : (
                       <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-xl w-full sm:w-auto text-center">
                          {doc.priority}
                       </span>
                     )}
                     
                     <div className="flex w-full sm:w-auto gap-2">
                        {((doc.status === 'pending_sekcam' && isReviewer) || (doc.status === 'pending_camat' && isPimpinanPuncak)) && (
                          <button 
                            onClick={() => setDisposisiDoc(doc)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                          >
                             <Send size={14} />
                             {isReviewer ? 'Verifikasi & Mapping' : 'Approval & Teruskan'}
                          </button>
                        )}
                                                <button onClick={() => setDetailDoc(doc)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                           <ExternalLink size={14} />
                           Buka Detail
                        </button>
                        {true && (
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
                     </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH NASKAH BARU */}
      {isNewDocOpen && (
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
                    <select 
                      value={newDoc.type}
                      onChange={e => setNewDoc({...newDoc, type: e.target.value})}
                      className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="masuk">Surat Masuk</option>
                      <option value="keluar">Surat Keluar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Derajat Keamanan / Prioritas</label>
                    <select 
                      value={newDoc.priority}
                      onChange={e => setNewDoc({...newDoc, priority: e.target.value})}
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
                    value={newDoc.driveUrl}
                    onChange={e => setNewDoc({...newDoc, driveUrl: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>

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
                Simpan Arsip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPOSISI/TINDAK LANJUT */}
      {disposisiDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Send size={18} className="text-blue-600" /> Lembar Disposisi / Tindak Lanjut
              </h2>
              <button onClick={() => setDisposisiDoc(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Identitas Naskah</span>
                <h3 className="font-bold text-gray-900 mt-1">{disposisiDoc.title}</h3>
                <p className="text-xs text-gray-600">Pengirim: {disposisiDoc.sender}</p>
              </div>

              <form id="form-disposisi" onSubmit={handleDisposisi} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilihan Instruksi / Tindak Lanjut</label>
                  <div className="relative">
                    <select 
                      value={disposisiForm.instruksi}
                      onChange={e => setDisposisiForm({...disposisiForm, instruksi: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                       <option value="Tindaklanjuti">Tindaklanjuti</option>
                       <option value="Tanggapan & Saran">Tanggapan & Saran</option>
                       <option value="Untuk Diketahui / Dipedomani">Untuk Diketahui / Dipedomani</option>
                       <option value="Hadiri">Hadiri</option>
                       <option value="Wakili">Wakili</option>
                       <option value="Selesaikan / Buat Laporan">Selesaikan / Buat Laporan</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Arahan Khusus</label>
                  <textarea 
                    rows={3}
                    value={disposisiForm.catatan}
                    onChange={e => setDisposisiForm({...disposisiForm, catatan: e.target.value})}
                    placeholder="Contoh: Segera pelajari dan buat draft laporan kepada Pimpinan..."
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Diteruskan Kepada (Tujuan)</label>
                  <div className="relative">
                    <select 
                      required
                      value={disposisiForm.tujuan}
                      onChange={e => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>-- Pilih Pejabat / Staf --</option>
                      {usersList.filter(u => {
                         const uRoleLower = (u.role || '').toLowerCase();
                         const isPimpinanU = uRoleLower.includes('camat') || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil');
                         return u.role !== 'admin' && !isPimpinanU && (!user?.opd || u.opd === user?.opd);
                      }).map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
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
</div>
  );
}
