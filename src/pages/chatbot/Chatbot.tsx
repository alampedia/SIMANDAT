import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Users, Shield, MessageSquare, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Chatbot() {
  const { user, config } = useAppContext();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const role = user?.role || 'staf_pelaksana';
  const roleLower = role.toLowerCase();
  const isLeader = (roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris')) || roleLower.includes('sekcam') || roleLower.includes('kapolsek') || roleLower.includes('danramil');

  const handleSendFonnte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.waApiKey || !config.waGroupId || !message) {
      setStatus('error');
      setFeedback('Token Fonnte, ID Target Grup, atau Pesan belum disetel/kosong. Hubungi Admin.');
      return;
    }

    setStatus('loading');

    try {
      const formdata = new FormData();
      formdata.append("target", config.waGroupId);
      formdata.append("message", `[Dari: ${user?.name || user?.username || 'Pengguna'}]\n${message}`);

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': config.waApiKey,
        },
        body: formdata
      });

      const result = await response.json();
      
      if (result.status) {
        setStatus('success');
        setFeedback('Pesan berhasil dikirim ke WhatsApp!');
        setMessage('');
      } else {
        setStatus('error');
        setFeedback(result.reason || 'Gagal mengirim pesan.');
      }
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.message || 'Terjadi kesalahan jaringan.');
    }
  };

  if (isLeader) {
     return (
        <div className="flex flex-col h-[calc(100vh-[160px])] min-h-[500px] px-4 pt-4 lg:px-6 relative z-10 w-full max-w-7xl mx-auto pb-24">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-0 flex flex-col h-full overflow-hidden">
             <div className="bg-green-600 p-4 flex items-center gap-3 text-white sticky top-0 z-20">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                   <Users size={20} />
                </div>
                <div>
                   <h2 className="font-bold text-lg leading-tight">Grup Komando (Monitoring)</h2>
                   <p className="text-xs text-green-100">Live feed WhatsApp: {config.waGroupId || '120363426010181190@g.us'}</p>
                </div>
             </div>
             <div className="flex-1 bg-[#e5ddd5] p-4 overflow-y-auto space-y-4 relative no-scrollbar">
                {/* Background pattern WA */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/508/887/HD-wallpaper-whatsapp-background-theme-pattern.jpg")', backgroundSize: 'cover' }}></div>
                
                <div className="flex justify-center mb-6">
                   <span className="bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm">Hari Ini</span>
                </div>

                <div className="flex items-start gap-2 relative z-10">
                   <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%] md:max-w-[70%]">
                      <p className="text-xs font-bold text-blue-500 mb-1">Staf Pemerintahan</p>
                      <p className="text-sm text-gray-800">Laporan giat hari ini berjalan lancar. Seluruh data sudah diinput ke dalam sistem SI-MANDAT.</p>
                      <p className="text-[10px] text-gray-400 text-right mt-1">10:45</p>
                   </div>
                </div>

                <div className="flex items-start gap-2 relative z-10">
                   <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%] md:max-w-[70%]">
                      <p className="text-xs font-bold text-orange-500 mb-1">Babinsa (Sertu Budi)</p>
                      <p className="text-sm text-gray-800">Izin melaporkan, patroli wilayah aman terkendali.</p>
                      <p className="text-[10px] text-gray-400 text-right mt-1">11:15</p>
                   </div>
                </div>

                <div className="flex items-start gap-2 relative z-10">
                   <div className="bg-[#dcf8c6] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%] md:max-w-[70%]">
                      <p className="text-xs font-bold text-green-600 mb-1">Sistem SI-MANDAT</p>
                      <p className="text-sm text-gray-800">Surat peringatan otomatis: 3 naskah disposisi mendekati batas waktu tenggat.</p>
                      <p className="text-[10px] text-gray-400 text-right mt-1">12:00</p>
                   </div>
                </div>
                
                <div className="flex items-center justify-center p-4">
                   <span className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full text-xs text-gray-500 font-medium border border-gray-200">
                      Sinkronisasi Fonnte Webhook Aktif
                   </span>
                </div>
             </div>
             
             {/* Fake input for leader view to simulate WA */}
             <div className="bg-[#f0f0f0] p-3 flex items-center gap-2">
                <input type="text" readOnly placeholder="Mode pantau (hanya baca)..." className="flex-1 bg-white border border-transparent rounded-full px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed" />
             </div>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-[160px])] min-h-[500px] px-4 pt-4 lg:px-6 relative z-10 w-full max-w-4xl mx-auto pb-24">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full bg-clip-padding relative overflow-hidden backdrop-blur-2xl">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-green-500 shrink-0">
             <MessageSquare size={24} />
          </div>
          <div>
             <h2 className="text-xl font-bold text-gray-900 tracking-tight">Kirim Pesan WA Grup</h2>
             <p className="text-sm text-gray-500">Berkomunikasi langsung via Fonnte API</p>
          </div>
        </div>

        {(!config.waApiKey || !config.waGroupId) ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
              <Shield size={48} className="text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-700 text-lg mb-2">Konfigurasi Belum Lengkap</h3>
              <p className="text-gray-500 text-sm max-w-sm">Admin belum menyetel Token API Fonnte atau ID Grup Target. Hubungi administrator sistem.</p>
           </div>
        ) : (
        <form onSubmit={handleSendFonnte} className="space-y-4 flex-1 flex flex-col relative z-10">
           
           <div className="bg-gray-50 flex-1 p-4 rounded-2xl border border-gray-100 flex flex-col">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tulis Pesan (Brodcast ke Grup)</label>
             <textarea
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder={`Tulis arahan, laporan, atau pesan yang akan dikerim ke Grup WhatsApp (Target ID: ${config.waGroupId})...`}
               className="w-full flex-1 bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none transition-shadow disabled:opacity-50"
               disabled={status === 'loading'}
             />
           </div>

           {status === 'loading' && <p className="text-blue-500 text-sm font-medium animate-pulse px-2 flex items-center gap-2"><Clock size={16} /> Mengirim pesan...</p>}
           {status === 'success' && <p className="text-green-600 text-sm font-medium px-2 bg-green-50 p-2 rounded-lg">{feedback}</p>}
           {status === 'error' && <p className="text-red-500 text-sm font-medium px-2 bg-red-50 p-2 rounded-lg">{feedback}</p>}

           <div className="pt-2">
               <button
                 type="submit"
                 disabled={status === 'loading' || !message.trim()}
                 className={cn("w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md", 
                    (status === 'loading' || !message.trim()) ? "bg-gray-400 shadow-none" : "bg-green-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                 )}
               >
                 <Send size={18} />
                 Kirim ke Grup WA
               </button>
           </div>
        </form>
        )}
      </div>
    </div>
  );
}
