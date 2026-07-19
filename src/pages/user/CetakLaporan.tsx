import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Printer, Calendar, FileText, Filter, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import dayjs from 'dayjs';

export default function CetakLaporan() {
  const { tasks, user, config } = useAppContext();
  
  const [filterBulan, setFilterBulan] = useState(dayjs().format('YYYY-MM'));
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Role based filtering logic
  const accessibleTasks = tasks.filter(t => {
     if (!user) return false;
     
     const role = user.role;
     const roleLower = role.toLowerCase();
     const isPimpinanPuncak = (roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris'));
     const isReviewer = roleLower.includes('sekcam') || roleLower.includes('sekretaris') || roleLower.includes('wakapolsek') || roleLower.includes('wadanramil') || roleLower.includes('kasdim') || roleLower.includes('kasat');
     const isAdminOrReviewer = role === 'admin' || isReviewer;
     
     if (isAdminOrReviewer) return true;
     
     if (isPimpinanPuncak) {
        // Pimpinan sees tasks mapping to their opd or general, assuming all tasks available if they are Camat.
        // For kapolsek/danramil, ideally restricted by OPD but we show all for this demo or restrict by opd if you have it.
        if ((roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris'))) return true; 
        if (user.opd) return t.opd === user.opd; // If opd is set, filter by opd
        return true;
     }
     
     // Staf / Kasi / Kabag
     return t.assignedTo === user.name || t.assignedTo === user.username;
  });

  const filteredTasks = accessibleTasks.filter(t => {
     const matchBulan = t.date.startsWith(filterBulan); // YYYY-MM
     const matchStatus = filterStatus === 'all' || t.status === filterStatus;
     return matchBulan && matchStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  const statusText = {
    'pending_sekcam': 'Menunggu Validasi (Sekcam/Wakil)',
    'pending_camat': 'Menunggu Pimpinan',
    'pending_target': 'Diteruskan ke Target',
    'in_progress': 'Sedang Diproses',
    'completed': 'Selesai',
    'overdue': 'Terlambat'
  };

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      {/* Header (No print) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cetak Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Cetak rekapitulasi data surat dan disposisi kerja.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          style={{ backgroundColor: config.primaryColor }}
        >
          <Printer size={18} />
          <span>Cetak Dokumen</span>
        </button>
      </header>

      {/* Filters (No print) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 print:hidden">
        <div className="flex-1">
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
             <Calendar size={14} /> Periode Bulan
           </label>
           <input 
              type="month" 
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2"
              style={{ '--tw-ring-color': config.primaryColor } as any}
           />
        </div>
        <div className="flex-1">
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
             <Filter size={14} /> Status Disposisi
           </label>
           <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': config.primaryColor } as any}
           >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Sedang Diproses</option>
              <option value="pending_sekcam">Menunggu Validasi (Sekcam/Wakil)</option>
              <option value="pending_camat">Menunggu Pimpinan</option>
              <option value="pending_target">Menunggu Konfirmasi Target</option>
              <option value="overdue">Terlambat</option>
           </select>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
         {/* Kop Surat (Only visible in Print ideally, but we can show a header here too) */}
         <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase">{config.appName}</h1>
            <p className="text-sm">Laporan Rekapitulasi Disposisi dan Surat Masuk</p>
            <p className="text-sm">Bulan: {dayjs(filterBulan).format('MMMM YYYY')}</p>
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">No. Surat/ID</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Perihal / Judul</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Pengirim</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Disposisi Ke</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Progres</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filteredTasks.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="p-8 text-center text-gray-500 print:hidden">
                     <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                     <p>Tidak ada data laporan untuk rentang waktu dan filter yang dipilih.</p>
                   </td>
                   <td colSpan={7} className="hidden print:table-cell p-4 text-center">
                      Nihil
                   </td>
                 </tr>
               ) : (
                 filteredTasks.map(t => (
                   <tr key={t.id} className="hover:bg-gray-50/50 print:break-inside-avoid">
                     <td className="p-4 text-sm font-medium text-gray-900 border-r border-gray-50 print:border-gray-200">{t.nomorSurat || t.id}</td>
                     <td className="p-4 text-sm text-gray-600 border-r border-gray-50 print:border-gray-200">{dayjs(t.date).format('DD/MM/YYYY')}</td>
                     <td className="p-4 text-sm text-gray-900 font-medium max-w-[200px] truncate border-r border-gray-50 print:border-gray-200" title={t.title}>{t.title}</td>
                     <td className="p-4 text-sm text-gray-600 border-r border-gray-50 print:border-gray-200">{t.sender}</td>
                     <td className="p-4 text-sm font-semibold text-gray-700 border-r border-gray-50 print:border-gray-200">{t.assignedTo || '-'}</td>
                     <td className="p-4 text-sm border-r border-gray-50 print:border-gray-200">
                        <span className={cn(
                           "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider print:border print:border-black",
                           t.status === 'completed' ? "bg-green-100 text-green-700" :
                           t.status === 'overdue' ? "bg-red-100 text-red-700" :
                           t.status.includes('pending') ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                           {statusText[t.status] || t.status}
                        </span>
                     </td>
                     <td className="p-4 text-sm font-bold text-center text-gray-700">
                        {t.progress || 0}%
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
         
         {/* Footer Print Only */}
         <div className="hidden print:block mt-12 text-sm">
            <div className="flex justify-end pr-12">
               <div className="text-center">
                  <p className="mb-16">Mengetahui,<br/>{user?.title || user?.role}</p>
                  <p className="font-bold underline">{user?.name}</p>
                  <p>NIP. {user?.username}</p>
               </div>
            </div>
         </div>
      </div>
      
      {/* Global Print Styles Injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          nav, aside, button {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
