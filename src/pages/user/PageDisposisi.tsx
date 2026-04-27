import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send as SendIcon, Save, Clock, ChevronDown, CheckCircle2, UserCheck, CheckSquare, Search, Link as LinkIcon, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function PageDisposisi() {
  const { user, tasks, usersList, addNotification, config, updateTaskStatus } = useAppContext();
  
  // Ambil surat yang perlu disposisi sesuai role
  const incomingLetters = tasks.filter(t => {
    if (user?.role === 'sekcam') return t.status === 'pending_sekcam';
    if (user?.role === 'camat') return t.status === 'pending_camat';
    return false;
  });
  
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);
  
  const [disposisiForm, setDisposisiForm] = useState({
    instruksi: 'Tindaklanjuti',
    catatanKhusus: '',
    tujuan: '', // NIP Pilihan
    linkDrive: '' // Optional Link Drive
  });

  const instruksiOptions = [
    'Tindaklanjuti',
    'Tanggapan & Saran',
    'Untuk Diketahui / Dipedomani',
    'Hadiri',
    'Wakili',
    'Koordinasikan',
    'Selesaikan / Buat Laporan'
  ];

  const handleDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || (user?.role === 'sekcam' && !disposisiForm.tujuan)) return;
    
    const combinedNotes = `(Arahan: ${disposisiForm.instruksi}) ${disposisiForm.catatanKhusus} ${disposisiForm.linkDrive ? `\n[Link: ${disposisiForm.linkDrive}]` : ''}`.trim();

    if (user?.role === 'sekcam') {
        // Sekcam mem-forward ke Camat untuk divalidasi
        // target sudah dipilih dari form
        updateTaskStatus(selectedTask.id, 'pending_camat', combinedNotes, disposisiForm.tujuan);
        addNotification(`Surat ${selectedTask.id} berhasil dimapping dan diteruskan ke Camat untuk persetujuan.`);
    } else if (user?.role === 'camat') {
        // Camat memvalidasi dan approve disposisi dari Sekcam, atau mengirim ke Target
        const finalTujuan = disposisiForm.tujuan || selectedTask.assignedTo;
        if (!finalTujuan) {
           addNotification('Pilih Pejabat Target terlebih dahulu!', 'error');
           return;
        }
        updateTaskStatus(selectedTask.id, 'pending_target', combinedNotes, finalTujuan);
        addNotification(`Surat ${selectedTask.id} berhasil divalidasi/disetujui dan diteruskan ke target petugas.`);
    }
    
    setSelectedTask(null);
    setDisposisiForm({ instruksi: 'Tindaklanjuti', catatanKhusus: '', tujuan: '', linkDrive: '' });
  };

  return (
    <div className="space-y-6 lg:px-4 pb-10">
       <header className="mb-2">
         <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'sekcam' ? 'Mapping / Disposisi (Sekcam)' : 'Validasi Disposisi Pimpinan'}
         </h1>
         <p className="text-gray-500 text-sm">
            {user?.role === 'sekcam' 
               ? 'Pilih tujuan dan beri draf arahan untuk disetujui Camat.'
               : 'Berikan persetujuan untuk surat yang telah di-mapping oleh Sekcam.'}
         </p>
       </header>

       {!selectedTask ? (
         <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
               <Clock size={16} className="text-indigo-600" /> Menunggu {user?.role === 'camat' ? 'Persetujuan' : 'Arahan'} ({incomingLetters.length})
            </h3>
            
            {incomingLetters.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                 <CheckCircle2 size={40} className="text-green-300 mx-auto mb-3" />
                 <p className="text-gray-500 font-medium">Semua surat sudah diproses.</p>
               </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                  {incomingLetters.map(task => (
                    <button 
                      key={task.id} 
                      onClick={() => {
                        setSelectedTask(task);
                        // Populate form with existing mapping if user is camat
                        if (user?.role === 'camat' && task.assignedTo) {
                           setDisposisiForm(prev => ({...prev, tujuan: task.assignedTo || ''}));
                        }
                      }}
                      className="text-left bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group"
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckSquare size={20} className="text-indigo-600" />
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] tracking-wider uppercase border border-amber-200">
                            {user?.role === 'camat' ? 'BUTUH VALIDASI' : 'BUTUH ARAHAN'}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">{format(new Date(task.date), 'dd MMM yyyy', { locale: localeId })}</span>
                       </div>
                       
                       <h4 className="font-bold text-gray-900 leading-snug">{task.title}</h4>
                       <p className="text-sm text-gray-500 line-clamp-1"><span className="font-semibold text-gray-700">Dari:</span> {task.sender}</p>
                       {user?.role === 'camat' && task.assignedTo && (
                          <div className="mt-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                             <span className="font-bold text-gray-600">Usulan Target:</span> {task.assignedTo}
                          </div>
                       )}
                    </button>
                  ))}
                </div>
            )}
         </div>
       ) : (
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
            <button 
               onClick={() => setSelectedTask(null)}
               className="text-sm font-medium text-indigo-600 mb-4 flex items-center gap-1 hover:underline w-fit"
            >
               ← Kembali ke Kotak Masuk
            </button>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
               <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Rincian Surat</span>
               <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedTask.title}</h3>
               <p className="text-sm text-gray-600">Pengirim: {selectedTask.sender}</p>
               {selectedTask.notesSekcam && (
                  <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                     <span className="font-bold block mb-1 text-xs uppercase text-indigo-600">Catatan Sekcam:</span>
                     {selectedTask.notesSekcam}
                  </div>
               )}
            </div>

            <form onSubmit={handleDisposisi} className="space-y-5">
               <h3 className="font-bold text-sm uppercase tracking-wide text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                 <UserCheck size={16} className="text-indigo-600" /> 
                 {user?.role === 'camat' ? 'Validasi / Approval Disposisi' : 'Formulir Mapping Disposisi'}
               </h3>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Target Pejabat / Staf</label>
                 <div className="relative">
                   <select 
                      required={user?.role === 'sekcam' || !selectedTask.assignedTo}
                      value={disposisiForm.tujuan}
                      onChange={(e) => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                   >
                      <option value="" disabled>-- Pilih Pejabat / Staf Tujuan --</option>
                      {usersList.filter(u => u.role !== 'admin' && u.role !== 'camat').map(u => (
                         <option key={u.id} value={u.name}>
                            {u.name} ({u.title})
                         </option>
                      ))}
                   </select>
                   <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={18} />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Instruksi Aksi (Dropdown)</label>
                 <div className="relative">
                   <select 
                      value={disposisiForm.instruksi}
                      onChange={(e) => setDisposisiForm({...disposisiForm, instruksi: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                   >
                      {instruksiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                   <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={18} />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Kalimat Perintah / Catatan Tambahan</label>
                 <textarea 
                    value={disposisiForm.catatanKhusus}
                    onChange={(e) => setDisposisiForm({...disposisiForm, catatanKhusus: e.target.value})}
                    placeholder={user?.role === 'sekcam' ? "Contoh: Tolong siapkan bahan rapat koordinasi..." : "Komentar / Persetujuan tambahan..."}
                    rows={3}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                 />
               </div>

               {user?.role === 'sekcam' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                       URL Dokumen Drive <span className="font-normal text-xs text-gray-400">(Opsional)</span>
                    </label>
                    <div className="relative">
                       <LinkIcon className="absolute left-4 top-3 text-gray-400" size={18} />
                       <input 
                         type="url"
                         value={disposisiForm.linkDrive}
                         onChange={(e) => setDisposisiForm({...disposisiForm, linkDrive: e.target.value})}
                         placeholder="https://docs.google.com/..."
                         className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:border-transparent transition-all"
                         style={{ '--tw-ring-color': config.primaryColor } as any}
                       />
                    </div>
                  </div>
               )}
               
               <div className="pt-4 flex justify-end">
                  <button 
                     type="submit"
                     className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
                     style={{ backgroundColor: config.primaryColor }}
                  >
                     {user?.role === 'camat' ? (
                        <><FileCheck size={18} /> Setujui & Teruskan ke Target</>
                     ) : (
                        <><SendIcon size={16} /> Mapping & Ajukan ke Camat</>
                     )}
                  </button>
               </div>
            </form>
         </div>
       )}
    </div>
  );
}

