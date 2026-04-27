import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Briefcase, ChevronRight, ShieldCheck, UserCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Global specific Tupoksi definitions
// Mapped by user role or could be dynamically configurable. 
// For now we map standard structural items.
const TUPOKSI_DB: Record<string, string[]> = {
  'admin': [
     'Memastikan infrastruktur TIK dan server berjalan normal 24/7.',
     'Mengelola dan mengawasi database Naskah Dinas Terpadu.',
     'Memelihara konfigurasi pengguna, API WA, Gemini, dan tema sistem.',
     'Melakukan pencadangan (backup) data sistem berkala setiap bulan.'
  ],
  'camat': [
     'Memimpin dan membina pelaksanaan tugas penyelenggaraan pemerintahan.',
     'Memberikan instruksi dan disposisi akhir pada surat masuk strategis.',
     'Memantau dan mengevaluasi laporan kinerja dari seluruh perangkat.',
     'Merumuskan kebijakan teknis pelaksanaan di tingkat kecamatan.'
  ],
  'sekcam': [
     'Mengoordinasikan pelaksanaan tugas seluruh seksi di kecamatan.',
     'Menyelenggarakan urusan umum, kepegawaian, keuangan, dan perlengkapan.',
     'Melakukan verifikasi dan telaah awal terhadap seluruh naskah dinas masuk.',
     'Meneruskan draf rekomendasi kepada Camat.'
  ],
  'kabag': [
     'Melaksanakan tugas manajerial dan kepemimpinan di tingkat Bagian.',
     'Menyusun program teknis dan mengevaluasi laporan progres dari Kasi.',
     'Menjamin kelancaran administrasi dan fungsi birokrasi struktural.'
  ],
  'kasi': [
     'Menerima delegasi tugas disposisi di bidang kewenangannya (Pemerintahan, Trantib, dll).',
     'Mengelola bawahan (Staf Pelaksana) untuk teknis penyelesaian tugas.',
     'Menyusun laporan kinerja teknis pelaksanaan kegiatan.',
     'Membantu Sekcam dan Camat dalam pembinaan teknis.'
  ],
  'staf_agenda': [
     'Menerima, mengagendakan, dan mendistribusikan surat masuk/keluar.',
     'Memeriksa kelengkapan administrasi dokumen fisik dan digital.',
     'Melakukan pengarsipan naskah dinas secara berkala.',
     'Membantu kelancaran administrasi pimpinan.'
  ],
  'staf_pelaksana': [
     'Melaksanakan tugas teknis kedinasan dari Kasi / Atasan Langsung.',
     'Memproses dokumen sesuai dengan tenggat waktu.',
     'Menginput jurnal kinerja harian secara real-time pada sistem.',
     'Menyusun bahan draf konsep surat/dokumen kerja.'
  ]
};

export default function TupoksiPage() {
  const { user, config } = useAppContext();

  const activeTupoksi = user?.tupoksi 
    ? user.tupoksi.split('\n').filter(Boolean)
    : TUPOKSI_DB[user?.role || ''] || [];

  return (
    <div className="space-y-6 lg:px-4 pb-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
           <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tupoksi Pegawai</h1>
          <p className="text-gray-500 text-sm">Tugas Pokok dan Fungsi berdasarkan nomenklatur jabatan.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: config.primaryColor }} />
         
         <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
               <UserCircle2 size={32} className="text-gray-400" />
            </div>
            <div>
               <h3 className="font-bold text-lg text-gray-900 leading-tight">{user?.name}</h3>
               <p className="text-gray-600 text-sm">{user?.title}</p>
               <span className="inline-flex px-2 py-0.5 mt-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded uppercase tracking-wider">
                 Role: {user?.role.replace('_', ' ')}
               </span>
            </div>
         </div>

         <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
               <ShieldCheck size={18} className="text-green-600" />
               Daftar Uraian Tugas
            </h4>

            {activeTupoksi.length === 0 ? (
               <div className="text-sm italic text-gray-500 bg-gray-50 p-4 rounded-xl text-center border border-dashed">
                  Belum ada profil tupoksi yang diatur untuk NIP ini.
               </div>
            ) : (
               <div className="space-y-3">
                  {activeTupoksi.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                       <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {index + 1}
                       </div>
                       <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {item}
                       </p>
                    </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
