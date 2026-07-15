const fs = require('fs');
const content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const newLogin = `
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
`;

const regex = /const login = async \(username: string, pass: string\) => \{[\s\S]*?return false;\n  \};/;
const updatedContent = content.replace(regex, newLogin.trim());
fs.writeFileSync('src/context/AppContext.tsx', updatedContent);
