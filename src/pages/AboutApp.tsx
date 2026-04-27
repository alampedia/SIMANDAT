import React from 'react';
import { Award, User, Phone, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AboutApp() {
  const { config } = useAppContext();

  return (
    <div className="space-y-6 lg:px-4 pb-8">
      
      {/* Header Banner */}
      <div 
        className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${config.primaryColor} 0%, #312e81 100%)` 
        }}
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner mb-4">
              <ShieldCheck size={40} className="text-white drop-shadow-md" />
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight mb-2">SI-MANDAT</h1>
           <p className="text-white/80 max-w-sm font-medium leading-relaxed">
             Sistem Informasi Manajemen Naskah Dinas Terpadu berbasis AI & Workflow Otomatis.
           </p>
           <span className="mt-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-mono tracking-wide">
             Versi 1.0.0
           </span>
        </div>
      </div>

      {/* App Info Grid */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center text-center gap-2">
            <Cpu size={24} className="text-indigo-500" />
            <h3 className="font-bold text-gray-800 text-sm">AI Powered</h3>
            <p className="text-xs text-gray-500">Analisis cerdas & asisten kognitif otomatis.</p>
         </div>
         <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center text-center gap-2">
            <Code2 size={24} className="text-indigo-500" />
            <h3 className="font-bold text-gray-800 text-sm">Real-time</h3>
            <p className="text-xs text-gray-500">Tracking naskah dinas seketika tanpa jeda.</p>
         </div>
      </div>

      {/* Innovator Profile */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
         <div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-100 w-full" />
         
         <div className="px-6 pb-6 relative">
            {/* Display Pic */}
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg p-1 border border-gray-100 absolute -top-10 flex items-center justify-center">
               <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                  <User size={40} />
               </div>
            </div>
            
            <div className="pt-12">
               <div className="flex items-center gap-2 mb-1">
                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">MOCHAMMAD SYAFI'I, S.Pd, M.Pd.</h2>
                 <Award size={20} className="text-amber-500" />
               </div>
               <p className="text-sm font-bold text-indigo-600 mb-4 tracking-wide uppercase">Inovator & Pemrakarsa Utama</p>
               
               <p className="text-gray-600 text-sm leading-relaxed mb-6">
                 SI-MANDAT dikembangkan secara khusus untuk merevolusi tata kelola naskah dinas pemerintahan menjadi sistem yang cerdas, efisien, telusur (traceable), dan akuntabel.
               </p>
               
               <div className="flex flex-col gap-3">
                  <div className="flex flex-col border border-gray-100 bg-gray-50/50 rounded-xl p-3">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Kontak Resmi</span>
                     <div className="flex items-center gap-2 text-gray-800 font-medium">
                        <Phone size={16} className="text-gray-500" />
                        <span>+62 853-3088-9157</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="text-center py-4">
         <p className="text-xs text-gray-400 font-medium">© 2024 Pemerintah Terpadu. All rights reserved.</p>
      </div>
    </div>
  );
}
