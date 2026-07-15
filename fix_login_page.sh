cat << 'INNER_EOF' > login_page_patch.cjs
const fs = require('fs');
const content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const newHandleLogin = `
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result && result.success) {
      navigate('/');
    } else {
      setError(result?.message || 'Email/NIP atau password salah.');
    }
  };
`;

const regex = /const handleLogin = async \(e: React\.FormEvent\) => \{[\s\S]*?setError\('Email\/NIP atau password salah\.'\);\n    \}\n  \};/;
const updatedContent = content.replace(regex, newHandleLogin.trim());
fs.writeFileSync('src/pages/Login.tsx', updatedContent);
INNER_EOF
node login_page_patch.cjs
