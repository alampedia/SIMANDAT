import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { tasks, user } = useAppContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat bekerja, {user?.name}</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          {tasks.slice().reverse().map(task => (
            <div key={task.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
               <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500" />
               <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">Update terakhir: {new Date(task.history[task.history.length - 1].date).toLocaleString()}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
