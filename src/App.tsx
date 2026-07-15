import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './pages/Login';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import PageDisposisi from './pages/user/PageDisposisi';
import MobileMenu from './pages/menu/MobileMenu';
import Chatbot from './pages/chatbot/Chatbot';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMonitoring from './pages/admin/AdminMonitoring';
import AdminLaporan from './pages/admin/AdminLaporan';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import MobileAppLayout from './components/layout/MobileAppLayout';
import AboutApp from './pages/AboutApp';
import TrackingKinerja from './pages/user/TrackingKinerja';
import TupoksiPage from './pages/user/TupoksiPage';
import CatatanRapat from './pages/user/CatatanRapat';
import GenericFeaturePage from './pages/user/GenericFeaturePage';
import ManajemenSurat from './pages/user/ManajemenSurat';
import DisposisiMasuk from './pages/user/DisposisiMasuk';
import StatusPekerjaanStaf from './pages/user/StatusPekerjaanStaf';
import CetakLaporan from './pages/user/CetakLaporan';

// Private Route logic
const PrivateRoute = ({ allowedRoles, excludeRoles }: { allowedRoles?: string[], excludeRoles?: string[] }) => {
  const { user } = useAppContext();
  
  if (!user) return <Navigate to="/login" replace />;
  if (excludeRoles && excludeRoles.includes(user.role)) {
     return <Navigate to="/" replace />; 
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }
  return <Outlet />;
};

// Application Global Event Watcher
const AppEventWatcher = () => {
   const { tasks, user, addNotification } = useAppContext();
   
   // Extremely simple simulation for "New Task" notification
   useEffect(() => {
     if (!user) return;
     // Provide logic where "in_progress" belongs to Staf/Kasi
     const incomingTasks = tasks.filter(t => t.assignedTo === user.name || t.assignedTo === user.username);
     if (incomingTasks.some(t => t.status !== 'completed')) {
        addNotification(`Anda memiliki ${incomingTasks.filter(t=>t.status !== 'completed').length} tugas aktif dari Atasan.`);
     }
   }, [user?.id]); // Only trigger once on login/mount context

   return null; 
};

// Smart Dashboard selector based on Role
const SmartDashboardHandler = () => {
    const { user } = useAppContext();
    if (!user) return <Navigate to="/login" />
    
    // Everyone goes to UserDashboard which dynamically adapts to Camat / Kasi / Staf / Admin views
    return <UserDashboard />;
};

import AdminLayout from './components/layout/AdminLayout';

const DynamicLayout = () => {
  const { user } = useAppContext();
  
  if (user?.role === 'admin') {
    return <AdminLayout />;
  }
  return <MobileAppLayout />;
};

function AppRoutes() {
  return (
    <>
      <AppEventWatcher />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<DynamicLayout />}>
             <Route path="/" element={<SmartDashboardHandler />} />
             <Route path="/menu" element={<MobileMenu />} />
             <Route path="/chatbot" element={<Chatbot />} />
             
             {/* Core App Routes */}
             <Route path="/surat" element={<ManajemenSurat />} />
             <Route path="/telaah" element={<PageDisposisi />} />
             <Route path="/disposisi" element={<PageDisposisi />} />
             <Route path="/disposisi-masuk" element={<DisposisiMasuk />} />
             <Route path="/pekerjaan-staf" element={<StatusPekerjaanStaf />} />
             <Route path="/jdih" element={<GenericFeaturePage title="JDIH Hukum" description="Jaringan Dokumentasi dan Informasi Hukum." isList={true} />} />
             <Route path="/sop" element={<GenericFeaturePage title="SOP Pelayanan" description="Standar Operasional Prosedur Pelayanan Organisasi." isList={true} />} />
             <Route path="/cetak-laporan" element={<CetakLaporan />} />
             <Route path="/progress" element={<AdminLaporan />} />
             <Route path="/tracking" element={<TrackingKinerja />} />
             <Route path="/tupoksi" element={<TupoksiPage />} />
             <Route path="/catatan-rapat" element={<CatatanRapat />} />
             
             {/* Admin routes reuse */}
             <Route path="/monitoring" element={<AdminMonitoring />} />
             
             <Route path="/profil" element={<UserProfile />} />
             
             <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/pengaturan" element={<AdminSettings />} />
                <Route path="/pengguna" element={<AdminUsers />} />
             </Route>
             
             <Route path="/tentang" element={<AboutApp />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
