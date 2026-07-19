const fs = require('fs');
let content = fs.readFileSync('src/pages/user/ManajemenSurat.tsx', 'utf8');

content = content.replace(
  /type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '' \}/g,
  "type: 'masuk', priority: 'Biasa', driveUrl: '', assignedTo: '', tindakLanjut: 'verifikasi_sekcam' }"
);

content = content.replace(
  /let newStatus = 'pending_sekcam'; \/\/ Selalu ke sekcam dulu untuk verifikasi/,
  "let newStatus = newDoc.tindakLanjut === 'tugas_langsung' ? 'pending_target' : 'pending_sekcam';"
);

// Add the URL input field and Tindak Lanjut dropdown to the form
const urlAndTindakLanjutInputs = `
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL / Link Lampiran (Drive, dll)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newDoc.driveUrl}
                      onChange={e => setNewDoc({...newDoc, driveUrl: e.target.value})}
                      placeholder="https://..."
                      className="flex-1 bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': config.primaryColor }}
                    />
                    {newDoc.driveUrl && (
                      <a 
                        href={newDoc.driveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors shrink-0"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alur Proses Naskah</label>
                  <div className="relative">
                    <select 
                      value={newDoc.tindakLanjut}
                      onChange={e => setNewDoc({...newDoc, tindakLanjut: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="verifikasi_sekcam">Proses Review / Mapping (Sekcam -> Camat)</option>
                      <option value="tugas_langsung">Tugas Langsung ke Target</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
`;

content = content.replace(
  /<div>\s*<label className="block text-xs font-bold text-gray-700 mb-1">Tujuan \/ Kepada \(Opsional\)<\/label>/,
  urlAndTindakLanjutInputs + '\n                  <div>\n                    <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan / Kepada (Opsional)</label>'
);

fs.writeFileSync('src/pages/user/ManajemenSurat.tsx', content);
