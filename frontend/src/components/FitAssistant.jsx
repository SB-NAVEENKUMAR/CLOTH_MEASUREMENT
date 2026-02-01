import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FitAssistant({ measurements }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your AI FitAssistant. Ask me about your measurements or style advice.' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');

        // Simple Heuristic AI for the prototype
        // In production, this would hit the LLM API
        let botResponse = "I'm analyzing your data...";

        setTimeout(() => {
            const lower = userMsg.toLowerCase();

            if (lower.includes('chest')) {
                const val = measurements?.chest?.toFixed(1) || "unknown";
                botResponse = `Your chest measurement is ${val} inches. For a suit, I recommend a tailored fit with a 2-inch ease.`;
            }
            else if (lower.includes('waist')) {
                const val = measurements?.waist?.toFixed(1) || "unknown";
                botResponse = `Your waist is ${val} inches. Look for trousers labeled W${Math.floor(val)}.`;
            }
            else if (lower.includes('game') || lower.includes('play')) {
                botResponse = "Your digital twin is ready for the City Run game! Click 'Game World' on the home page.";
            }
            else {
                botResponse = "I can help explain your body metrics or suggest clothing sizes. Try asking 'What fits my chest size?'";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        }, 600);
    };

    return (
        <>
            <div
                className="fixed bottom-8 right-8 z-50 bg-cyan-500 p-4 rounded-full cursor-pointer shadow-lg hover:bg-cyan-400 transition"
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare color="black" size={24} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-8 w-80 h-96 glass-panel flex flex-col z-50 overflow-hidden bg-black/90 border-cyan-500/30 border"
                    >
                        <div className="p-3 bg-cyan-900/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot size={18} className="text-cyan-400" />
                                <span className="font-bold text-sm">FitAssistant AI</span>
                            </div>
                            <X size={18} className="cursor-pointer hover:text-red-400" onClick={() => setIsOpen(false)} />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.role === 'user'
                                            ? 'bg-cyan-600 text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-white/10 flex gap-2">
                            <input
                                className="flex-1 bg-black/50 border border-white/20 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                placeholder="Ask about size..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="bg-cyan-500/20 p-2 rounded hover:bg-cyan-500/40 text-cyan-400"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
