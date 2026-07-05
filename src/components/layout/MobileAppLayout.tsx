import React from 'react';
import { UserTopHeader } from '../../components/layout/UserTopHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { ToastContainer } from '../../components/ui/Toast';
import { Outlet } from 'react-router-dom';

export default function MobileAppLayout() {
  return (
    <div className="min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 flex w-full overflow-hidden max-w-[100vw] bg-gray-50">
      <ToastContainer />
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-100 flex-shrink-0 h-screen sticky top-0 relative z-20">
         <div className="h-full pt-6">
            <BottomNav desktopMode={true} />
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
         <div className="overflow-y-auto w-full h-full pb-24 lg:pb-8">
            <UserTopHeader />
            <main className="w-full max-w-6xl mx-auto p-4 lg:p-8 overflow-x-hidden">
               <Outlet />
            </main>
         </div>

         {/* Mobile Bottom Nav (hidden on desktop) */}
         <div className="lg:hidden">
            <BottomNav desktopMode={false} />
         </div>
      </div>
    </div>
  );
}
