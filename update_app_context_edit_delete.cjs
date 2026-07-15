const fs = require('fs');
const content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

let updated = content;

if (!updated.includes('updateTask: (')) {
  updated = updated.replace(
    /updateTaskStatus: \(taskId: string, newStatus: DisposisiTask\['status'\], note\?: string, assignedTo\?: string, progress\?: number, deadline\?: string\) => void;/,
    "updateTaskStatus: (taskId: string, newStatus: DisposisiTask['status'], note?: string, assignedTo?: string, progress?: number, deadline?: string) => void;\n  updateTask: (taskId: string, updates: Partial<DisposisiTask>) => Promise<void>;\n  deleteTask: (taskId: string) => Promise<void>;"
  );
}

const updateTaskFunc = `
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
        addNotification(\`Gagal mengupdate naskah di database: \${err.message}.\`);
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
        addNotification(\`Naskah berhasil dihapus.\`);
      } catch (err: any) {
        console.error("DB Error on deleteTask", err);
        addNotification(\`Gagal menghapus naskah di database: \${err.message}.\`);
      }
    }
  };
`;

if (!updated.includes('const updateTask = async')) {
  updated = updated.replace(
    /const updateTaskStatus = async/,
    updateTaskFunc + "\n  const updateTaskStatus = async"
  );
}

updated = updated.replace(
  /addTask, updateTaskStatus, notifications,/,
  "addTask, updateTaskStatus, updateTask, deleteTask, notifications,"
);

fs.writeFileSync('src/context/AppContext.tsx', updated);
