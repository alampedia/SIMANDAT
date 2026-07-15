sed -i 's/login: (username: string, pass: string) => Promise<boolean>;/login: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;/g' src/context/AppContext.tsx
