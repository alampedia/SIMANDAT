import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  FileCheck2, 
  Send as SendIcon, 
  BarChart3, 
  Settings, 
  Target,
  Briefcase,
  BookOpen,
  NotebookPen,
  FileText,
  PieChart,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MobileMenu() {
  const { user, config } = useAppContext();
  const navigate = useNavigate();

  const menuConfig = [
    { 
       id: 'manajemen-surat', 
       label: 'Manajemen Surat', 
       icon: Inbox, 
       path: '/surat', 
       roles: ['admin', 'sekcam'] 
    },
    { 
       id: 'disposisi', 
       label: 'Disposisi', 
       icon: SendIcon, 
       path: '/disposisi', 
       roles: ['admin', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'verifikasi', 
       label: 'Verifikasi', 
       icon: FileCheck2, 
       path: '/telaah', 
       roles: ['admin', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'disposisi-masuk', 
       label: 'Disposisi Masuk', 
       icon: FileText, 
       path: '/disposisi-masuk', 
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam'] 
    },
    { 
       id: 'tracking', 
       label: 'Tracking Kinerja', 
       icon: Target, 
       path: '/tracking', 
       roles: ['admin', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    {
       id: 'laporan-kinerja',
       label: 'Laporan Kinerja',
       icon: BarChart3,
       path: '/tracking',
       roles: ['staf_pelaksana', 'staf_agenda']
    },
    { 
       id: 'pekerjaan_staf', 
       label: 'Status Pekerjaan Staf', 
       icon: Users, 
       path: '/pekerjaan-staf', 
       roles: ['admin', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'progress', 
       label: 'Progres', 
       icon: PieChart, 
       path: '/progress',
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil']
    },
    { 
       id: 'monitoring', 
       label: 'Monitoring & Laporan', 
       icon: BarChart3, 
       path: '/monitoring', 
       roles: ['admin', 'kasubag', 'kabag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    {
       id: 'cetak-laporan',
       label: 'Cetak Laporan',
       icon: FileText,
       path: '/cetak-laporan',
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil']
    },
    { 
       id: 'tupoksi', 
       label: 'Tupoksi', 
       icon: Briefcase, 
       path: '/tupoksi', 
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'catatan-rapat', 
       label: 'Catatan Rapat', 
       icon: NotebookPen, 
       path: '/catatan-rapat', 
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'jdih', 
       label: 'JDIH', 
       icon: BookOpen, 
       path: '/jdih', 
       roles: ['admin', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil', 'staf_pelaksana', 'staf_agenda'] 
    },
    { 
       id: 'sop', 
       label: 'SOP', 
       icon: FileText, 
       path: '/sop', 
       roles: ['admin', 'staf_pelaksana', 'staf_agenda', 'kasi', 'kabag', 'kasubag', 'sekcam', 'camat', 'kapolsek', 'danramil'] 
    },
    { 
       id: 'pengguna', 
       label: 'Pengguna', 
       icon: Users, 
       path: '/pengguna', 
       roles: ['admin']
    },
    { 
       id: 'pengaturan', 
       label: 'Pengaturan', 
       icon: Settings, 
       path: '/pengaturan', 
       roles: ['admin']
    },
  ];

  const accessibleMenus = menuConfig.filter(menu => {
     let userRole = (user?.role || 'staf_pelaksana').toLowerCase().trim();
     if (['pelaksana', 'sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'].includes(userRole)) {
       userRole = 'staf_pelaksana';
     }
     if (userRole.includes('danramil') || userRole.includes('kapolsek') || userRole.includes('camat')) {
       userRole = 'camat';
     }
     if (userRole.includes('sekcam') || userRole.includes('wakapolsek') || userRole.includes('wadanramil') || userRole.includes('kasdim') || userRole.includes('kasat')) {
       userRole = 'sekcam';
     }
     return menu.roles.includes(userRole);
  });

  const menuColors = [
    { bg: 'linear-gradient(135deg, #1cb0d6 0%, #0d85a3 100%)', shadow: '#1cb0d6' },
    { bg: 'linear-gradient(135deg, #fce429 0%, #d4bc11 100%)', shadow: '#fce429' },
    { bg: 'linear-gradient(135deg, #f26522 0%, #c44a11 100%)', shadow: '#f26522' },
    { bg: 'linear-gradient(135deg, #ce1a5b 0%, #990e40 100%)', shadow: '#ce1a5b' },
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', shadow: '#3b82f6' },
    { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: '#8b5cf6' },
    { bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', shadow: '#10b981' },
    { bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', shadow: '#f43f5e' },
    { bg: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', shadow: '#14b8a6' },
  ];

  return (
    <div className="p-4 lg:p-6 w-full overflow-hidden box-border">
      <header className="mb-6 ml-2">
        <h1 className="text-2xl font-bold text-gray-900">Menu Utama</h1>
        <p className="text-gray-500 text-sm">Layanan sistem {config.appName}. {user?.role ? `(Role: ${user.role})` : ''}</p>
      </header>

      {accessibleMenus.length === 0 && (
         <div className="p-4 bg-red-50 text-red-600 rounded-xl">
           Tidak ada menu yang tersedia untuk role Anda ({user?.role || 'Tidak ada role'}).
         </div>
      )}

      <div className="grid grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
        {accessibleMenus.map((menu, i) => {
          const colorTheme = menuColors[i % menuColors.length];
          return (
            <button
              key={menu.id}
              onClick={() => navigate(menu.path)}
              className="group relative bg-white rounded-2xl p-3 md:p-4 border border-gray-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center h-full active:scale-[0.98]"
            >
              <div
                 className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-2xl mb-2 flex items-center justify-center transition-transform group-hover:-translate-y-1 relative"
                 )}
                 style={{
                    background: colorTheme.bg,
                   boxShadow: `0 8px 16px -4px ${colorTheme.shadow}50, inset 0 2px 4px rgba(255,255,255,0.4)`,
                   transformStyle: 'preserve-3d',
                   transform: 'perspective(400px) rotateX(15deg)'
                 }}
              >
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none" />
                 <menu.icon size={24} className="text-white drop-shadow-md relative z-10 md:min-w-[28px] md:min-h-[28px]" />
              </div>
              
              <h3 className="font-bold text-gray-900 text-[10px] md:text-[13px] leading-tight px-1">{menu.label}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
