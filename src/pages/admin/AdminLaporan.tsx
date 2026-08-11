import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { useAppContext } from '../../context/AppContext';

export default function AdminLaporan() {
  const { config, tasks, usersList } = useAppContext();

  const dataKinerja = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize 4 weeks
    const weeks = [
      { name: 'Minggu 1', selesai: 0, terlambat: 0 },
      { name: 'Minggu 2', selesai: 0, terlambat: 0 },
      { name: 'Minggu 3', selesai: 0, terlambat: 0 },
      { name: 'Minggu 4', selesai: 0, terlambat: 0 },
      { name: 'Minggu 5', selesai: 0, terlambat: 0 },
    ];

    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
        const weekIndex = Math.min(Math.floor((taskDate.getDate() - 1) / 7), 4);
        
        let isCompleted = task.status === 'completed';
        let isLate = false;
        
        if (task.deadline) {
          const deadlineDate = new Date(task.deadline);
          
          if (isCompleted) {
             // Find completion date from history
             const completedLog = task.history?.find(h => h.action.toLowerCase().includes('diselesaikan'));
             const completionDate = completedLog ? new Date(completedLog.date) : new Date(); // fallback
             if (completionDate > deadlineDate) {
                 isLate = true;
             }
          } else {
             if (now > deadlineDate) {
                 isLate = true;
             }
          }
        }
        
        if (isCompleted && !isLate) {
           weeks[weekIndex].selesai += 1;
        } else if (isLate) {
           weeks[weekIndex].terlambat += 1;
        } else if (isCompleted && isLate) {
           weeks[weekIndex].selesai += 1;
           weeks[weekIndex].terlambat += 1;
        }
      }
    });

    return weeks.filter(w => w.selesai > 0 || w.terlambat > 0 || w.name !== 'Minggu 5'); // keep up to 4 if 5 is empty
  }, [tasks]);

      const dataDistribusi = useMemo(() => {
     // Pre-populate so they always show up with full names
     const baseBebanKerja: Record<string, number> = {
        'Seksi Pemerintahan': 0,
        'Seksi Kesejahteraan Sosial': 0,
        'Seksi Trantib': 0,
        'Subbag Umum & Kepegawaian': 0,
        'Subbag Perencanaan & Keuangan': 0,
     };

     const normalizeUnit = (unit: string) => {
        const u = unit.toLowerCase();
        if (u.includes('kesejahteraan sosial') || u.includes('kesos') || u.includes('pemberdayaan masyarakat')) return 'Seksi Kesejahteraan Sosial';
        if (u.includes('pemerintahan')) return 'Seksi Pemerintahan';
        if (u.includes('trantib') || u.includes('ketentraman') || u.includes('ketertiban')) return 'Seksi Trantib';
        if (u.includes('umum') || u.includes('kepegawaian')) return 'Subbag Umum & Kepegawaian';
        if (u.includes('perencanaan') || u.includes('keuangan') || u.includes('ppk')) return 'Subbag Perencanaan & Keuangan';
        return unit; // Fallback
     };
     
     tasks.forEach(task => {
        if (task.assignedTo) {
           const user = usersList.find(u => u.name === task.assignedTo || u.username === task.assignedTo);
           if (user && user.unitOrganisasi) {
              const unit = normalizeUnit(user.unitOrganisasi);
              baseBebanKerja[unit] = (baseBebanKerja[unit] || 0) + 1;
           } else {
              baseBebanKerja['Lainnya'] = (baseBebanKerja['Lainnya'] || 0) + 1;
           }
        }
     });
     
     return Object.keys(baseBebanKerja).map(key => ({
        name: key,
        jumlah: baseBebanKerja[key]
     })).sort((a, b) => b.jumlah - a.jumlah).slice(0, 7); // top 7
  }, [tasks, usersList]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];



  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Laporan Kinerja Pegawai</h1>
        <p className="text-slate-500 text-sm mt-1">Evaluasi tingkat penyelesaian disposisi (Sesuai SOP).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Trend Penyelesaian */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-6">Tren Penyelesaian Disposisi (Bulanan)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataKinerja} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="selesai" name="Selesai Tepat Waktu" fill={config.primaryColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="terlambat" name="Terlambat (Alert)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribusi Beban */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-6">Distribusi Beban Kerja per Seksi</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDistribusi} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} width={180} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="jumlah" name="Jumlah Surat/Tugas" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}>
                  {dataDistribusi.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    
      <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-[16px] text-sm flex gap-3 items-start">
         <div className="mt-0.5 font-bold">INFO:</div>
         <p>Laporan ini merupakan bagian dari Feedback Loop (Tahap 6 SOP). Data yang terlambat ('merah') akan memicu alert otomatis ke staf bersangkutan melalui integrasi bot WA (jika dikonfigurasi).</p>
      </div>

    </div>
  );
}
