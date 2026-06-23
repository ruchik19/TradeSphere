import { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import apiClient from '../api/axios.js';

const AiAdvisor = () => {
  const [messages, setMessages] = useState([{ role: 'ai', content: "Hello! I'm your AI Finance Tutor. Ask me any financial questions." }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Assumes your node route is POST /api/ai/chat
      const res = await apiClient.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to the AI engine right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">AI Advisor</h1>
        <p className="text-slate-500">Your personal financial tutor.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Bot size={20} /></div>
               <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Thinking...</div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inflation, PE ratios, or market trends..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button type="submit" disabled={isLoading} className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAdvisor;
