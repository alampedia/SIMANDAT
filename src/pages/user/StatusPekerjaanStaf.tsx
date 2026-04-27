import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StatusPekerjaanStaf() {
  const { config } = useAppContext();

  // Mock data for staff tasks
  const staffTasks = [
    { id: 'T-003', title: 'Verifikasi Berkas KTP', assignedTo: 'Budi Santoso', status: 'completed' },
    { id: 'T-004', title: 'Survey Kelapangan RT 05', assignedTo: 'Andi M.', status: 'in_progress' },
    { id: 'T-005', title: 'Rekapitulasi Absensi', assignedTo: 'Siti Rahma', status: 'overdue' }
  ];

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Pekerjaan Staf</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau progres pengerjaan tugas oleh bawahan Anda.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari tugas, nama staf..." 
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50">
             <Filter size={18} /> Urutkan
          </button>
        </div>

        <div className="space-y-3">
          {staffTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
               <Users size={48} className="mx-auto text-gray-300 mb-3" />
               <p>Staf tidak memiliki tugas aktif.</p>
            </div>
          ) : (
            staffTasks.map(t => (
              <div key={t.id} className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors gap-3">
                <div>
                   <span className="font-bold text-gray-900 block text-base mb-1">{t.title}</span>
                   <span className="text-sm text-gray-500 flex items-center gap-1">
                     Staf Pelaksana: <span className="font-semibold text-gray-700">{t.assignedTo || '-'}</span>
                   </span>
                </div>
                <div className="flex justify-end">
                  <span className={cn(
                     "text-[10px] font-bold px-3 py-1.5 rounded-xl tracking-wide uppercase",
                     t.status === 'completed' ? "bg-green-100 text-green-700" : 
                     t.status === 'overdue' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {t.status === 'completed' ? 'Selesai' : t.status === 'overdue' ? 'Terlambat' : 'Diproses'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
