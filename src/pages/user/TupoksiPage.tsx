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
     'Memimpin dan membina pelaksanaan tugas penyelenggaraan pemerintahan di wilayah kecamatan.',
     'Memberikan instruksi dan disposisi akhir pada surat masuk strategis.',
     'Memantau dan mengevaluasi laporan kinerja dari seluruh perangkat.',
     'Merumuskan kebijakan teknis pelaksanaan di tingkat kecamatan.'
  ],
  'kapolsek': [
     'Memimpin dan membina pelaksanaan tugas kepolisian di wilayah sektor (Polsek).',
     'Memberikan instruksi dan disposisi akhir pada surat masuk strategis terkait kamtibmas.',
     'Memantau dan mengevaluasi kinerja anggota Polri di tingkat sektor.',
     'Mengoordinasikan kegiatan keamanan dan ketertiban dengan unsur muspika lainnya.'
  ],
  'danramil': [
     'Memimpin dan membina pelaksanaan tugas komando rayon militer (Koramil).',
     'Memberikan instruksi dan disposisi akhir pada instansi militer tingkat rayon.',
     'Memantau aktivitas pembinaan teritorial (Binter) dan kinerja Babinsa.',
     'Mengoordinasikan stabilitas pertahanan dan kamtibmas bersinergi dengan unsur muspika.'
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

  let effectiveRole = (user?.role || 'staf_pelaksana').toLowerCase().trim();
  if (['pelaksana', 'sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'].includes(effectiveRole)) {
    effectiveRole = 'staf_pelaksana';
  }
  if (effectiveRole.includes('danramil') || effectiveRole.includes('kapolsek') || effectiveRole.includes('camat')) {
    effectiveRole = 'camat';
  }

  const activeTupoksi = user?.tupoksi 
    ? user.tupoksi.split('\n').filter(Boolean)
    : TUPOKSI_DB[effectiveRole] || [];

  return (
    <div className="space-y-6 lg:px-4 pb-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
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
               <span className="inline-flex px-2 py-0.5 mt-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider">
                 Role: {user?.role.replace('_', ' ')}
               </span>
            </div>
         </div>

         <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
               <ShieldCheck size={18} className="text-green-600" />
               Daftar Uraian Tugas Pokok
            </h4>

            {activeTupoksi.length === 0 ? (
               <div className="text-sm italic text-gray-500 bg-gray-50 p-4 rounded-xl text-center border border-dashed mb-8">
                  Belum ada profil tupoksi utama yang diatur untuk NIP ini.
               </div>
            ) : (
               <div className="space-y-3 mb-8">
                  {activeTupoksi.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                       <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                          {index + 1}
                       </div>
                       <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {item}
                       </p>
                    </div>
                  ))}
               </div>
            )}
            
            {user?.tugasSehariHari && (
               <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                     <ClipboardList size={18} className="text-blue-600" />
                     Daftar Tugas Sehari-Hari (Informatif)
                  </h4>
                  <div className="space-y-3">
                     {user.tugasSehariHari.split('\n').filter(Boolean).map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/30 hover:bg-blue-50/80 transition-colors border border-blue-100/50">
                           <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                           <p className="text-sm text-gray-700 leading-relaxed font-medium">
                              {item}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
