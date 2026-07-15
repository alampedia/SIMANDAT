const fs = require('fs');
let content = fs.readFileSync('src/pages/user/GenericFeaturePage.tsx', 'utf8');

const detailModal = `
      {/* DETAIL MODAL */}
      {detailDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailDoc(null)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
               <h2 className="text-lg font-bold text-gray-900">Detail {title}</h2>
               <button onClick={() => setDetailDoc(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors -mr-2">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 overflow-y-auto space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Judul Dokumen</span>
                     <p className="font-medium text-gray-900 text-lg">{detailDoc.judul}</p>
                   </div>
                   {detailDoc.deskripsi && (
                     <div>
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Deskripsi</span>
                       <p className="font-medium text-gray-700">{detailDoc.deskripsi}</p>
                     </div>
                   )}
                   <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Dibuat</span>
                     <p className="font-medium text-gray-900">{format(new Date(detailDoc.created_at), 'dd MMM yyyy, HH:mm', { locale: localeId })}</p>
                   </div>
                   <div className="pt-2">
                     <a href={detailDoc.link_drive} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                        <ExternalLink size={16} /> Buka Dokumen Asli
                     </a>
                   </div>
                   {isAdmin && (
                     <div className="pt-4 flex gap-2 border-t border-gray-200 mt-4">
                        <button onClick={() => {
                          setForm({ id: detailDoc.id, judul: detailDoc.judul, deskripsi: detailDoc.deskripsi || '', link_drive: detailDoc.link_drive });
                          setDetailDoc(null);
                          setShowModal(true);
                        }} className="flex-1 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors flex justify-center items-center gap-2">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => {
                           handleDelete(detailDoc.id);
                           setDetailDoc(null);
                        }} className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex justify-center items-center gap-2">
                          <Trash2 size={16} /> Hapus
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
`;

if (!content.includes('setDetailDoc')) {
  // Add state
  content = content.replace(
    /const \[showModal, setShowModal\] = useState\(false\);/,
    "const [showModal, setShowModal] = useState(false);\n  const [detailDoc, setDetailDoc] = useState<Dokumen | null>(null);"
  );

  // Add detailModal before existing modal
  content = content.replace(
    /\{\/\* MODAL ADD \/ EDIT \*\/\}/,
    detailModal + '\n      {/* MODAL ADD / EDIT */}'
  );

  // Update card to be clickable to open detail
  content = content.replace(
    /className="group block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-300"/g,
    'className="group block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-300 cursor-pointer" onClick={() => setDetailDoc(doc)}'
  );
  
  // We need to stop propagation on the buttons inside the card
  content = content.replace(
    /<button onClick=\{\(\) => \{[\s\S]*?className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">/g,
    (match) => match.replace("onClick={() => {", "onClick={(e) => { e.stopPropagation();")
  );
  content = content.replace(
    /<button onClick=\{\(\) => handleDelete\(doc\.id\)\} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">/g,
    '<button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">'
  );
  content = content.replace(
    /<a href=\{doc\.link_drive\} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">/g,
    '<a href={doc.link_drive} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">'
  );

  fs.writeFileSync('src/pages/user/GenericFeaturePage.tsx', content);
}
