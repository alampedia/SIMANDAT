const fs = require('fs');
const content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

// Add detailDoc state
let updated = content.replace(
  /const \[editDoc, setEditDoc\] = useState<any>\(null\);/,
  "const [detailDoc, setDetailDoc] = useState<any>(null);\n  const [editDoc, setEditDoc] = useState<any>(null);"
);

// Replace Buka Detail button
const replacementBtn = `                        <button onClick={() => setDetailDoc(doc)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                           <ExternalLink size={14} />
                           Buka Detail
                        </button>`;

updated = updated.replace(
  /<button onClick=\{\(\) => doc\.driveUrl \? window\.open\(doc\.driveUrl, "_blank"\) : alert\("Link dokumen tidak tersedia\."\)\} className="flex-1 sm:flex-none flex items-center justify-center gap-1\.5 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">\s*<ExternalLink size=\{14\} \/>\s*Buka Detail\s*<\/button>/,
  replacementBtn
);

// Replace condition for Edit / Hapus
updated = updated.replace(
  /\{\(isReviewer \|\| doc\.sender === user\?\.name\) && \(/,
  "{true && ("
);

// Add Detail Modal JSX right before Edit Modal
const detailModal = `
      {/* Detail Document Modal */}
      {detailDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetailDoc(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Detail Naskah</h2>
              <button onClick={() => setDetailDoc(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nomor Surat</span>
                   <p className="font-medium text-gray-900">{detailDoc.nomorSurat || '-'}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Judul / Perihal</span>
                   <p className="font-medium text-gray-900">{detailDoc.title}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Pengirim</span>
                   <p className="font-medium text-gray-900">{detailDoc.sender}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</span>
                     <p className="font-medium text-gray-900">{detailDoc.status.replace(/_/g, ' ')}</p>
                   </div>
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Prioritas</span>
                     <p className="font-medium text-gray-900">{detailDoc.priority}</p>
                   </div>
                 </div>
                 {detailDoc.driveUrl && (
                   <div className="pt-2">
                     <button onClick={() => window.open(detailDoc.driveUrl, "_blank")} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                        <ExternalLink size={16} /> Buka Dokumen Asli
                     </button>
                   </div>
                 )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <Clock size={18} className="text-gray-400" />
                   Riwayat & Progres
                </h3>
                <div className="space-y-4">
                  {detailDoc.history && detailDoc.history.map((h, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5"></div>
                        {idx !== detailDoc.history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex-1">
                        <p className="text-sm text-gray-800 font-medium">{h.action}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="font-bold">{h.actor}</span>
                          <span>•</span>
                          <span>{new Date(h.date).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!detailDoc.history || detailDoc.history.length === 0) && (
                    <p className="text-sm text-gray-500 italic">Belum ada riwayat.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

updated = updated.replace(/\{\/\* Edit Document Modal \*\/\}/, detailModal + "\n      {/* Edit Document Modal */}");

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', updated);
