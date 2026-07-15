import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ExternalLink, Search, Clock, Link as LinkIcon, Plus, X, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface Dokumen {
  id: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  link_drive: string;
  created_at: string;
}

export default function GenericFeaturePage({ title, description, isList }: { title: string, description?: string, isList?: boolean }) {
  const { config, user, addNotification } = useAppContext();
  
  const isAdmin = user?.role === 'admin';
  const kategori = title.toLowerCase().includes('jdih') ? 'jdih' : title.toLowerCase().includes('sop') ? 'sop' : 'other';
  
  const [docs, setDocs] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Dokumen | null>(null);
  const [form, setForm] = useState({ id: '', judul: '', deskripsi: '', link_drive: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    if (config.supabaseUrl && config.supabaseKey && isList && (kategori === 'jdih' || kategori === 'sop')) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const { data, error } = await supabase.from('dokumen_referensi').select('*').eq('kategori', kategori).order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setDocs(data as Dokumen[]);
      } catch (err: any) {
        console.error("DB Error fetch docs:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [config.supabaseUrl, config.supabaseKey, kategori, isList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        if (form.id) {
           const { error } = await supabase.from('dokumen_referensi').update({
              judul: form.judul,
              deskripsi: form.deskripsi,
              link_drive: form.link_drive
           }).eq('id', form.id);
           if (error) throw error;
           addNotification(`Dokumen ${title} berhasil diperbarui.`);
        } else {
           const { error } = await supabase.from('dokumen_referensi').insert([{ 
              kategori, 
              judul: form.judul, 
              deskripsi: form.deskripsi, 
              link_drive: form.link_drive, 
              created_by: user?.username 
           }]);
           if (error) throw error;
           addNotification(`Dokumen ${title} berhasil ditambahkan.`);
        }
        
        setForm({ id: '', judul: '', deskripsi: '', link_drive: '' });
        setShowModal(false);
        fetchDocs();
      } catch (err: any) {
        console.error("Error saving doc:", err);
        addNotification(`Gagal menyimpan ke database Supabase: ${err.message}.`);
      }
    } else {
        addNotification(`Sistem belum terhubung ke database. Silakan isi URL dan Key Supabase di Menu Pengaturan.`);
    }
  };

  const handleDelete = async (id: string) => {
     if(!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
     if (config.supabaseUrl && config.supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(config.supabaseUrl, config.supabaseKey);
          
          const { error } = await supabase.from('dokumen_referensi').delete().eq('id', id);
          if (error) throw error;
          addNotification(`Dokumen berhasil dihapus.`);
          fetchDocs();
        } catch (err: any) {
          addNotification(`Gagal menghapus dokumen: ${err.message}`);
        }
     }
  };

  const filteredDocs = docs.filter(doc => doc.judul.toLowerCase().includes(searchQuery.toLowerCase()) || (doc.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{description || 'Melihat dan menambahkan tautan referensi eksternal.'}</p>
        </div>
        {isList && isAdmin && (kategori === 'jdih' || kategori === 'sop') && (
          <button 
             onClick={() => {
                setForm({ id: '', judul: '', deskripsi: '', link_drive: '' });
                setShowModal(true);
             }} 
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> Tambah URL Baru
          </button>
        )}
      </header>
      
      {isList && (kategori === 'jdih' || kategori === 'sop') ? (
        <div className="space-y-4">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari dokumen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>

          {loading ? (
             <div className="p-8 text-center text-sm font-medium text-gray-500">Memuat data dari database...</div>
          ) : filteredDocs.length === 0 ? (
             <div className="p-8 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-sm font-medium">
               Belum ada dokumen {title} yang ditambahkan ke database atau sesuai dengan pencarian Anda. 
             </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="group block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-300 cursor-pointer" onClick={() => setDetailDoc(doc)}>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 min-w-0 w-full flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                       <LinkIcon size={20} />
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900 text-sm mb-1">{doc.judul}</h3>
                       <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                         <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: localeId })}</span>
                         {doc.deskripsi && <span className="truncate max-w-[200px] sm:max-w-xs">- {doc.deskripsi}</span>}
                       </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                     <a href={doc.link_drive} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <ExternalLink size={16} />
                     </a>
                     {isAdmin && (
                        <>
                           <button onClick={(e) => { e.stopPropagation();
                              setForm({ id: doc.id, judul: doc.judul, deskripsi: doc.deskripsi || '', link_drive: doc.link_drive });
                              setShowModal(true);
                           }} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                              <Edit size={16} />
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                              <Trash2 size={16} />
                           </button>
                        </>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
           <div className="w-20 h-20 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <div className="w-10 h-10 rounded-full animate-bounce" style={{ backgroundColor: config.primaryColor }} />
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Segera Hadir</h3>
           <p className="text-gray-500 text-sm max-w-md mx-auto">
              Modul {title} saat ini telah aktif di rute dan akses role, namun fungsionalitas tabelnya sedang dalam penyempurnaan UI/UX agar presisi dan nyaman digunakan.
           </p>
        </div>
      )}

      
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

      {/* MODAL ADD / EDIT */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-gray-900">{form.id ? 'Edit' : 'Tambah'} {title}</h2>
                 <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Judul Dokumen</label>
                    <input 
                      type="text" required
                      value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder={`Contoh: Dokumen Referensi / Link Drive`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Link URL Drive</label>
                    <input 
                      type="url" required
                      value={form.link_drive} onChange={e => setForm({...form, link_drive: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Deskripsi (Opsional)</label>
                    <textarea 
                      value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Catatan tambahan..." rows={2}
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(79,70,229,0.2)]">
                      {form.id ? 'Simpan Perubahan' : 'Simpan Ke Database'}
                    </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
