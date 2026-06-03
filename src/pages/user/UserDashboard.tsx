import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Send, TrendingDown, TrendingUp, Minus, ClipboardList, CheckCircle2, FileText, Inbox, Clock, CheckCircle, AlertTriangle, PieChart as PieChartIcon, Users, FileCheck2, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function UserDashboard() {
  const { config, addNotification, tasks, user, updateTaskStatus, usersList } = useAppContext();
  const [activity, setActivity] = useState('');
  const [latestActivity, setLatestActivity] = useState('Menginput surat masuk nomor 123/456-Kec/2024');
  const [performancePercentage, setPerformancePercentage] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(20);

  // Computed variables for tasks
  const myTasks = tasks.filter(t => t.assignedTo === user?.name || t.assignedTo === user?.username);
  const activeTasksCount = myTasks.filter(t => t.status !== 'completed').length;

  const incomingSekcamTasks = tasks.filter(t => t.status === 'pending_sekcam');
  const incomingCamatTasks = tasks.filter(t => t.status === 'pending_camat');
  
  const [isTugasOpen, setIsTugasOpen] = useState(activeTasksCount > 0);
  const [isDelegasiOpen, setIsDelegasiOpen] = useState(incomingSekcamTasks.length > 0);
  const [isPersetujuanOpen, setIsPersetujuanOpen] = useState(incomingCamatTasks.length > 0);

  // States for Task Feedback Completion Target
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const submitCompletionFeedback = () => {
     if (feedbackTaskId) {
        updateTaskStatus(feedbackTaskId, 'completed', feedbackText ? `Tugas diselesaikan. Catatan/Feedback Pelaksana: ${feedbackText}` : 'Tugas diselesaikan oleh Target', undefined, 100);
        setFeedbackTaskId(null);
        setFeedbackText('');
     }
  };

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user?.username || !config.supabaseUrl || !config.supabaseKey) return;
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        let days = 0;
        // Hitung 5 hari kerja (Senin - Jumat) di bulan ini
        for (let d = 1; d <= endOfMonth.getDate(); d++) {
          const date = new Date(now.getFullYear(), now.getMonth(), d);
          const day = date.getDay();
          if (day !== 0 && day !== 6) {
            days++;
          }
        }
        setWorkingDays(days);
        
        const { count, data, error } = await supabase
          .from('kinerja_harian')
          .select('*', { count: 'exact' })
          .eq('nip', user.username)
          .gte('tanggal', startOfMonth.toISOString())
          .lte('tanggal', endOfMonth.toISOString())
          .order('tanggal', { ascending: false });
          
        if (!error && data) {
          const inputs = count || 0;
          const pct = days > 0 ? Math.round((inputs / days) * 100) : 0;
          setPerformancePercentage(pct);
          setRecentActivities(data.slice(0, 5));
          if (data.length > 0) {
            setLatestActivity(data[0].aktivitas);
          }
        }
      } catch (err) {
        console.error("Failed to fetch performance", err);
      }
    };
    fetchPerformance();
  }, [user, config.supabaseUrl, config.supabaseKey]);

  const role = user?.role || 'staf_pelaksana';
  const isPimpinanPuncak = ['camat', 'kapolsek', 'danramil'].includes(role);
  const isPimpinan = isPimpinanPuncak || role === 'sekcam' || role === 'admin';
  const isManager = role === 'kasi' || role === 'kabag' || role === 'kasubag';
  const staffRoles = ['pelaksana', 'staf_pelaksana', 'staf_agenda', 'sertu', 'serma', 'praka', 'serda', 'serka', 'aipda', 'aiptu', 'bripka', 'briptu'];
  const isStaf = staffRoles.includes(role);
  
  // Tasks assigned to downline staff (for Manager view)
  const staffTasks = tasks.filter(t => {
     const assignedUser = usersList.find(u => u.name === t.assignedTo || u.username === t.assignedTo);
     return assignedUser && staffRoles.includes(assignedUser.role);
  });



  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;
    
    setLatestActivity(activity);
    
    if (config.supabaseUrl && config.supabaseKey && user?.username) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        const newActivityObj = {
          id: Math.random().toString(), // temp ID
          nip: user.username,
          aktivitas: activity,
          tanggal: new Date().toISOString()
        };

        const { error } = await supabase.from('kinerja_harian').insert([newActivityObj]);

        if (error) throw error;
        
        // Optimistically update performance percentage and list
        const currentInputsCount = Math.round((performancePercentage / 100) * workingDays);
        const newInputs = currentInputsCount + 1;
        setPerformancePercentage(workingDays > 0 ? Math.round((newInputs / workingDays) * 100) : 0);
        setRecentActivities(prev => [newActivityObj, ...prev].slice(0, 5));
        addNotification('Jurnal kinerja harian berhasil dicatat dan disimpan di database.');
      } catch (err: any) {
        console.error("Error saving activity:", err);
        addNotification(`Gagal menyimpan ke database: ${err.message}. Solusi: Cek format data atau pastikan url/key Supabase valid di menu Pengaturan.`);
      }
    } else {
      addNotification('Sistem belum terhubung ke database. Data jurnal hanya tersimpan sementara karena setelan Supabase belum diisi. Silakan isi di Menu Pengaturan!');
    }
    
    setActivity('');
  };

  // Logic for dynamic trending icon
  let TrendIcon = TrendingUp;
  let trendColor = "text-green-200";
  let trendTitle = "Sangat Baik";

  if (performancePercentage < 50) {
    TrendIcon = TrendingDown;
    trendColor = "text-red-200";
    trendTitle = "Perlu Ditingkatkan";
  } else if (performancePercentage <= 85) {
    TrendIcon = Minus;
    trendColor = "text-yellow-200";
    trendTitle = "Cukup";
  } else {
    TrendIcon = TrendingUp;
    trendColor = "text-green-200";
    trendTitle = "Sangat Baik";
  }

  return (
    <div className="space-y-6 lg:px-4">
      
      {!isPimpinanPuncak && (
        <div className={cn("grid gap-4 w-full grid-cols-1")}>
          
          {/* 2B. Kinerja Bulanan & Aktivitas Terakhir (SEMUA PENGGUNA) */}
          <div 
            className="rounded-2xl p-4 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            style={{ 
              background: `linear-gradient(135deg, ${config.primaryColor} 0%, #312e81 100%)` 
            }}
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl pointer-events-none" />
            
            <div className="flex flex-col relative z-10 gap-3">
              {/* Top row with Title */}
              <div className="flex items-center gap-1.5">
                <ClipboardList size={14} className="opacity-80 drop-shadow-sm" />
                <h3 className="text-[10px] font-medium text-white/90 tracking-wide uppercase">Kinerja Bulanan</h3>
              </div>
              
              {/* Middle row tightly packing Percentage and Status */}
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md leading-none">{performancePercentage}%</span>
                <div 
                  className="bg-white/20 backdrop-blur-md rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-white/20" 
                  title={`Status Kinerja: ${trendTitle}`}
                >
                  <TrendIcon size={14} className={trendColor} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Riwayat Aktivitas Terakhir */}
            <div className="relative z-10 pt-2 border-t border-white/10 mt-3">
               <p className="text-[9px] uppercase tracking-wider font-bold text-white/60 mb-0.5">Aktivitas Terakhir</p>
               <p className="text-[10px] sm:text-[11px] font-medium text-white/90 leading-snug line-clamp-2">{latestActivity || 'Belum ada aktivitas kinerja tercatat hari ini.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD PIMPINAN (Camat) - Surat perlu di approve */}
      {isPimpinan && (
        <div className="space-y-6">
          {isPimpinanPuncak && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsPersetujuanOpen(!isPersetujuanOpen)}
              >
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" /> Naskah Dinas Perlu Persetujuan (Approve)
                 </h3>
                 <div className="flex items-center gap-3">
                   <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg">{incomingCamatTasks.length} Menunggu</span>
                   <ChevronDown size={18} className={cn("text-gray-400 transition-transform", isPersetujuanOpen && "rotate-180")} />
                 </div>
              </div>
              
              {isPersetujuanOpen && (
                <div className="p-6 pt-0 space-y-3">
                   {incomingCamatTasks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                         Tidak ada naskah dinas yang perlu persetujuan saat ini.
                      </div>
                   ) : (
                      <div className="space-y-3">
                        {incomingCamatTasks.map(task => (
                          <div key={task.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-indigo-50/50 transition-colors">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wide border border-indigo-100">{task.nomorSurat || task.id}</span>
                                  <span className="text-[11px] text-gray-500 font-medium">{format(new Date(task.date), 'dd MMM yyyy', { locale: localeId })}</span>
                               </div>
                               <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                               <p className="text-xs text-gray-600 line-clamp-1"><span className="font-semibold text-gray-800">Usulan Target:</span> {task.assignedTo}</p>
                            </div>
                            <Link to="/disposisi" className="shrink-0 w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer block">
                               Buka Halaman Validasi
                            </Link>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              )}
            </div>
          )}

          {role === 'sekcam' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsDelegasiOpen(!isDelegasiOpen)}
              >
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck2 size={18} className="text-emerald-600" /> Disposisi Masuk (Mapping/Verifikasi)
                 </h3>
                 <div className="flex items-center gap-3">
                   <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg">{incomingSekcamTasks.length} Menunggu</span>
                   <ChevronDown size={18} className={cn("text-gray-400 transition-transform", isDelegasiOpen && "rotate-180")} />
                 </div>
              </div>
              
              {isDelegasiOpen && (
                <div className="p-6 pt-0">
                  <p className="text-sm text-gray-600 mb-4 font-medium">Petakan naskah dinas masuk kepada target pejabat/staf bersangkutan dan ajukan rincian ke pimpinan.</p>
                  <div className="space-y-3">
                     {incomingSekcamTasks.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                           Tidak ada disposisi yang perlu diproses saat ini.
                        </div>
                     ) : (
                        <div className="space-y-3">
                          {incomingSekcamTasks.map(task => (
                            <div key={task.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-emerald-50/50 transition-colors">
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-100">{task.nomorSurat || task.id}</span>
                                    <span className="text-[11px] text-gray-500 font-medium">{format(new Date(task.date), 'dd MMM yyyy', { locale: localeId })}</span>
                                 </div>
                                 <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                                 <p className="text-xs text-gray-600 line-clamp-1"><span className="font-semibold text-gray-500">Dari:</span> {task.sender}</p>
                              </div>
                              <Link to="/disposisi" className="shrink-0 w-full sm:w-auto text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer block">
                                 Buka Form Mapping
                              </Link>
                            </div>
                          ))}
                        </div>
                     )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD KOTAK TUGAS SAYA */}
      {(!isPimpinanPuncak && role !== 'admin') && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="p-5 lg:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
            onClick={() => setIsTugasOpen(!isTugasOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Kotak Tugas Saya</h3>
                <p className="text-xs text-gray-500 font-medium">Selesaikan tugas sebelum tenggat waktu</p>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {activeTasksCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                  <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", activeTasksCount > 0 ? "bg-red-500" : "bg-green-500")}></span>
                </span>
                <span className="text-gray-700 text-xs font-bold">
                  {activeTasksCount} Tugas Aktif
                </span>
              </div>
              <ChevronDown size={20} className={cn("text-gray-400 transition-transform", isTugasOpen && "rotate-180")} />
            </div>
          </div>

          {isTugasOpen && (
            <div className="p-0 border-t border-gray-100">
              {activeTasksCount === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle size={32} className="text-green-400" />
                 </div>
                 <p className="text-gray-900 font-bold">Semua tugas telah selesai!</p>
                 <p className="text-sm text-gray-500 mt-1">Anda tidak memiliki tugas prioritas saat ini.</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Table Header (Desktop only) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Detail Dokumen / Tugas</div>
                  <div className="col-span-4">Instruksi Arahan</div>
                  <div className="col-span-2">Prioritas</div>
                  <div className="col-span-2 text-right">Aksi Tindak Lanjut</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {myTasks.filter(t => t.status !== 'completed').map(task => (
                    <div key={task.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 hover:bg-indigo-50/30 transition-colors items-center group">
                        
                        {/* Column 1: Dokumen / Title */}
                        <div className="col-span-1 md:col-span-4 flex flex-col items-start gap-1">
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wide border border-indigo-100 mb-1">{task.id}</span>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{task.title}</h4>
                          {task.driveUrl && (
                             <a href={task.driveUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md mt-1 hover:bg-blue-100">Buka Lampiran Drive</a>
                          )}
                        </div>
                        
                        {/* Column 2: Instruksi */}
                        <div className="col-span-1 md:col-span-4">
                          <div className="inline-flex md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1">Instruksi Arahan:</div>
                          <p className="text-xs text-gray-600 font-medium line-clamp-2 md:line-clamp-3 bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg">{task.instructions || 'Segera tindak lanjuti sesuai prosedur.'}</p>
                        </div>
                        
                        {/* Column 3: Status / Prioritas */}
                        <div className="col-span-1 md:col-span-2 flex items-center md:items-start md:flex-col gap-2">
                           <div className="inline-flex md:hidden text-[10px] uppercase font-bold text-gray-400">Prioritas:</div>
                           {task.status === 'overdue' ? (
                             <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                               <AlertTriangle size={12} className="text-red-500" /> Mendesak
                             </span>
                           ) : (
                             <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                               <Clock size={12} className="text-amber-500" /> Menunggu
                             </span>
                           )}
                        </div>
                        
                        {/* Column 4: Aksi */}
                        <div className="col-span-1 md:col-span-2 flex flex-col items-end mt-2 md:mt-0 gap-2">
                          <div className="text-[10px] font-bold text-gray-500 w-full md:text-right">Progres: {task.progress || 0}%</div>
                          <div className="flex bg-gray-100 rounded-lg p-1 w-full justify-between">
                             <button onClick={() => updateTaskStatus(task.id, 'in_progress', 'Update progres', undefined, 25)} className="text-[10px] px-2 py-1 rounded hover:bg-white hover:shadow-sm font-bold text-gray-700">25%</button>
                             <button onClick={() => updateTaskStatus(task.id, 'in_progress', 'Update progres', undefined, 50)} className="text-[10px] px-2 py-1 rounded hover:bg-white hover:shadow-sm font-bold text-gray-700">50%</button>
                             <button onClick={() => updateTaskStatus(task.id, 'in_progress', 'Update progres', undefined, 75)} className="text-[10px] px-2 py-1 rounded hover:bg-white hover:shadow-sm font-bold text-gray-700">75%</button>
                          </div>
                          <button 
                            onClick={() => setFeedbackTaskId(task.id)}
                            className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 group-hover:-translate-y-0.5"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            <CheckCircle2 size={14} /> 
                            Selesaikan
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackTaskId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4" onClick={() => setFeedbackTaskId(null)}>
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shadow-sm">
                     <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Selesaikan Tugas</h3>
                    <p className="text-sm text-gray-500 font-medium">Beri laporan / respons kepada pimpinan.</p>
                  </div>
               </div>
               
               <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:border-transparent outline-none resize-none transition-all duration-300 mb-4"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  rows={4}
                  placeholder="(Opsional) Tulis laporan singkat pelaksanaan tugas, kendala, atau feedback untuk atasan..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
               />
               
               <div className="flex justify-end gap-3">
                  <button 
                     onClick={() => setFeedbackTaskId(null)}
                     className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                  >
                     Batal
                  </button>
                  <button 
                     onClick={submitCompletionFeedback}
                     className="px-4 py-2 flex items-center gap-2 rounded-xl font-bold text-white shadow-sm hover:shadow-md active:scale-95 transition-all"
                     style={{ backgroundColor: config.primaryColor }}
                  >
                     <Send size={16} /> Laporkan Selesai
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* 3. AKTIVITAS HARIAN FORM (Isian Mandiri Semua User) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
            <ClipboardList size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Jurnal Kinerja (Input Uraian)</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 font-medium">Isian mandiri berupa uraian kegiatan harian yang akan terekap di modul Cetak Kinerja Harian.</p>
        
        <form onSubmit={handleSubmitActivity}>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:border-transparent outline-none resize-none transition-all duration-300 shadow-inner"
            style={{ '--tw-ring-color': config.primaryColor } as any}
            rows={4}
            placeholder="Contoh: Menyelesaikan laporan warga, mengikuti diklat online, melayani administrasi..."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              style={{ backgroundColor: config.primaryColor }}
            >
              Catat Jurnal
              <Send size={16} />
            </button>
          </div>
        </form>
        
        {recentActivities.length > 0 && (
           <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <ClipboardList size={16} className="text-indigo-600" />
                 Daftar Uraian Tugas Terealisasi (Terbaru)
              </h4>
              <div className="space-y-3">
                 {recentActivities.map((act) => (
                    <div key={act.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                       <div className="p-1.5 bg-green-100 text-green-600 rounded-lg shrink-0 mt-0.5">
                          <CheckCircle2 size={14} />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{act.aktivitas}</p>
                          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1.5 block">
                             {format(new Date(act.tanggal || new Date()), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

    </div>
  );
}
