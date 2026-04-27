import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useAppContext } from '../../context/AppContext';

const dataKinerja = [
  { name: 'Minggu 1', selesai: 12, terlambat: 2 },
  { name: 'Minggu 2', selesai: 19, terlambat: 1 },
  { name: 'Minggu 3', selesai: 15, terlambat: 4 },
  { name: 'Minggu 4', selesai: 22, terlambat: 0 },
];

const dataDistribusi = [
  { name: 'Seksi Pemerintahan', jumlah: 45 },
  { name: 'Seksi Kesos', jumlah: 30 },
  { name: 'Seksi Trantib', jumlah: 20 },
  { name: 'Subbag Umum', jumlah: 15 },
];

export default function AdminLaporan() {
  const { config } = useAppContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Laporan Kinerja Pegawai</h1>
        <p className="text-gray-500 text-sm mt-1">Evaluasi tingkat penyelesaian disposisi (Sesuai SOP).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Trend Penyelesaian */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-6">Tren Penyelesaian Disposisi (Bulanan)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataKinerja} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.primaryColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.primaryColor} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="selesai" name="Selesai Tepat Waktu" stroke={config.primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" />
                <Area type="monotone" dataKey="terlambat" name="Terlambat (Alert)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTerlambat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribusi Beban */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-6">Distribusi Beban Kerja per Seksi</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDistribusi} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }} width={120} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="jumlah" name="Jumlah Surat/Tugas" fill={config.primaryColor} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    
      <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start">
         <div className="mt-0.5 font-bold">INFO:</div>
         <p>Laporan ini merupakan bagian dari Feedback Loop (Tahap 6 SOP). Data yang terlambat ('merah') akan memicu alert otomatis ke staf bersangkutan melalui integrasi bot WA (jika dikonfigurasi).</p>
      </div>

    </div>
  );
}
