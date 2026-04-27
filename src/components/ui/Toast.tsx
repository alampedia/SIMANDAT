import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, MessageSquare, Bell } from 'lucide-react';

export const ToastContainer = () => {
  const { notifications, markNotificationsRead } = useAppContext();
  const [visibleToasts, setVisibleToasts] = useState<typeof notifications>([]);

  useEffect(() => {
    // Show unread notifications
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      setVisibleToasts(unread);
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        markNotificationsRead();
        setVisibleToasts([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-in slide-in-from-right-8 fade-in">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <MessageSquare size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900">Notifikasi WA / Sistem</h4>
              <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
            </div>
            <button 
              onClick={() => {
                setVisibleToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
