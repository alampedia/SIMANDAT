const fs = require('fs');
let content = fs.readFileSync('src/pages/user/DisposisiMasuk.tsx', 'utf8');

// I need to add state for the modal in DisposisiMasuk
const importRegex = /import React from 'react';/;
content = content.replace(importRegex, "import React, { useState } from 'react';");

const lucideRegex = /import \{ Inbox, CheckCircle2, Clock, CheckSquare \} from 'lucide-react';/;
content = content.replace(lucideRegex, "import { Inbox, CheckCircle2, Clock, CheckSquare, Send, X, ChevronDown } from 'lucide-react';");

const stateRegex = /const \{ user, tasks, updateTaskStatus, addNotification \} = useAppContext\(\);/;
content = content.replace(stateRegex, "const { user, tasks, updateTaskStatus, addNotification, usersList, config } = useAppContext();\n  const [disposisiModalOpen, setDisposisiModalOpen] = useState<any>(null);\n  const [disposisiForm, setDisposisiForm] = useState({ tujuan: '', instruksi: 'Tindaklanjuti' });\n  const isKasiOrKasubag = (user?.role || '').toLowerCase().includes('kasi') || (user?.role || '').toLowerCase().includes('kasubag');");

const actionButtonsRegex = /\{task\.status === 'pending_target' \? \([\s\S]*?<\/button>\s*\) : \(/;

const newActionButtons = `{task.status === 'pending_target' ? (
                     <div className="flex flex-col sm:flex-row gap-2 w-full">
                       <button 
                         onClick={() => {
                            updateTaskStatus(task.id, 'in_progress', 'Mulai mengerjakan tindak lanjut dari disposisi', undefined, 10);
                            addNotification(\`Status \${task.id} diubah menjadi Sedang Dikerjakan\`);
                         }}
                         className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                       >
                          <CheckCircle2 size={16} /> Kerjakan Sendiri
                       </button>
                       {isKasiOrKasubag && task.disposisiType !== 'akhir' && (
                         <button 
                           onClick={() => {
                              setDisposisiModalOpen(task);
                           }}
                           className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-100 transition-all active:scale-95"
                         >
                            <Send size={16} /> Teruskan ke Staf
                         </button>
                       )}
                     </div>
                  ) : (`;

content = content.replace(actionButtonsRegex, newActionButtons);

// Add Modal
const modalStr = `
      {/* Disposisi Modal untuk Kasi/Kasubag */}
      {disposisiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDisposisiModalOpen(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">Disposisi ke Staf / Pelaksana</h2>
              <button onClick={() => setDisposisiModalOpen(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={(e) => {
                 e.preventDefault();
                 if(!disposisiForm.tujuan) return;
                 // Re-assign task to pelaksana, status remains pending_target
                 updateTaskStatus(disposisiModalOpen.id, 'pending_target', disposisiForm.instruksi, disposisiForm.tujuan);
                 addNotification(\`Tugas berhasil diteruskan ke \${disposisiForm.tujuan}\`);
                 setDisposisiModalOpen(null);
                 setDisposisiForm({ tujuan: '', instruksi: 'Tindaklanjuti' });
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Staf Pelaksana</label>
                  <div className="relative">
                    <select 
                      required
                      value={disposisiForm.tujuan}
                      onChange={e => setDisposisiForm({...disposisiForm, tujuan: e.target.value})}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>-- Pilih Staf --</option>
                      {usersList.filter(u => {
                         const uRoleLower = (u.role || '').toLowerCase();
                         if (!uRoleLower.includes('pelaksana') && !uRoleLower.includes('staf')) return false;
                         
                         const myTitleWords = (user?.title || '').toLowerCase().replace(/kepala|seksi|sub|bag|bagian|&/g, '').trim().split(/\\s+/);
                         const uTitleLower = (u.title || '').toLowerCase();
                         const hasMatch = myTitleWords.some(word => word.length > 3 && uTitleLower.includes(word));
                         
                         if (myTitleWords.length > 0 && myTitleWords.some(w => w.length > 3)) {
                             if (!hasMatch) return false;
                         }
                         return !user?.opd || u.opd === user?.opd;
                      }).map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instruksi Tambahan</label>
                  <input
                    type="text"
                    value={disposisiForm.instruksi}
                    onChange={e => setDisposisiForm({...disposisiForm, instruksi: e.target.value})}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setDisposisiModalOpen(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200">Batal</button>
                   <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 flex items-center gap-2"><Send size={14}/> Teruskan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n}", modalStr + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/user/DisposisiMasuk.tsx', content);
