import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, Moon, Sun, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const UserTopHeader = () => {
  const { user, logout, config, theme, toggleTheme, tasks } = useAppContext();

  const roleLower = (user?.role || '').toLowerCase();
  const isPimpinanPuncak = (roleLower.includes('camat') && !roleLower.includes('sekcam') && !roleLower.includes('sekretaris'));
  const isReviewer = roleLower.includes('sekcam') || roleLower.includes('sekretaris') || roleLower.includes('wakapolsek') || roleLower.includes('wadanramil') || roleLower.includes('kasdim') || roleLower.includes('kasat');
  const isPimpinan = isPimpinanPuncak || isReviewer || roleLower === 'admin';
  const isStaf = !isPimpinanPuncak && !isReviewer && roleLower !== 'admin';

  const pendingTasks = tasks.filter(t => {
     if (isReviewer) return t.status === 'pending_sekcam';
     if (isPimpinan) return t.status === 'pending_camat';
     if (isStaf) return (t.assignedTo === user?.name || t.assignedTo === user?.username) && t.status !== 'completed';
     return false;
  }).length;

  
  // Formatting date like "Rabu, 22 April 2026"
  const currentDate = new Date();
  const dateStr = format(currentDate, 'EEEE, dd MMMM yyyy', { locale: id });
  const timeStr = format(currentDate, 'HH.mm');

  return (
    <div 
      className="text-white p-4 lg:p-6 flex flex-col justify-between"
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {config.appLogo ? (
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg p-1">
              <img src={config.appLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-[10px] border border-white/30 relative perspective-[1000px] overflow-visible group">
               <div className="w-7 h-7 relative transition-transform duration-700 transform-style-3d group-hover:rotate-x-[20deg] group-hover:rotate-y-[20deg] rotate-x-[10deg] rotate-y-[-15deg]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white to-blue-50 rounded-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_10px_20px_rgba(0,0,0,0.3)] z-10 border border-white/50" style={{ transform: 'translateZ(6px)' }} />
                  <div className="absolute inset-0 bg-blue-900 rounded-md opacity-30 blur-sm" style={{ transform: 'translateZ(-6px)' }} />
               </div>
            </div>
          )}
          <div>
            <p className="text-sm opacity-90">Selamat Datang,</p>
            <h1 className="font-bold text-lg leading-tight">{user?.name}</h1>
            <p className="text-xs opacity-75">{user?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
             <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Bell size={18} />
             </button>
             {pendingTasks > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm border border-white">
                   {pendingTasks}
                </span>
             )}
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={logout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-end bg-white rounded-t-2xl px-6 py-4 -mx-4 lg:-mx-6 -mb-4 lg:-mb-6 shadow-sm border-b">
        <h2 className="font-bold text-gray-800 text-lg uppercase tracking-wide" style={{ color: config.primaryColor }}>
          {config.appName}
        </h2>
        <div className="text-right text-gray-600">
          <p className="text-xs font-medium">{dateStr}</p>
          <p className="text-xl font-bold" style={{ color: config.primaryColor }}>{timeStr}</p>
        </div>
      </div>
    </div>
  );
};
