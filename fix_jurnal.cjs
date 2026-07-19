const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

content = content.replace(
  /const newActivityObj = \{\n\s*id: Math\.random\(\)\.toString\(\), \/\/ temp ID\n\s*nip: user\.username,\n\s*aktivitas: activity,\n\s*tanggal: new Date\(\)\.toISOString\(\)\n\s*\};\n\s*const \{ error \} = await supabase\.from\('kinerja_harian'\)\.insert\(\[newActivityObj\]\);/,
  `const newActivityObj: any = {
          nip: user.username,
          aktivitas: activity,
          tanggal: new Date().toISOString()
        };
        const { data, error } = await supabase.from('kinerja_harian').insert([newActivityObj]).select();`
);

content = content.replace(
  /setRecentActivities\(prev => \[newActivityObj, \.\.\.prev\]\.slice\(0, 5\)\);/,
  "setRecentActivities(prev => [data && data.length > 0 ? data[0] : { ...newActivityObj, id: crypto.randomUUID() }, ...prev].slice(0, 5));"
);

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
