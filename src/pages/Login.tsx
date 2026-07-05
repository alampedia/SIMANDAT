import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, config, user } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.7), rgba(249, 250, 251, 0.7)), url('https://lh3.googleusercontent.com/d/11C8rXuMkNbeh8xleHHB7LcYgQwDggqYk')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Abstract Background Shapes (Ocean Depth) - Optional, can keep them for extra flavor or remove. Let's keep them very subtle */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-blue-300/20 blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      {/* Logo and App Name Outside the Card */}
      <div className="z-10 flex flex-col items-center justify-center mb-8 text-white drop-shadow-lg text-center">
        {config.appLogo ? (
          <img src={config.appLogo} alt="Logo" className="w-20 h-20 mx-auto rounded-2xl shadow-xl mb-4 object-contain bg-white" />
        ) : (
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent z-10 pointer-events-none" />
             <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 shadow-[0_4px_10px_rgba(0,0,0,0.3)] transform rotate-12" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">{config.appName}</h1>
        <p className="opacity-90 font-medium text-gray-800 px-4 max-w-sm mx-auto leading-snug">
          {config.appDescription}
        </p>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden relative z-10 flex flex-col">
        {/* Header Kartu Login (Biru) */}
        <div className="px-10 py-6 text-white text-center relative overflow-hidden bg-blue-600 flex-shrink-0" style={{ backgroundColor: config.primaryColor }}>
          
          {/* Animated Gold Line at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden">
            <motion.div 
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent blur-[1px]"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
          </div>
          
          {/* subtle gold ambient glow at the top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[25px] bg-yellow-400/30 blur-[20px]"></div>

          {/* Subtle overlay on the header for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20 pointer-events-none"></div>

          <h2 className="text-xl font-bold relative z-10 drop-shadow-md">Masuk ke Akun Anda</h2>
        </div>
        
        {/* Konten Kartu (Putih) */}
        <div className="p-8 bg-white flex-1">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
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
                  placeholder="Masukkan NIP"
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
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition-shadow"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  placeholder="********"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
