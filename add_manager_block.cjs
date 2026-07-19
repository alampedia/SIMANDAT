const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

const mappingBlock = `
      {/* KASI / KABAG MAPPING BLOCK */}
      {isManager && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-5 lg:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
                <FileCheck2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Pemetaan / Mapping Staf</h3>
                <p className="text-xs text-gray-500 font-medium">Lakukan pemetaan dan disposisi tugas ke pelaksana</p>
              </div>
            </div>
            <Link to="/disposisi-masuk" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer block">
               Buka Halaman Pemetaan
            </Link>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* FEEDBACK MODAL \*\/\}/,
  mappingBlock + '\n\n      {/* FEEDBACK MODAL */}'
);

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
