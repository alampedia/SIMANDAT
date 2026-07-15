import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { NotebookPen, Plus, Search, Calendar, Users, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CatatanRapat() {
  const { user, config } = useAppContext();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
                 <div key={note.id} className="border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden bg-white">
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
    </div>
  );
}
