const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// add type to interface
content = content.replace(
  /type\?: 'masuk' \| 'keluar' \| 'arsip';/,
  "type?: 'masuk' | 'keluar' | 'arsip';\n  disposisiType?: 'reguler' | 'akhir';"
);

// update mapping formattedTasks
content = content.replace(
  /type: t\.type \|\| 'masuk',/,
  "type: t.type || 'masuk',\n            disposisiType: t.disposisi_type,"
);

// update insert payload in addTask
content = content.replace(
  /type: task\.type \|\| 'masuk',/,
  "type: task.type || 'masuk',\n          disposisi_type: task.disposisiType,"
);

// also in updateTaskStatus, we might need to be able to set disposisiType.
content = content.replace(
  /const updateTaskStatus = async \(taskId: string, newStatus: DisposisiTask\['status'\], note\?: string, assignedTo\?: string, progress\?: number, deadline\?: string\) => \{/,
  "const updateTaskStatus = async (taskId: string, newStatus: DisposisiTask['status'], note?: string, assignedTo?: string, progress?: number, deadline?: string, disposisiType?: 'reguler' | 'akhir') => {"
);

// optimistic update
content = content.replace(
  /\.\.\.\(assignedTo \? \{ assignedTo \} : \{\}\)/,
  "...(assignedTo ? { assignedTo } : {}),\n           ...(disposisiType ? { disposisiType } : {})"
);

// update payload
content = content.replace(
  /if \(assignedTo\) updatePayload\.assigned_to = assignedTo;/,
  "if (assignedTo) updatePayload.assigned_to = assignedTo;\n        if (disposisiType) updatePayload.disposisi_type = disposisiType;"
);


fs.writeFileSync('src/context/AppContext.tsx', content);
