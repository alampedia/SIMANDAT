import React from 'react';
import { MessageSquare, LayoutGrid, Menu, User, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav = ({ desktopMode = false }: { desktopMode?: boolean }) => {
  const { config } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, path: '/chatbot' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/' },
    { id: 'menu', label: 'Menu', icon: Menu, path: '/menu' },
    { id: 'profil', label: 'Profil', icon: User, path: '/profil' },
    { id: 'tentang', label: 'Tentang', icon: Info, path: '/tentang' },
  ];

  if (desktopMode) {
    return (
      <div className="flex flex-col gap-2 px-4 w-full h-full">
        <div className="px-4 pb-6 pt-2">
           <h2 className="font-bold text-gray-800 text-xl tracking-wide uppercase" style={{ color: config.primaryColor }}>
             {config.appName}
           </h2>
           <p className="text-xs text-gray-400 mt-1">Smart Government App</p>
        </div>
        
        {navItems.map((item) => {
          const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
              
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group",
                isActive ? "text-white shadow-md font-bold" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 bg-white"
              )}
              style={{ backgroundColor: isActive ? config.primaryColor : undefined }}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "" : "text-gray-400 group-hover:text-gray-600")} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
        
        <div className="mt-auto px-4 pb-6 pt-6">
           <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Smart District © 2026</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-between px-2 py-2 w-[90%] max-w-md z-40">
      {navItems.map((item) => {
        // Match path broadly for root vs others
        const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
            
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center p-2 min-w-[60px] rounded-xl transition-all duration-300",
              isActive ? "text-white shadow-md scale-105" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            )}
            style={{ backgroundColor: isActive ? config.primaryColor : 'transparent' }}
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

