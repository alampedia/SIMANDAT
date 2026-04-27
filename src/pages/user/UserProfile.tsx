import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Mail, Save, Clock, Target, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function UserProfile() {
  const { user, config, addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '08123456789',
    email: 'email.anda@domain.go.id'
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Profil berhasil diperbarui.');
  };

  return (
    <div className="space-y-6 lg:px-4">
      
      {/* Profile Header */}
      <div 
        className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${config.primaryColor} 0%, #312e81 100%)` 
        }}
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center pt-4">
           {/* Avatar */}
           <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 p-1 mb-4">
              <div className="w-full h-full rounded-full bg-indigo-200 overflow-hidden flex items-center justify-center">
                <User size={40} className="text-indigo-400" />
              </div>
           </div>
           
           <h2 className="text-2xl font-bold tracking-tight mb-1">{user.name}</h2>
           <p className="text-white/80 font-medium text-sm mb-4">{user.title}</p>
           
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 text-xs font-mono">
             <span>NIP:</span>
             <span className="font-bold tracking-wide">{user.username}</span>
           </div>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
           <User size={18} className="text-indigo-600" />
           Informasi Akun
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
             <input
               type="text"
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition-all"
               style={{ '--tw-ring-color': config.primaryColor } as any}
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
             <input
               type="tel"
               value={formData.phone}
               onChange={e => setFormData({...formData, phone: e.target.value})}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition-all"
               style={{ '--tw-ring-color': config.primaryColor } as any}
             />
             <p className="text-xs text-gray-500 mt-1.5">Digunakan untuk menerima notifikasi disposisi via WA bot.</p>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email Instansi</label>
             <input
               type="email"
               value={formData.email}
               onChange={e => setFormData({...formData, email: e.target.value})}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition-all"
               style={{ '--tw-ring-color': config.primaryColor } as any}
             />
           </div>

           <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Save size={16} />
                Simpan Profil
              </button>
           </div>
        </form>
      </div>
      
    </div>
  );
}
