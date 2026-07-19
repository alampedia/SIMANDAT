import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { NotebookPen, Plus, Search, Calendar, Users, FileText, ChevronRight, CheckCircle2, Printer, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CatatanRapat() {
  const { user, config } = useAppContext();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteForPrint, setSelectedNoteForPrint] = useState<any>(null);

  const [formData, setFormData] = useState({
    tanggalJam: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    judulRapat: '',
    narasumber1: '',
    narasumber2: '',
    materi: '',
    tindakLanjut: ''
  });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      if (config.supabaseUrl && config.supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        let query = supabase.from('catatan_rapat').select('*').order('tanggal_jam', { ascending: false });
        // Jika bukan admin/pimpinan, mungkin hanya melihat catatan yang dia buat, atau biarkan semua melihat
        // Kita biarkan semua bisa melihat sesuai kebijakan
        const { data, error } = await query;
        if (!error && data) {
          setNotes(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [config.supabaseUrl, config.supabaseKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.supabaseUrl || !config.supabaseKey) return;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      const { error } = await supabase.from('catatan_rapat').insert({
        tanggal_jam: new Date(formData.tanggalJam).toISOString(),
        judul_rapat: formData.judulRapat,
        narasumber_1: formData.narasumber1,
        narasumber_2: formData.narasumber2,
        materi: formData.materi,
        tindak_lanjut: formData.tindakLanjut,
        created_by: user?.username
      });

      if (!error) {
        setIsModalOpen(false);
        setFormData({
          tanggalJam: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          judulRapat: '',
          narasumber1: '',
          narasumber2: '',
          materi: '',
          tindakLanjut: ''
        });
        fetchNotes();
      } else {
        alert("Gagal menyimpan: " + error.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const filteredNotes = notes.filter(n => n.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()) || (n.materi || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <NotebookPen className="text-blue-600" /> Catatan Rapat
           </h1>
           <p className="text-gray-500 text-sm mt-1">Dokumentasi hasil dan tindak lanjut rapat (Notulen).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all"
          style={{ backgroundColor: config.primaryColor }}
        >
          <Plus size={18} /> Tambah Catatan
        </button>
      </header>

      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
         <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul rapat atau materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
         </div>

         {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat catatan...</div>
         ) : filteredNotes.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                 <NotebookPen size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada catatan rapat.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredNotes.map(note => (
                 <div key={note.id} onClick={() => setSelectedNoteForPrint(note)} className="cursor-pointer border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden bg-white">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: config.primaryColor }}></div>
                    <div className="pl-3">
                       <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-500">
                         <Calendar size={14} className="text-blue-500" />
                         {format(new Date(note.tanggal_jam), 'EEEE, dd MMM yyyy - HH:mm', { locale: localeId })}
                       </div>
                       <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                         {note.judul_rapat}
                       </h3>
                       
                       <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-2">
                             <Users size={16} className="text-gray-400 mt-0.5 shrink-0" />
                             <div className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-1">Narasumber:</span>
                                <ol className="list-decimal pl-4 space-y-0.5">
                                  {note.narasumber_1 && <li>{note.narasumber_1}</li>}
                                  {note.narasumber_2 && <li>{note.narasumber_2}</li>}
                                </ol>
                             </div>
                          </div>
                          
                          <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
                             <FileText size={16} className="text-amber-500 mt-0.5 shrink-0" />
                             <div className="text-sm text-gray-600 w-full">
                                <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-1">Materi:</span>
                                <p className="line-clamp-3 bg-amber-50/50 p-2 rounded-lg text-amber-900">{note.materi || '-'}</p>
                             </div>
                          </div>

                          <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
                             <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                             <div className="text-sm text-gray-600 w-full">
                                <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-1">Tindak Lanjut:</span>
                                <p className="line-clamp-2 bg-emerald-50/50 p-2 rounded-lg text-emerald-900">{note.tindak_lanjut || '-'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <NotebookPen className="text-blue-600" /> Buat Catatan Rapat Baru
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  ✕
                </button>
             </div>
             
             <div className="overflow-y-auto p-6">
                <form id="rapat-form" onSubmit={handleSubmit} className="space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Hari / Tanggal / Jam</label>
                        <input 
                          type="datetime-local" 
                          required
                          value={formData.tanggalJam}
                          onChange={(e) => setFormData({...formData, tanggalJam: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Rapat</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Masukkan judul atau agenda rapat..."
                          value={formData.judulRapat}
                          onChange={(e) => setFormData({...formData, judulRapat: e.target.value})}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                   </div>

                   <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">Narasumber</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Narasumber 1</label>
                            <input 
                              type="text" 
                              placeholder="Nama narasumber 1..."
                              value={formData.narasumber1}
                              onChange={(e) => setFormData({...formData, narasumber1: e.target.value})}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Narasumber 2</label>
                            <input 
                              type="text" 
                              placeholder="Nama narasumber 2..."
                              value={formData.narasumber2}
                              onChange={(e) => setFormData({...formData, narasumber2: e.target.value})}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                            />
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Materi / Catatan</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Rincian materi yang dibahas..."
                        value={formData.materi}
                        onChange={(e) => setFormData({...formData, materi: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:border-transparent outline-none transition-all resize-y min-h-[100px]"
                      ></textarea>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Tindak Lanjut</label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Apa yang harus dilakukan selanjutnya..."
                        value={formData.tindakLanjut}
                        onChange={(e) => setFormData({...formData, tindakLanjut: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:border-transparent outline-none transition-all resize-y min-h-[80px]"
                      ></textarea>
                   </div>
                </form>
             </div>
             
             <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  form="rapat-form"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <NotebookPen size={16} /> Simpan Catatan
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {selectedNoteForPrint && (
         <div className="print-modal-container fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
            
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-modal-container, .print-modal-container * {
                  visibility: visible;
                }
                .print-modal-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white !important;
                  margin: 0;
                  padding: 0;
                }
                @page { margin: 1cm; size: a4; }
              }
            `}</style>
         </div>
      )}

    </div>
  );
}