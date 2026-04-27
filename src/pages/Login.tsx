import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const { login, config } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Email/NIP atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-white text-center" style={{ backgroundColor: config.primaryColor }}>
            {config.appLogo ? (
              <img src={config.appLogo} alt="Logo" className="w-16 h-16 mx-auto rounded-2xl shadow-lg mb-4 object-contain bg-white" />
            ) : (
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent z-10 pointer-events-none" />
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_4px_10px_rgba(0,0,0,0.3)] transform rotate-12" />
              </div>
            )}
          <h1 className="text-2xl font-bold">{config.appName}</h1>
          <p className="opacity-80 text-sm mt-2">Sistem Monitoring Tata Kelola Disposisi</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email / NIP / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition-shadow"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  placeholder="Masukkan Email / NIP"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition-shadow"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  placeholder="********"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: config.primaryColor }}
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
