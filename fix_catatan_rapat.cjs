const fs = require('fs');
let content = fs.readFileSync('src/pages/user/CatatanRapat.tsx', 'utf8');

// Add print icon and modal state
content = content.replace(
  /import \{ Plus, Search, Calendar, Users, FileText, CheckCircle2, NotebookPen, X \} from 'lucide-react';/,
  "import { Plus, Search, Calendar, Users, FileText, CheckCircle2, NotebookPen, X, Printer } from 'lucide-react';"
);

content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
  `const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteForPrint, setSelectedNoteForPrint] = useState<any>(null);`
);

// Add onClick to note card
content = content.replace(
  /<div key=\{note\.id\} className="border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden bg-white">/,
  `<div key={note.id} onClick={() => setSelectedNoteForPrint(note)} className="cursor-pointer border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden bg-white">`
);

// Add the printable modal at the end, before the closing div
const printModal = `
      {/* Print Modal */}
      {selectedNoteForPrint && (
         <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col print:w-full print:max-w-none print:shadow-none print:rounded-none print:max-h-none print:h-auto">
               <div className="flex justify-between items-center p-4 border-b border-gray-100 print:hidden">
                  <h3 className="font-bold text-gray-900">Detail Catatan Rapat</h3>
                  <div className="flex items-center gap-2">
                     <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                        <Printer size={16} /> Cetak
                     </button>
                     <button onClick={() => setSelectedNoteForPrint(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                     </button>
                  </div>
               </div>
               
               <div className="p-8 overflow-y-auto print:overflow-visible print:p-8">
                  {/* Print Layout A4 Style */}
                  <div className="max-w-[210mm] mx-auto bg-white">
                     <div className="text-center mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-xl font-bold uppercase tracking-wide">NOTULENSI RAPAT</h1>
                        <p className="text-sm mt-1">{config.appName}</p>
                     </div>
                     
                     <table className="w-full text-sm mb-8">
                        <tbody>
                           <tr>
                              <td className="py-2 font-bold w-1/4 align-top">Hari, Tanggal</td>
                              <td className="py-2 px-2 w-[1%] align-top">:</td>
                              <td className="py-2 align-top">{format(new Date(selectedNoteForPrint.tanggal_jam), 'EEEE, dd MMMM yyyy', { locale: localeId })}</td>
                           </tr>
                           <tr>
                              <td className="py-2 font-bold align-top">Waktu</td>
                              <td className="py-2 px-2 align-top">:</td>
                              <td className="py-2 align-top">{format(new Date(selectedNoteForPrint.tanggal_jam), 'HH:mm', { locale: localeId })} WIB - Selesai</td>
                           </tr>
                           <tr>
                              <td className="py-2 font-bold align-top">Acara / Judul</td>
                              <td className="py-2 px-2 align-top">:</td>
                              <td className="py-2 align-top font-semibold">{selectedNoteForPrint.judul_rapat}</td>
                           </tr>
                           <tr>
                              <td className="py-2 font-bold align-top">Pimpinan Rapat</td>
                              <td className="py-2 px-2 align-top">:</td>
                              <td className="py-2 align-top">{selectedNoteForPrint.narasumber_1 || '-'}</td>
                           </tr>
                           <tr>
                              <td className="py-2 font-bold align-top">Narasumber</td>
                              <td className="py-2 px-2 align-top">:</td>
                              <td className="py-2 align-top">{selectedNoteForPrint.narasumber_2 || '-'}</td>
                           </tr>
                        </tbody>
                     </table>
                     
                     <div className="mb-6">
                        <h3 className="font-bold text-sm uppercase mb-2 border-b border-gray-300 pb-1">Uraian / Materi Pembahasan</h3>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed text-justify min-h-[100px]">
                           {selectedNoteForPrint.materi || '-'}
                        </div>
                     </div>
                     
                     <div className="mb-12">
                        <h3 className="font-bold text-sm uppercase mb-2 border-b border-gray-300 pb-1">Kesimpulan & Tindak Lanjut</h3>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed text-justify min-h-[100px]">
                           {selectedNoteForPrint.tindak_lanjut || '-'}
                        </div>
                     </div>
                     
                     <div className="flex justify-end mt-12 print:mt-16">
                        <div className="text-center w-48">
                           <p className="text-sm mb-16">Notulen,</p>
                           <p className="text-sm font-bold underline">{user?.name || '_________________'}</p>
                           <p className="text-xs mt-1">{user?.title || 'Staf'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            <style>{\`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print\\\\:block, .print\\\\:block * {
                  visibility: visible;
                }
                .print\\\\:block {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
              }
            \`}</style>
         </div>
      )}
`;

content = content.replace(/    <\/div>\n  \);\n\}\n?$/, printModal + "\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/user/CatatanRapat.tsx', content);
