import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Target, CheckCircle2, AlertTriangle, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const STATUS_LABELS = {
  'pending_sekcam': 'Menunggu Validasi (Sekcam)',
  'pending_camat': 'Menunggu Persetujuan (Camat)',
  'pending_target': 'Menunggu Tindak Lanjut',
  'in_progress': 'Sedang Dikerjakan (Staf)',
  'completed': 'Selesai',
  'overdue': 'Terlambat/Alert'
};

const STATUS_COLORS = {
  'pending_sekcam': 'border-gray-200 text-gray-700 bg-gray-50',
  'pending_camat': 'border-blue-200 text-blue-700 bg-blue-50',
  'pending_target': 'border-blue-200 text-blue-700 bg-blue-50',
  'in_progress': 'border-amber-200 text-amber-700 bg-amber-50',
  'completed': 'border-green-200 text-green-700 bg-green-50',
  'overdue': 'border-red-200 text-red-700 bg-red-50',
};

export default function TrackingKinerja() {
  const { tasks, updateTaskStatus, user, config, addNotification } = useAppContext();
  const [updateNote, setUpdateNote] = useState('');
  const [activeTaskForm, setActiveTaskForm] = useState<string | null>(null);

  // We should show tasks that either:
  // 1. Belong to the user
  // 2. Are in progress or pending delegasi depending on their role
  // Let's just show all active tracking tasks for now based on role
  const trackingTasks = tasks.filter(t => {
     if (user?.role === 'admin') return true;
     // For staff, targeted to them
     if (t.assignedTo === user?.username || t.assignedTo === user?.name) return true;
     return false; // Not showing to unrelated people
  }); 

  const getActionOptions = (status: string, userRole: string) => {
    if (userRole === 'admin') return ['pending_sekcam', 'pending_camat', 'pending_target', 'in_progress', 'completed'];
    if (status === 'pending_target') return ['in_progress'];
    if (status === 'in_progress') return ['completed'];
    return [];
  };

  const handleUpdateProgress = (taskId: string, targetStatus: string) => {
    if (!updateNote.trim()) {
      alert("Catatan progres wajib diisi.");
      return;
    }
    let progress = targetStatus === 'in_progress' ? 50 : targetStatus === 'completed' ? 100 : undefined;
    updateTaskStatus(taskId, targetStatus as any, updateNote, undefined, progress);
    setUpdateNote('');
    setActiveTaskForm(null);
    addNotification('Progres kinerja berhasil diperbarui.');
  };

  return (
    <div className="space-y-6 lg:px-4 pb-10">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <Target className="text-blue-600" /> Tracking Kinerja
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sistem pelaporan progres tugas dan update aksi lapangan.</p>
      </header>

      <div className="space-y-4">
         {trackingTasks.length === 0 ? (
           <div className="text-center py-10 text-gray-500 bg-white border border-dashed rounded-3xl">Belum ada data prioritas kinerja yang perlu di-update.</div>
         ) : trackingTasks.map(task => (
             <div key={task.id} className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", task.status === 'completed' ? 'bg-green-500' : task.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500')} />
              
              <div className="flex-1 space-y-3">
                 <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{task.nomorSurat || task.id}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", (STATUS_COLORS as any)[task.status] || STATUS_COLORS.in_progress)}>
                       {(STATUS_LABELS as any)[task.status] || task.status}
                    </span>
                 </div>
                 
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{task.title}</h3>
                    {task.instructions && <p className="text-sm text-gray-600 font-medium whitespace-pre-wrap">Arahan: {task.instructions}</p>}
                    {task.notesSekcam && <p className="text-sm text-gray-500 mt-1"><span className="font-semibold text-gray-600">Catatan Sekcam:</span> {task.notesSekcam}</p>}
                    {task.notesCamat && <p className="text-sm text-gray-500 mt-1"><span className="font-semibold text-gray-600">Catatan Camat:</span> {task.notesCamat}</p>}
                 </div>
                 
                 <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                       <Clock size={14} /> Terakhir Update: {format(new Date(task.history[task.history.length-1].date), 'dd MMM HH:mm', { locale: localeId })}
                    </span>
                 </div>
              </div>

              {/* Action Column */}
              <div className="w-full md:w-72 shrink-0 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col">
                 <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Kolom Aksi & Update</span>
                 
                 {getActionOptions(task.status, user?.role || '').length > 0 ? (
                    <div className="space-y-3 flex-1 flex flex-col">
                       {activeTaskForm === task.id ? (
                         <div className="space-y-2 flex-1 relative">
                            <textarea
                              className="w-full text-sm p-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                              rows={3}
                              placeholder="Ketik catatan progres / lampiran tindak lanjut di sini..."
                              value={updateNote}
                              onChange={(e) => setUpdateNote(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                               {getActionOptions(task.status, user?.role || '').map(action => (
                                 <button
                                   key={action}
                                   onClick={() => handleUpdateProgress(task.id, action)}
                                   className="flex-1 text-xs font-semibold px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 active:scale-95 flex justify-center items-center gap-1.5"
                                 >
                                    Lanjut <ArrowRight size={14} />
                                 </button>
                               ))}
                               <button 
                                 onClick={() => setActiveTaskForm(null)}
                                 className="text-xs font-semibold px-3 py-2 bg-gray-200 text-gray-700 rounded-lg"
                               >Batal</button>
                            </div>
                         </div>
                       ) : (
                         <button
                           onClick={() => {
                             setActiveTaskForm(task.id);
                             setUpdateNote('');
                           }}
                           className="w-full mt-auto flex items-center justify-center gap-2 text-blue-700 bg-blue-50 border border-blue-200 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                         >
                            <MessageSquare size={16} /> Isi Laporan Kinerja
                         </button>
                       )}
                    </div>
                 ) : (
                    <div className="flex items-center justify-center p-4 bg-white border border-gray-100 rounded-xl flex-1 text-center">
                       <span className="text-xs text-gray-400 font-medium">Bukan kewenangan aksi untuk role Anda saat ini atau status sudah terkunci.</span>
                    </div>
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
