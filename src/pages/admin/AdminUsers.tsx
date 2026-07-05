import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, UserPlus, Upload, FileSpreadsheet, Send, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminUsers() {
  const { config, addNotification, usersList } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newUser, setNewUser] = useState({ nip: '', name: '', role: 'staf_pelaksana', opd: 'Kecamatan' });

  const handleAddUserManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nip || !newUser.name) return;
    
    if (!config.supabaseUrl || !config.supabaseKey) {
      addNotification("Gagal: Database Supabase belum dikonfigurasi di Pengaturan.");
      return;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      const { error } = await supabase.from('pegawai').insert([{
         nip: newUser.nip,
         nama: newUser.name,
         role: newUser.role,
         opd: newUser.opd,
         pass: '123456'
      }]);
      if (error) throw error;
      addNotification(`Berhasil menambahkan pengguna manual: ${newUser.name} (${newUser.nip}) di wilayah ${newUser.opd} dengan password default 123456`);
      setNewUser({ nip: '', name: '', role: 'staf_pelaksana', opd: 'Kecamatan' });
    } catch (err: any) {
      console.error("DB Error:", err);
      addNotification(`Gagal menambah pengguna: ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['NO', 'NAMA', 'NIP', 'JENIS ASN', 'PANGKAT / GOL', 'JABATAN', 'UNIT ORGANISASI', 'OPD', 'ALAMAT', 'NO HP', 'TUGAS POKOK', 'SEHARI-HARI', 'ROLE'],
      [1, 'Budi Santoso', '198001012010011001', 'PNS', 'Penata Muda / III.a', 'Staf Pelaksana', 'Seksi Pemerintahan', 'Kecamatan XYZ', 'Jl. Merdeka No 1', '08123456789', 'Melaksanakan tugas administrasi', 'Menginput surat masuk', 'staf_pelaksana']
    ]);
    
    // Auto size columns
    ws['!cols'] = [
      { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Pegawai");
    XLSX.writeFile(wb, "Template_Import_Pegawai.xlsx");
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!config.supabaseUrl || !config.supabaseKey) {
      addNotification("Gagal: Database Supabase belum dikonfigurasi di Pengaturan.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    addNotification(`Sedang membaca file ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            throw new Error("File Excel kosong atau format tidak sesuai.");
          }

          // header processing to deal with potential spacing or casing
          const headers = jsonData[0].map(h => (h || '').toString().toUpperCase().trim());
          
          const idxNama = headers.findIndex(h => h === 'NAMA');
          const idxNip = headers.findIndex(h => h.startsWith('NIP'));
          const idxJenisAsn = headers.findIndex(h => h.includes('JENIS ASN'));
          const idxPangkat = headers.findIndex(h => h.includes('PANGKAT'));
          const idxJabatan = headers.findIndex(h => h.includes('JABATAN'));
          const idxUnit = headers.findIndex(h => h.includes('UNIT ORGANISASI'));
          const idxOpd = headers.findIndex(h => h.includes('OPD'));
          const idxAlamat = headers.findIndex(h => h.includes('ALAMAT'));
          const idxHp = headers.findIndex(h => h.includes('HP'));
          const idxTupoksi = headers.findIndex(h => h.includes('TUGAS POKOK'));
          const idxSehariHari = headers.findIndex(h => h.includes('SEHARI-HARI'));
          const idxRole = headers.findIndex(h => h === 'ROLE');

          const rows = jsonData.slice(1).filter(r => r[idxNip] && r[idxNama]); // Must have NIP and NAMA
          
          const dbPayload = rows.map(r => ({
             nama: r[idxNama],
             nip: String(r[idxNip]).replace(/[^0-9]/g, ''), // clean nip to only digits
             pass: '123456', // default password
             jenis_asn: idxJenisAsn >= 0 ? r[idxJenisAsn] : null,
             pangkat_gol: idxPangkat >= 0 ? r[idxPangkat] : null,
             jabatan: idxJabatan >= 0 ? r[idxJabatan] : null,
             unit_organisasi: idxUnit >= 0 ? r[idxUnit] : null,
             opd: idxOpd >= 0 ? r[idxOpd] : null,
             alamat: idxAlamat >= 0 ? r[idxAlamat] : null,
             no_hp: idxHp >= 0 ? r[idxHp] : null,
             tupoksi: idxTupoksi >= 0 ? r[idxTupoksi] : null,
             tugas_sehari_hari: idxSehariHari >= 0 ? r[idxSehariHari] : null,
             role: idxRole >= 0 && r[idxRole] ? r[idxRole].toLowerCase() : 'staf_pelaksana'
          }));

          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(config.supabaseUrl, config.supabaseKey);

          const { error } = await supabase.from('pegawai').insert(dbPayload);
          if (error) throw error;

          addNotification(`Import selesai: ${dbPayload.length} Pengguna baru telah ditambahkan ke Database.`);
          
          // Refresh context logic would go here if needed, or user can reload
        } catch (err: any) {
          console.error("Parse Error:", err);
          addNotification(`Gagal mengimpor data: ${err.message}`);
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setIsImporting(false);
      addNotification(`Terjadi kesalahan sistem: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-10 overflow-x-hidden p-4 lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola akses sistem aparat sipil, input manual, atau import via Excel.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 px-6 flex items-center gap-2">
           <Users size={18} className="text-gray-500" />
           <h2 className="font-bold text-gray-800">Manajemen Akses & Tambah Pengguna</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 divide-x-0 md:divide-x md:divide-gray-100">
           
           {/* Manual Input */}
           <div className="md:pr-8">
             <div className="flex items-center gap-2 mb-4 text-blue-600">
                <UserPlus size={18} />
                <h3 className="font-bold">Input Pengguna Manual</h3>
             </div>
             <form onSubmit={handleAddUserManual} className="space-y-4">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    required
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">NIP / Username</label>
                  <input
                    type="text"
                    value={newUser.nip}
                    onChange={(e) => setNewUser({...newUser, nip: e.target.value})}
                    placeholder="Contoh: 19800101"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    required
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Peran Akses (Role)</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                  >
                    <option value="staf_pelaksana">Staf Pelaksana</option>
                    <option value="staf_agenda">Staf Agenda</option>
                    <option value="kasi">Kasi / Kasubag / Kanit</option>
                    <option value="sekcam">Sekretaris / Wakapolsek / Batuud</option>
                    <option value="camat">Camat</option>
                    <option value="kapolsek">Kapolsek</option>
                    <option value="danramil">Danramil</option>
                    <option value="admin">Administrator</option>
                    <optgroup label="TNI / POLRI (Pelaksana)">
                       <option value="sertu">Sertu</option>
                       <option value="serma">Serma</option>
                       <option value="praka">Praka</option>
                       <option value="serda">Serda</option>
                       <option value="serka">Serka</option>
                       <option value="aipda">Aipda</option>
                       <option value="aiptu">Aiptu</option>
                       <option value="bripka">Bripka</option>
                       <option value="briptu">Briptu</option>
                    </optgroup>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">OPD / Institusi</label>
                  <input
                    type="text"
                    value={newUser.opd}
                    onChange={(e) => setNewUser({...newUser, opd: e.target.value})}
                    placeholder="Contoh: Kecamatan / Polsek / Koramil"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    required
                  />
               </div>
               <button type="submit" className="w-full text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm mt-4" style={{ backgroundColor: config.primaryColor }}>
                 Tambahkan Pengguna
               </button>
             </form>
           </div>
           
           {/* Bulk/Excel Import */}
           <div className="md:pl-8 pt-6 md:pt-0 border-t border-gray-100 md:border-t-0">
             <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <FileSpreadsheet size={18} />
                <h3 className="font-bold">Import Data Massal (Excel)</h3>
             </div>
             
             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
                <p className="text-xs text-emerald-800 leading-relaxed mb-3">Unduh template Excel lalu isi data pengguna secara massal. Sistem otomatis akan membuatkan kredensial (default password 123456) sesuai format.</p>
                <div className="flex items-center gap-2">
                   <button type="button" onClick={handleDownloadTemplate} className="text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded border border-emerald-200 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                     Download Template (.xlsx)
                   </button>
                </div>
             </div>
             
             <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-700">Klik untuk upload file Excel</span>
                <span className="text-xs text-gray-500 mt-1">Mendukung file .xlsx atau .xls (Maks 5MB)</span>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleExcelImport}
                />
             </label>
           </div>
           
        </div>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
           <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Daftar Pengguna Terdaftar ({usersList.length})
           </h2>
           <div className="relative w-full max-w-sm ml-auto">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="Cari berdasarkan nama atau NIP..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors bg-gray-50/50"
             />
           </div>
        </div>
        
        {usersList.length === 0 ? (
           <div className="text-center py-8 text-gray-500 bg-gray-50 border border-dashed rounded-xl">
              Belum ada pengguna terdaftar dari database. Silahkan import atau tambahkan manual.
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
             {usersList
               .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.includes(searchQuery))
               .map(u => (
                 <div key={u.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
                   <div className="flex justify-between items-start">
                     <span className="text-xs uppercase font-bold text-gray-400 mb-1">{u.role}</span>
                   </div>
                   <span className="font-semibold text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={u.name}>{u.name}</span>
                   <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block w-fit mt-1">NIP: {u.username}</span>
                   {u.title && <p className="text-xs text-gray-500 mt-2 line-clamp-1">{u.title}</p>}
                 </div>
             ))}
           </div>
        )}
      </div>

    </div>
  );
}
