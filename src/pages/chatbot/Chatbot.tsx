import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Chatbot() {
  const { config, user, addTask } = useAppContext();
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: 'Halo! Saya asisten pintar SI-MANDAT. Ada yang bisa saya bantu terkait surat, disposisi, atau memberikan perintah kepada sekcam?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate API call to Gemini/Local AI
    setTimeout(() => {
      let botReply = 'Maaf, saya tidak mengerti.';
      
      const lower = userMessage.toLowerCase();
      if (lower.includes('mapping') || lower.includes('verifikasi') || lower.includes('sekcam') || lower.includes('validasi')) {
         addTask({
            nomorSurat: 'BOT-' + Math.floor(Math.random() * 10000),
            title: `Perintah dari ${user?.name || user?.username || 'Pengguna'} (Chatbot)`,
            sender: user?.name || user?.username || 'Pimpinan',
            date: new Date().toISOString(),
            status: 'pending_sekcam',
            priority: 'high',
            assignedTo: 'sekcam',
            instructions: userMessage,
            progress: 0
         });
         botReply = `Baik, perintah Anda telah direkam berdasarkan ID Anda (${user?.username || 'Pengguna'}). Pesan telah dikirimkan ke Sekcam untuk segera dilakukan mapping dan verifikasi.`;
      } else if (lower.includes('surat')) {
         botReply = 'Saat ini ada beberapa surat aktif di sistem. Anda bisa langsung menugaskannya melalui form atau melalui chat ini.';
      } else if (lower.includes('disposisi') || lower.includes('tugas')) {
         botReply = 'Anda dapat melihat tugas di menu "Dasbor" atau "Kotak Tugas Saya". Jika ada yang terlambat, peringatan akan berwarna merah.';
      } else if (config.geminiApiKey) {
         botReply = '[Simulasi Gemini API] - Sistem mendeteksi API Key Gemini aktif. Draf balasan sedang di-generate...';
      } else {
         botReply = 'Maaf, API Key Gemini tidak disetel. Anda dapat menyetel API Key Gemini Chat di menu Pengaturan untuk menggunakan fitur chat AI.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] px-4 pt-4 lg:px-6">
      
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'bot' && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: config.primaryColor }}
              >
                 <Bot size={16} />
              </div>
            )}
            
            <div className={cn(
              "px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-br-none" 
                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
            )}
            style={msg.role === 'user' ? { backgroundColor: config.primaryColor } : {}}
            >
               {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                 <User size={16} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
           <div className="flex items-end gap-2">
             <div className="w-8 h-8 flex items-center justify-center shrink-0">
               <Sparkles size={16} className="animate-pulse" style={{ color: config.primaryColor }} />
             </div>
             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none text-sm text-gray-400">
               Mengetik balasan...
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex items-center gap-2 mb-4">
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya asisten tentang disposisi..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-gray-800 placeholder:text-gray-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
