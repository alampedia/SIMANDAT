import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ToastContainer } from '../ui/Toast';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Inbox,
  Send as SendIcon,
  BookOpen,
  FileText,
  Target,
  PieChart,
  Briefcase,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const { user, config, logout } = useAppContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Pada fitur admin sajikan fitur pada panel kiri saja dengan menu utama:
  const navItems = [
    { path: '/', label: 'Beranda Admin', exact: true, icon: LayoutDashboard },
    { path: '/surat', label: 'Manajemen Surat', icon: Inbox },
    { path: '/disposisi', label: 'Disposisi', icon: SendIcon },
    { path: '/jdih', label: 'JDIH', icon: BookOpen },
    { path: '/sop', label: 'SOP', icon: FileText },
    { path: '/tracking', label: 'Tracking Kinerja', icon: Target },
    { path: '/progress', label: 'Progres Interaktif', icon: PieChart },
    { path: '/monitoring', label: 'Monitoring & Laporan', icon: BarChart3 },
    { path: '/tupoksi', label: 'Tupoksi', icon: Briefcase },
    { path: '/pengguna', label: 'Pengguna', icon: Users, adminOnly: true },
    { path: '/pengaturan', label: 'Konfigurasi', icon: Settings, adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <ToastContainer />
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-inner" />
          <h1 className="font-bold text-gray-800">{config.appName}</h1>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-inner" />
            <div>
              <h1 className="font-bold text-lg text-gray-900 leading-tight">{config.appName}</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-y border-gray-100 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User Aktif</p>
          <p className="text-sm font-bold text-gray-800">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-medium capitalize">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                style={({ isActive }) => isActive ? { 
                  backgroundColor: `${config.primaryColor}15`, 
                  color: config.primaryColor 
                } : {}}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
