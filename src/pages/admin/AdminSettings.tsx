import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save, Smartphone, Sparkles, Palette, KeyRound, Users, UserPlus, Upload, FileSpreadsheet } from 'lucide-react';

export default function AdminSettings() {
  const { config, updateConfig, addNotification, usersList } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    appName: config.appName,
    appLogo: config.appLogo || '',
    primaryColor: config.primaryColor,
    waApiKey: config.waApiKey,
    geminiApiKey: config.geminiApiKey,
    supabaseUrl: config.supabaseUrl || '',
    supabaseKey: config.supabaseKey || '',
  });

  const [newUser, setNewUser] = useState({ nip: '', name: '', role: 'staf_pelaksana' });

  const PRESET_COLORS = [
    { name: 'Indigo (Default)', hex: '#4f46e5' },
    { name: 'Cyan Modern', hex: '#1cb0d6' },
    { name: 'Yellow Gold', hex: '#fce429' },
    { name: 'Orange Warm', hex: '#f26522' },
    { name: 'Pink Magenta', hex: '#ce1a5b' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Teal', hex: '#0f766e' },
    { name: 'Rose', hex: '#e11d48' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (hex: string) => {
    setFormData({ ...formData, primaryColor: hex });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    addNotification('Konfigurasi sistem berhasil disimpan.');
  };

  const handleAddUserManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nip || !newUser.name) return;
    addNotification(`Berhasil menambahkan pengguna manual: ${newUser.name} (${newUser.nip})`);
    setNewUser({ nip: '', name: '', role: 'staf_pelaksana' });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addNotification(`Berhasil membaca file ${file.name}. Mengimpor data pengguna massal...`);
      // Simulate import delay
      setTimeout(() => {
         addNotification(`Import selesai: 15 Pengguna baru telah ditambahkan dari Excel.`);
         if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10 overflow-x-hidden">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Sistem</h1>
        <p className="text-gray-500 text-sm mt-1">Pengaturan API, Notifikasi, dan Tampilan UI.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* UI Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 px-6 flex items-center gap-2">
             <Palette size={18} className="text-gray-500" />
             <h2 className="font-bold text-gray-800">Tema & Penampilan</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Aplikasi</label>
                <input
                  type="text"
                  name="appName"
                  value={formData.appName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': formData.primaryColor } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Logo Aplikasi (Opsional)</label>
                <input
                  type="url"
                  name="appLogo"
                  value={formData.appLogo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': formData.primaryColor } as any}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna Utama (Primary Color)</label>
              <div className="flex items-center gap-3 mb-3">
                 <input
                   type="color"
                   name="primaryColor"
                   value={formData.primaryColor}
                   onChange={handleChange}
                   className="h-10 w-16 p-1 border border-gray-300 rounded-lg cursor-pointer shrink-0"
                 />
                 <input 
                   type="text"
                   value={formData.primaryColor}
                   readOnly
                   className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500"
                 />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Pilihan Preset Warna</p>
              <div className="flex flex-wrap gap-2">
                 {PRESET_COLORS.map(color => (
                   <button
                     key={color.hex}
                     type="button"
                     onClick={() => handleColorSelect(color.hex)}
                     className="w-8 h-8 rounded-full border-2 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                     style={{ 
                       backgroundColor: color.hex,
                       borderColor: formData.primaryColor === color.hex ? '#111827' : 'transparent'
                     }}
                     title={color.name}
                   />
                 ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* API & Bot Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 px-6 flex items-center gap-2">
             <KeyRound size={18} className="text-gray-500" />
             <h2 className="font-bold text-gray-800">Integrasi Eksternal</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Project URL</label>
                <input
                  type="text"
                  name="supabaseUrl"
                  value={formData.supabaseUrl}
                  onChange={handleChange}
                  placeholder="https://xxxxx.supabase.co"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': formData.primaryColor } as any}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Anon Key</label>
                <input
                  type="password"
                  name="supabaseKey"
                  value={formData.supabaseKey}
                  onChange={handleChange}
                  placeholder="eyJhbG..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': formData.primaryColor } as any}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Smartphone size={16} className="text-green-600 shrink-0" />
                Konfigurasi API WhatsApp (Notifikasi)
              </label>
              <input
                type="password"
                name="waApiKey"
                value={formData.waApiKey}
                onChange={handleChange}
                placeholder="sk_wa_xxxxxxxxxxxx"
                className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                style={{ '--tw-ring-color': formData.primaryColor } as any}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Sparkles size={16} className="text-purple-600 shrink-0" />
                Konfigurasi Gemini API (AI Asisten)
              </label>
              <input
                type="password"
                name="geminiApiKey"
                value={formData.geminiApiKey}
                onChange={handleChange}
                placeholder="AIzaSyAxxxxxxxxxxxx"
                className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:border-transparent transition-shadow"
                style={{ '--tw-ring-color': formData.primaryColor } as any}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
           <button
             type="submit"
             className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-transform active:scale-95"
             style={{ backgroundColor: formData.primaryColor }}
           >
             <Save size={18} />
             Simpan Konfigurasi
           </button>
        </div>
      </form>
    </div>
  );
}
