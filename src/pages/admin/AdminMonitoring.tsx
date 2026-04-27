import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, ChevronDown, Check, Activity, FileDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const STATUS_LABELS = {
  'pending_verifikasi': 'Menunggu Verifikasi (Sekcam)',
  'pending_instruksi': 'Menunggu Instruksi (Camat)',
  'pending_delegasi': 'Menunggu Delegasi (Kasi)',
  'in_progress': 'Sedang Dikerjakan (Staf)',
  'completed': 'Selesai',
  'overdue': 'Terlambat/Alert'
};

const STATUS_COLORS = {
  'pending_verifikasi': 'bg-gray-100 text-gray-700 border-gray-200',
  'pending_instruksi': 'bg-blue-50 text-blue-700 border-blue-200',
  'pending_delegasi': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'in_progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'completed': 'bg-green-50 text-green-700 border-green-200',
  'overdue': 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminMonitoring() {
  const { tasks, user, config } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Disposisi</h1>
          <p className="text-gray-500 text-sm mt-1">Alur pergerakan surat dan pendelegasian tugas.</p>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Cari surat / No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:border-transparent outline-none"
              style={{ '--tw-ring-color': config.primaryColor } as any}
           />
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">No. Surat/ID</th>
                <th className="p-4">Asal & Perihal</th>
                <th className="p-4">Status & Waktu</th>
                <th className="p-4">Lihat Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Tidak ada data surat.</td>
                </tr>
              )}
              {filteredTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-600">{task.id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 mb-1">{task.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Dari: <span className="font-medium text-gray-700">{task.sender}</span>
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-md text-xs font-medium border", STATUS_COLORS[task.status])}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(task.history[task.history.length - 1].date), 'dd MMM HH:mm', { locale: localeId })}
                      </p>
                    </td>
                    <td className="p-4">
                       <button 
                         onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                         className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-indigo-600"
                       >
                         {selectedTask === task.id ? 'Tutup' : 'Detail'}
                         <ChevronDown size={16} className={cn("transition-transform", selectedTask === task.id && "rotate-180")} />
                       </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
                  {selectedTask === task.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={4} className="p-6 border-b border-gray-100">
                        <div className="max-w-2xl mx-auto">
                          
                          {/* History Timeline Only */}
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                              <Activity size={16} /> Jejak Audit (Audit Trail)
                            </h4>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                               {task.history.map((h, i) => (
                                 <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group flex-row-reverse">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10" />
                                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs text-gray-900">{h.actor}</span>
                                        <time className="text-[10px] text-gray-500">{format(new Date(h.date), 'dd/MM HH:mm')}</time>
                                      </div>
                                      <div className="text-xs text-gray-600">{h.action}</div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
