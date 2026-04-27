import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Inbox, CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function DisposisiMasuk() {
  const { user, tasks, updateTaskStatus, addNotification } = useAppContext();
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
              <div key={task.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", task.status === 'overdue' ? 'bg-red-500' : task.status === 'in_progress' ? 'bg-indigo-500' : 'bg-amber-400')} />
                
                <div className="pl-2">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wide border border-gray-200">{task.nomorSurat || task.id}</span>
                      <span className="text-[11px] text-gray-500 font-medium">{format(new Date(task.date), 'dd MMM yyyy', { locale: localeId })}</span>
                   </div>
                   <h3 className="font-bold text-gray-900 leading-tight mb-2">{task.title}</h3>
                   <div className="text-sm text-gray-600 space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                      <p><span className="font-semibold text-gray-700">Pemberi Tugas/Pengirim:</span> {task.sender}</p>
                      {task.instructions && <p className="whitespace-pre-wrap"><span className="font-semibold text-gray-700">Arahan Pimpinan:</span> {task.instructions}</p>}
                      {task.notesSekcam && <p className="text-xs mt-1 text-gray-500"><span className="font-bold">Catatan Sekcam:</span> {task.notesSekcam}</p>}
                      {task.notesCamat && <p className="text-xs mt-1 text-gray-500"><span className="font-bold">Catatan Camat:</span> {task.notesCamat}</p>}
                   </div>
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <span className={cn(
                     "text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide flex items-center gap-1.5 justify-center sm:justify-end",
                     task.status === 'pending_target' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                     task.status === 'in_progress' ? "bg-indigo-100 text-indigo-700 border border-indigo-200" :
                     "bg-red-100 text-red-700 border border-red-200"
                   )}>
                      {task.status === 'pending_target' ? <><Clock size={12}/> Menunggu Tindak Lanjut</> : 
                       task.status === 'in_progress' ? <><CheckSquare size={12}/> Sedang Dikerjakan</> : 
                       <><Clock size={12}/> Terlambat (Overdue)</>}
                   </span>
                  
                  {task.status === 'pending_target' ? (
                     <button 
                       onClick={() => {
                          updateTaskStatus(task.id, 'in_progress', 'Mulai mengerjakan tindak lanjut dari disposisi', undefined, 10);
                          addNotification(`Status ${task.id} diubah menjadi Sedang Dikerjakan`);
                       }}
                       className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                     >
                        <CheckCircle2 size={16} /> Konfirmasi Tindak Lanjut
                     </button>
                  ) : (
                     <button 
                       onClick={() => navigate('/tracking')}
                       className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95"
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
    </div>
  );
}
