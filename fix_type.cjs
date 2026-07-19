const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// add type to interface
content = content.replace(
  /assignedTo\?: string; \/\/ final target/,
  "assignedTo?: string; // final target\n  type?: 'masuk' | 'keluar' | 'arsip';"
);

// mapping formattedTasks
content = content.replace(
  /sender: t\.sender,\n\s*date: t\.date,/,
  "sender: t.sender,\n            date: t.date,\n            type: t.type || 'masuk',"
);

// insertion
content = content.replace(
  /sender: task\.sender,\n\s*date: task\.date,/,
  "sender: task.sender,\n          date: task.date,\n          type: task.type || 'masuk',"
);

fs.writeFileSync('src/context/AppContext.tsx', content);
