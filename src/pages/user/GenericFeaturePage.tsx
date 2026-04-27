import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ExternalLink, Search, Clock, Link as LinkIcon, Plus, X } from 'lucide-react';
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
  const [form, setForm] = useState({ judul: '', deskripsi: '', link_drive: '' });

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
    if (!form.judul || !form.link_drive) return;

    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const { error } = await supabase.from('dokumen_referensi').insert([{
           kategori,
           judul: form.judul,
           deskripsi: form.deskripsi,
           link_drive: form.link_drive,
           created_by: user?.username
        }]);

        if (error) throw error;
        
        addNotification(`Dokumen ${title} berhasil ditambahkan ke database.`);
        setForm({ judul: '', deskripsi: '', link_drive: '' });
        setShowModal(false);
        fetchDocs();
      } catch (err: any) {
        console.error("Error saving doc:", err);
        addNotification(`Gagal menyimpan ke database Supabase: ${err.message}. Solusi: Cek format URL / koneksi internet Anda.`);
      }
    } else {
        addNotification(`Sistem belum terhubung ke database. Silakan isi URL dan Key Supabase di Menu Pengaturan agar data tersimpan.`);
    }
  };

  return (
    <div className="space-y-6 lg:px-4 pb-12">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{description || 'Melihat dan menambahkan tautan referensi eksternal.'}</p>
        </div>
        {isList && isAdmin && (kategori === 'jdih' || kategori === 'sop') && (
          <button 
             onClick={() => setShowModal(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            + Tambah URL Baru
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
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:border-transparent focus:ring-indigo-500 shadow-sm transition-all"
            />
          </div>

          {loading ? (
             <div className="p-8 text-center text-sm font-medium text-gray-500">Memuat data dari database...</div>
          ) : docs.length === 0 ? (
             <div className="p-8 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-sm font-medium">
               Belum ada dokumen {title} yang ditambahkan ke database. {isAdmin && 'Klik tombol Tambah URL Baru di atas untuk menambah referensi.'}
             </div>
          ) : (
            docs.map((doc) => (
              <a 
                key={doc.id}
                href={doc.link_drive}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-100 transition-all duration-300"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <LinkIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate mb-1 group-hover:text-indigo-600 transition-colors">
                      {doc.judul}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: localeId })}</span>
                      {doc.deskripsi && <span className="truncate max-w-[150px] sm:max-w-xs">- {doc.deskripsi}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 p-2 text-gray-300 group-hover:text-indigo-500 transition-colors">
                    <ExternalLink size={20} />
                  </div>
                </div>
              </a>
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

      {/* MODAL ADD */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-gray-900">Tambah {title}</h2>
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder={`Contoh: Dokumen Referensi / Link Drive`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Link URL Drive</label>
                    <input 
                      type="url" required
                      value={form.link_drive} onChange={e => setForm({...form, link_drive: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Deskripsi (Opsional)</label>
                    <textarea 
                      value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Catatan tambahan..." rows={2}
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(79,70,229,0.2)]">
                      Simpan Ke Database
                    </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
