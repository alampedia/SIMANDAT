sed -i '114,124d' src/pages/menu/MobileMenu.tsx
sed -i '/id: '\''tupoksi'\''/a \
    }, \
    { \
       id: '\''catatan-rapat'\'', \
       label: '\''Catatan Rapat'\'', \
       icon: NotebookPen, \
       path: '\''/catatan-rapat'\'', \
       roles: ['\''admin'\'', '\''staf_pelaksana'\'', '\''staf_agenda'\'', '\''kasi'\'', '\''kabag'\'', '\''kasubag'\'', '\''sekcam'\'', '\''camat'\'', '\''kapolsek'\'', '\''danramil'\''] \
    }, \
    { \
       id: '\''jdih'\'', \
       label: '\''JDIH'\'', \
       icon: BookOpen, \
       path: '\''/jdih'\'', \
       roles: ['\''admin'\'', '\''kasi'\'', '\''kabag'\'', '\''kasubag'\'', '\''sekcam'\'', '\''camat'\'', '\''kapolsek'\'', '\''danramil'\'', '\''staf_pelaksana'\'', '\''staf_agenda'\'']' src/pages/menu/MobileMenu.tsx
