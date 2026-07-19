import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Inbox, CheckCircle2, Clock, CheckSquare, Send, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function DisposisiMasuk() {
  const { user, tasks, updateTaskStatus, addNotification, usersList, config } = useAppContext();
  const [disposisiModalOpen, setDisposisiModalOpen] = useState<any>(null);
  const [disposisiForm, setDisposisiForm] = useState({ tujuan: '', instruksi: 'Tindaklanjuti' });
  const isKasiOrKasubag = (user?.role || '').toLowerCase().includes('kasi') || (user?.role || '').toLowerCase().includes('kasubag') || (user?.role || '').toLowerCase().includes('kabag');
  const navigate = useNavigate();

  // Ambil tugas yang ditujukan ke user bersangkutan yang statusnya pending_target atau in_progress
  const myTasks = tasks.filter(t => 
     (t.assignedTo === user?.name || t.assignedTo === user?.username) &&
     (t.status === 'pending_target' || t.status === 'in_progress' || t.status === 'overdue')
  );

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disposisi Masuk</h1>
        <p className="text-gray-500 text-sm mt-1">Daftar naskah dan tugas dari pimpinan yang tertuju pada Anda.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {myTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
               <Inbox size={48} className="mx-auto text-gray-300 mb-3" />
               <p>Tidak ada disposisi masuk yang perlu ditindaklanjuti.</p>
            </div>
          ) : (
            myTasks.map(task => (
              <div key={task.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", task.status === 'overdue' ? 'bg-red-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-400')} />
                
                <div className="pl-2">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide border border-gray-200">{task.nomorSurat || task.id}</span>
                      <span className="text-[11px] text-gray-500 font-medium">{format(new Date(task.date), 'dd MMM yyyy', { locale: localeId })}</span>
                   </div>
                   <h3 className="font-bold text-gray-900 leading-tight mb-2">{task.title}</h3>
                   <div className="text-sm text-gray-600 space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                      <p><span className="font-semibold text-gray-700">Pemberi Tugas/Pengirim:</span> {task.sender}</p>
                      {task.instructions && <p className="whitespace-pre-wrap"><span className="font-semibold text-gray-700">Arahan Pimpinan:</span> {task.instructions}</p>}
                      {task.notesSekcam && <p className="text-xs mt-1 text-gray-500"><span className="font-bold">Catatan Sekcam/Wakil:</span> {task.notesSekcam}</p>}
                      {task.notesCamat && <p className="text-xs mt-1 text-gray-500"><span className="font-bold">Catatan Pimpinan:</span> {task.notesCamat}</p>}
                   </div>
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <span className={cn(
                     "text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide flex items-center gap-1.5 justify-center sm:justify-end",
                     task.status === 'pending_target' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                     task.status === 'in_progress' ? "bg-blue-100 text-blue-700 border border-blue-200" :
                     "bg-red-100 text-red-700 border border-red-200"
                   )}>
                      {task.status === 'pending_target' ? <><Clock size={12}/> Menunggu Tindak Lanjut</> : 
                       task.status === 'in_progress' ? <><CheckSquare size={12}/> Sedang Dikerjakan</> : 
                       <><Clock size={12}/> Terlambat (Overdue)</>}
                   </span>
                  
                  {task.status === 'pending_target' ? (
                     <div className="flex flex-col sm:flex-row gap-2 w-full">
                       <button 
                         onClick={() => {
                            updateTaskStatus(task.id, 'in_progress', 'Mulai mengerjakan tindak lanjut dari disposisi', undefined, 10);
                            addNotification(`Status ${task.id} diubah menjadi Sedang Dikerjakan`);
                         }}
                         className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                       >
                          <CheckCircle2 size={16} /> Kerjakan Sendiri
                       </button>
                       {isKasiOrKasubag && task.disposisiType !== 'akhir' && (
                         <button 
                           onClick={() => {
                              setDisposisiModalOpen(task);
                           }}
                           className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-100 transition-all active:scale-95"
                         >
                            <Send size={16} /> Teruskan ke Staf
                         </button>
                       )}
                     </div>
                  ) : (
                     <button 
                       onClick={() => navigate('/tracking')}
                       className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
                     >
                        Update Progres Kinerja →
                     </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
                 addNotification(`Tugas berhasil diteruskan ke ${disposisiForm.tujuan}`);
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
                         const uRoleLower = (u.role || '').toLowerCase();
                         if (!uRoleLower.includes('pelaksana') && !uRoleLower.includes('staf')) return false;
                         
                         const myTitleWords = (user?.title || '').toLowerCase().replace(/kepala|seksi|sub|bag|bagian|&/g, '').trim().split(/\s+/);
                         const uTitleLower = (u.title || '').toLowerCase();
                         const hasMatch = myTitleWords.some(word => word.length > 3 && uTitleLower.includes(word));
                         
                         if (myTitleWords.length > 0 && myTitleWords.some(w => w.length > 3)) {
                             if (!hasMatch) return false;
                         }
                         return !user?.opd || u.opd === user?.opd;
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
                   <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 flex items-center gap-2"><Send size={14}/> Teruskan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
