import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---
export type UserRole = 'admin' | 'camat' | 'kapolsek' | 'danramil' | 'sekcam' | 'kasi' | 'kabag' | 'kasubag' | 'staf_agenda' | 'staf_pelaksana' | 'pelaksana' | 'sertu' | 'serma' | 'praka' | 'serda' | 'serka' | 'aipda' | 'aiptu' | 'bripka' | 'briptu' | string;

export interface User {
  id: string;
  username: string; // Used as NIP
  name: string;
  phone?: string;
  role: UserRole;
  title: string;
  tupoksi?: string;
  tugasSehariHari?: string;
  unitOrganisasi?: string;
  opd?: string;
}

export interface AppConfig {
  appName: string;
  appDescription: string;
  appLogo: string;
  primaryColor: string;
  waApiKey: string;
  waGroupId: string;
  waWebhookUrl: string;
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface DisposisiTask {
  id: string;
  nomorSurat?: string;
  title: string;
  sender: string;
  date: string;
  status: 'pending_sekcam' | 'pending_camat' | 'pending_target' | 'in_progress' | 'completed' | 'overdue';
  priority?: string;
  driveUrl?: string;
  assignedTo?: string; // final target
  type?: 'masuk' | 'keluar' | 'arsip';
  disposisiType?: 'reguler' | 'akhir';
  instructions?: string;
  notesCamat?: string;
  notesSekcam?: string;
  deadline?: string;
  progress?: number;
  history: { date: string; action: string; actor: string }[];
  opd?: string;
}

interface AppContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  tasks: DisposisiTask[];
  addTask: (task: Omit<DisposisiTask, 'id' | 'history'>) => void;
  updateTaskStatus: (taskId: string, newStatus: DisposisiTask['status'], note?: string, assignedTo?: string, progress?: number, deadline?: string) => void;
  updateTask: (taskId: string, updates: Partial<DisposisiTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  notifications: { id: string; message: string; read: boolean }[];
  addNotification: (message: string) => void;
  markNotificationsRead: () => void;
  usersList: User[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}



// Empty because dummy accounts are removed


const initialConfig: AppConfig = {
  appName: 'SI-MANDAT',
  appDescription: 'Sistem Monitoring Tata Kelola Disposisi dan Manajemen Delegasi Antar-Teritorial',
  appLogo: 'https://lh3.googleusercontent.com/d/1R6nREQ05GJ5GtTNljze0dJnbim_qiZxQ',
  primaryColor: '#2563eb', // Blue 600
  waApiKey: '1cJnf2tcHCFcfi8wPHDt',
  waGroupId: '120363426010181190@g.us',
  waWebhookUrl: 'https://simandat.netlify.app/',
  geminiApiKey: '',
  supabaseUrl: 'https://ftqwgnlpgiuxdpckxhsk.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cXdnbmxwZ2l1eGRwY2t4aHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjcyNjUsImV4cCI6MjA5MjgwMzI2NX0.kcQe5VYlzqaXycr2VYMwWtJgNgNuiEqXHiTayS-vTag',
};

const initialTasks: DisposisiTask[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('simandat_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role) {
           parsed.role = parsed.role.toLowerCase();
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [config, setConfigState] = useState<AppConfig>(initialConfig);
  const [tasks, setTasks] = useState<DisposisiTask[]>(initialTasks);
  const [notifications, setNotifications] = useState<{ id: string; message: string; read: boolean }[]>([]);
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('simandat_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('simandat_theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.title = config.appName || 'SIMANDAT';
    if (config.appLogo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = config.appLogo;
    }
    
    // Load users from Supabase if configured
    const loadUsers = async () => {
      if (config.supabaseUrl && config.supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(config.supabaseUrl, config.supabaseKey);
          
          const { data, error } = await supabase.from('pegawai').select('*');
          if (!error && data) {
            const mappedUsers: User[] = data.map((p: any) => ({
              id: p.id,
              username: p.nip,
              name: p.nama,
              phone: p.no_hp,
              role: (p.role || '').toLowerCase() as UserRole,
              title: p.jabatan,
              tupoksi: p.tupoksi,
              tugasSehariHari: p.tugas_sehari_hari,
              unitOrganisasi: p.unit_organisasi,
              opd: p.opd
            }));
            setDbUsers(mappedUsers);
          }
        } catch (err) {
          console.error("Failed to load users from DB", err);
        }
      }
    };
    
    loadUsers();
  }, [config.primaryColor, config.supabaseUrl, config.supabaseKey]);

  // Deadline checker
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      let alertTriggered = false;
      tasks.forEach(t => {
        // Find active tasks assigned to this user with a deadline that is < 12 hours from now and not completed
        if ((t.assignedTo === user.name || t.assignedTo === user.username) && t.deadline && t.status !== 'completed' && t.status !== 'overdue') {
          const deadlineTime = new Date(t.deadline).getTime();
          const p = t.progress || 0;
          const diffHour = (deadlineTime - now) / (1000 * 60 * 60);

          if (diffHour > 0 && diffHour < 12 && p === 0) {
            // Found a task near deadline with no progress
            alertTriggered = true;
            if (Notification.permission === 'granted') {
              new Notification('Peringatan Disposisi', {
                body: `Tugas "${t.title}" mendekati batas waktu (${diffHour.toFixed(1)} jam) namun belum ada progres!`,
                icon: '/icon.png' // or whatever
              });
            }
          }
        }
      });

      if (alertTriggered) {
        // Beep sound
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = 600; 
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500);
      }
    }, 60 * 1000); // Check every minute

    // Ask for notification permission on mount if logged in
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    return () => clearInterval(intervalId);
  }, [user, tasks]);

  const login = async (username: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        // First check if table exists or has any users
        const { count, error: countError } = await supabase.from('pegawai').select('*', { count: 'exact', head: true });
        
        if (countError) {
           console.error("Table check error:", countError);
           return { success: false, message: 'Database belum diatur (Tabel pegawai tidak ditemukan). Silakan jalankan Setup SQL di Supabase.' };
        }
        
        if (count === 0) {
           return { success: false, message: 'Belum ada pengguna terdaftar di database. Silakan jalankan skrip SQL awal.' };
        }

        const { data, error } = await supabase
          .from('pegawai')
          .select('*')
          .eq('nip', username)
          .eq('pass', pass);

        if (!error && data && data.length > 0) {
          const userData = data[0];
          const userObj = {
            id: userData.id,
            username: userData.nip,
            name: userData.nama,
            phone: userData.no_hp,
            role: (userData.role || '').toLowerCase() as UserRole,
            title: userData.jabatan || 'Pengguna',
            tupoksi: userData.tupoksi,
            tugasSehariHari: userData.tugas_sehari_hari,
            unitOrganisasi: userData.unit_organisasi,
            opd: userData.opd
          };
          setUser(userObj);
          localStorage.setItem('simandat_user', JSON.stringify(userObj));
          return { success: true };
        } else {
           console.error('Login error from Supabase:', error ? error.message : 'User not found');
           return { success: false, message: 'NIP atau password salah.' };
        }
      } catch (err: any) {
        console.error('Supabase error:', err);
        return { success: false, message: 'Gagal terhubung ke database Supabase.' };
      }
    }
    return { success: false, message: 'Konfigurasi Supabase belum diisi. Hubungi Administrator.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('simandat_user');
  };

  // Update config and store it in localStorage and optionally Supabase
  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const combinedConfig = { ...config, ...newConfig };
    setConfigState(combinedConfig);
    localStorage.setItem('simandat_config', JSON.stringify(combinedConfig));
    
    // Save to Supabase DB if credentials let us
    if (combinedConfig.supabaseUrl && combinedConfig.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(combinedConfig.supabaseUrl, combinedConfig.supabaseKey);
        
        await supabase.from('app_settings').upsert({
           id: 'global',
           app_name: combinedConfig.appName,
           app_description: combinedConfig.appDescription,
           app_logo: combinedConfig.appLogo || '',
           primary_color: combinedConfig.primaryColor,
           wa_api_key: combinedConfig.waApiKey,
           wa_group_id: combinedConfig.waGroupId,
           wa_webhook_url: combinedConfig.waWebhookUrl,
           gemini_api_key: combinedConfig.geminiApiKey,
           updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save config to DB", err);
      }
    }
  };

  // On mount, load config from localStorage first, then from app_settings
  useEffect(() => {
    let currentConfig = initialConfig;
    const localStore = localStorage.getItem('simandat_config');
    if (localStore) {
      try {
        currentConfig = { ...initialConfig, ...JSON.parse(localStore) };
        setConfigState(currentConfig);
      } catch (err) {}
    }

    const loadConfigFromDb = async () => {
       if (currentConfig.supabaseUrl && currentConfig.supabaseKey) {
         try {
           const { createClient } = await import('@supabase/supabase-js');
           const supabase = createClient(currentConfig.supabaseUrl, currentConfig.supabaseKey);
           
           const { data, error } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
           if (!error && data) {
             const serverConfig = {
               ...currentConfig,
               appName: data.app_name || currentConfig.appName,
               appDescription: data.app_description || currentConfig.appDescription,
               appLogo: data.app_logo || '',
               primaryColor: data.primary_color || currentConfig.primaryColor,
               waApiKey: data.wa_api_key || '',
               waGroupId: data.wa_group_id || '',
               waWebhookUrl: data.wa_webhook_url || currentConfig.waWebhookUrl || '',
               geminiApiKey: data.gemini_api_key || '',
             };
             setConfigState(serverConfig);
             localStorage.setItem('simandat_config', JSON.stringify(serverConfig));
           }
         } catch (err) {
           console.error("Failed to load config from DB", err);
         }
       }
    };
    loadConfigFromDb();
  }, []);

  const refreshTasks = async () => {
    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const { data, error } = await supabase.from('app_tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data) {
          const formattedTasks: DisposisiTask[] = data.map(t => ({
            id: t.id,
            nomorSurat: t.nomor_surat,
            title: t.title,
            sender: t.sender,
            date: t.date,
            type: t.type || 'masuk',
            disposisiType: t.disposisi_type,
            status: t.status,
            priority: t.priority,
            driveUrl: t.drive_url,
            assignedTo: t.assigned_to,
            instructions: t.instructions,
            notesCamat: t.notes_camat,
            notesSekcam: t.notes_sekcam,
            deadline: t.deadline,
            progress: t.progress,
            history: t.history || [],
            opd: t.opd,
          }));
          setTasks(formattedTasks);
        }
      } catch (err: any) {
        console.error("Failed to load tasks from DB", err);
      }
    }
  };

  useEffect(() => {
    refreshTasks();
  }, [config.supabaseUrl, config.supabaseKey]);

    const addTask = async (task: Omit<DisposisiTask, 'id' | 'history'>) => {
    const id = `ND-${new Date().getTime().toString().slice(-4)}`;
    const historyUpdate = { date: new Date().toISOString(), action: task.status === 'pending_camat' ? 'Naskah dibuat dan diteruskan ke Pimpinan' : 'Naskah dibuat dan diteruskan ke Reviewer', actor: user?.name || 'Sistem' };
    
    // Default fallback locally
    setTasks(prev => [{ id, ...task, history: [historyUpdate] }, ...prev]);
    
    // ----- WHATSAPP FONNTE LOGIC -----
    if (config.waApiKey && user) {
       let targetRoles = [];
       if (task.status === 'pending_sekcam' || !task.status) {
           targetRoles = ['sekcam', 'sekretaris', 'wakapolsek', 'wadanramil', 'kasdim', 'kasat'];
       } else if (task.status === 'pending_camat') {
           targetRoles = ['camat', 'kapolsek', 'danramil'];
       }
       
       if (targetRoles.length > 0) {
           const targets = dbUsers.filter(u => {
               const uRoleLower = (u.role || '').toLowerCase();
               return targetRoles.some(r => uRoleLower.includes(r) && (r !== 'camat' || (!uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')))) && (!u.opd || u.opd === (task.opd || user.opd) || (user?.role || '').toLowerCase() === 'admin');
           });
           
           for (const target of targets) {
              if (target.phone) {
                 const waMsg = `*SIMANDAT - NASKAH MASUK*\n\nHalo *${target.name}*,\n\nAda naskah dinas baru yang perlu direview/didisposisikan:\n*Nomor Surat:* ${task.nomorSurat || '-'}\n*Dokumen:* ${task.title}\n*Pengirim:* ${task.sender}\n\nSilakan cek aplikasi SIMANDAT.`;
                 import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, target.phone, waMsg));
              }
           }
       } else if (task.status === 'pending_target' && task.assignedTo) {
           const targetUser = dbUsers.find(u => u.name === task.assignedTo || u.username === task.assignedTo);
           if (targetUser && targetUser.phone) {
               const waMsg = `*SIMANDAT - TUGAS BARU*\n\nHalo *${targetUser.name}*,\nAnda mendapat disposisi langsung dari pimpinan.\n\n*Dokumen:* ${task.title}\n*Instruksi Pimpinan:* ${task.instructions || '-'}\n\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;
               import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, targetUser.phone, waMsg));
           }
       }
    }
    // ---------------------------------


    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const { error } = await supabase.from('app_tasks').insert([{
          id,
          nomor_surat: task.nomorSurat,
          title: task.title,
          sender: task.sender,
          date: task.date,
          type: task.type || 'masuk',
          disposisi_type: task.disposisiType,
          status: task.status || 'pending_sekcam',
          priority: task.priority,
          drive_url: task.driveUrl,
          assigned_to: task.assignedTo,
          instructions: task.instructions,
          history: [historyUpdate],
          opd: task.opd || user?.opd
        }]);

        if (error) throw error;
        addNotification(`Naskah baru "${task.title}" berhasil dibuat dan disimpan di database.`);
      } catch (err: any) {
        console.error("DB Error on addTask", err);
        addNotification(`Gagal menyimpan ke database Supabase: ${err.message}. Solusi: Cek format data atau pastikan url/key Supabase benar di Pengaturan.`);
      }
    } else {
      addNotification(`Naskah berhasil dibuat (hanya tersimpan sementara karena database Supabase belum terkonfigurasi).`);
    }
  };

  
  const updateTask = async (taskId: string, updates: Partial<DisposisiTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.nomorSurat !== undefined) dbUpdates.nomor_surat = updates.nomorSurat;
        if (updates.sender !== undefined) dbUpdates.sender = updates.sender;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.driveUrl !== undefined) dbUpdates.drive_url = updates.driveUrl;
        if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
        
        if (Object.keys(dbUpdates).length > 0) {
           const { error } = await supabase.from('app_tasks').update(dbUpdates).eq('id', taskId);
           if (error) throw error;
        }
      } catch (err: any) {
        console.error("DB Error on updateTask", err);
        addNotification(`Gagal mengupdate naskah di database: ${err.message}.`);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const { error } = await supabase.from('app_tasks').delete().eq('id', taskId);
        if (error) throw error;
        addNotification(`Naskah berhasil dihapus.`);
      } catch (err: any) {
        console.error("DB Error on deleteTask", err);
        addNotification(`Gagal menghapus naskah di database: ${err.message}.`);
      }
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: DisposisiTask['status'], note?: string, assignedTo?: string, progress?: number, deadline?: string, disposisiType?: 'reguler' | 'akhir') => {
    let actionMsg = `Status diubah ke ${newStatus}`;
    if (newStatus === 'pending_camat') actionMsg = `Diteruskan ke Pimpinan (Mapping oleh Reviewer)`;
    if (newStatus === 'pending_target') {
       const currentTaskCheck = tasks.find(t => t.id === taskId);
       if (currentTaskCheck && currentTaskCheck.status === 'pending_target') {
           actionMsg = `Diteruskan ke Staf Pelaksana oleh Atasan`;
       } else {
           actionMsg = `Disetujui Pimpinan dan diteruskan ke Target`;
       }
    }
    if (newStatus === 'in_progress') actionMsg = `Progres diperbarui${progress !== undefined ? ` (${progress}%)` : ''}`;
    
    const historyUpdate = { date: new Date().toISOString(), action: `${actionMsg}${note ? ' - Catatan: '+note : ''}`, actor: user?.name || 'Sistem' };
    
    // Find current task state for DB update
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

        // ----- WHATSAPP FONNTE LOGIC -----
    if (newStatus === 'pending_target' && config.waApiKey) {
      const targetUserAlias = assignedTo || currentTask.assignedTo;
      if (targetUserAlias) {
        const targetUser = dbUsers.find(u => u.name === targetUserAlias || u.username === targetUserAlias);
        if (targetUser && targetUser.phone) {
           const senderName = user?.name || 'Pimpinan/Atasan';
           const waMsg = `*SIMANDAT - TUGAS BARU*\n\nHalo *${targetUser.name}*,\nAnda mendapat disposisi tugas baru dari *${senderName}*.\n\n*Dokumen:* ${currentTask.title}\n*Instruksi:* ${note || currentTask.instructions || '-'}\n\nSilakan cek aplikasi SIMANDAT untuk menindaklanjuti atau update progres. Terima kasih.`;
           import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, targetUser.phone, waMsg));
        }
      }
    }
    
    if (newStatus === 'pending_camat' && config.waApiKey && user) {
       const camats = dbUsers.filter(u => {
           const uRoleLower = (u.role || '').toLowerCase();
           return ((uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')) || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil')) && (!u.opd || u.opd === user.opd || (user?.role || '').toLowerCase() === 'admin');
       });
       for (const camat of camats) {
          if (camat.phone) {
             const waMsg = `*SIMANDAT - PERSETUJUAN DISPOSISI*\n\nHalo *${camat.name}*,\n\nAda naskah dinas masuk yang memerlukan persetujuan disposisi dari Anda:\n*Dokumen:* ${currentTask.title}\n*Catatan Reviewer:* ${note || '-'}\n\nSilakan cek aplikasi SIMANDAT untuk meneruskan disposisi.`;
             import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, camat.phone, waMsg));
          }
       }
    }

    if (newStatus === 'completed' && config.waApiKey && user) {
       // Send feedback to Atasan (e.g. Camat, Kapolsek or Sekcam) in the same OPD
       const atasans = dbUsers.filter(u => {
           const uRoleLower = (u.role || '').toLowerCase();
           return ((uRoleLower.includes('camat') && !uRoleLower.includes('sekcam') && !uRoleLower.includes('sekretaris')) || uRoleLower.includes('kapolsek') || uRoleLower.includes('danramil') || uRoleLower.includes('sekcam')) && (!u.opd || u.opd === user.opd || (user?.role || '').toLowerCase() === 'admin');
       });
       for (const atasan of atasans) {
          if (atasan.phone) {
             const waMsg = `*SIMANDAT - LAPORAN SELESAI*\n\nHalo *${atasan.name}*,\n\nTugas *${currentTask.title}* telah diselesaikan oleh *${user.name}*.\n\n*Uraian/Catatan Pelaksana:* ${note || 'Tugas telah dilaksanakan.'}\n\nSilakan cek aplikasi SIMANDAT untuk verifikasi jika diperlukan.`;
             import('../lib/fonnte').then(m => m.sendFonnteMessage(config.waApiKey, atasan.phone!, waMsg));
          }
       }
    }
    // ---------------------------------

    // Optimistically update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
           ...t, 
           status: newStatus,
           ...(progress !== undefined ? { progress } : {}),
           ...(note && newStatus === 'pending_camat' ? { notesSekcam: note } : {}),
           ...(note && newStatus === 'pending_target' ? { notesCamat: note } : {}),
           ...(deadline ? { deadline } : {}),
           history: [...t.history, historyUpdate],
           ...(assignedTo ? { assignedTo } : {}),
           ...(disposisiType ? { disposisiType } : {})
        };
      }
      return t;
    }));

    if (config.supabaseUrl && config.supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        let updatePayload: any = {
           status: newStatus,
           history: [...currentTask.history, historyUpdate]
        };
        
        if (progress !== undefined) updatePayload.progress = progress;
        if (note && newStatus === 'pending_camat') updatePayload.notes_sekcam = note;
        if (note && newStatus === 'pending_target') updatePayload.notes_camat = note;
        if (deadline) updatePayload.deadline = deadline;
        if (assignedTo) updatePayload.assigned_to = assignedTo;
        if (disposisiType) updatePayload.disposisi_type = disposisiType;

        const { error } = await supabase.from('app_tasks').update(updatePayload).eq('id', taskId);

        if (error) throw error;

        // Auto insert to kinerja_harian for dispositions and progress updates
        if (user?.username) {
           await supabase.from('kinerja_harian').insert([{
              nip: user.username,
              aktivitas: actionMsg,
              tanggal: new Date().toISOString()
           }]);
        }
        
        if (newStatus !== 'in_progress') {
           addNotification(`Status naskah berhasil diperbarui di database.`);
        }
      } catch (err: any) {
        console.error("DB Error on updateTask", err);
        addNotification(`Gagal mengupdate di database: ${err.message}. Data hanya tersimpan sementara.`);
      }
    } else {
      if (newStatus !== 'in_progress') {
         addNotification(`Status naskah berhasil diperbarui (hanya di memori karena Supabase belum diseting).`);
      }
    }
  };

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [{ id, message, read: false }, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }

  return (
    <AppContext.Provider value={{
      user, login, logout, config, updateConfig, tasks, addTask, updateTaskStatus, updateTask, deleteTask, notifications, addNotification, markNotificationsRead, usersList: dbUsers, theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

