
import React, { useState, useRef, useEffect } from 'react';
import { Message, Problem, ArchitectureType } from '../types';
import { geminiService } from '../services/geminiService';

interface TutorSidebarProps {
  currentProblem: Problem;
  activeArch: ArchitectureType;
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({ currentProblem, activeArch }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Ready to explore this problem together? I'm watching the screen!", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let screenshot: string | undefined;
    if (activeArch === ArchitectureType.MULTIMODAL_VISION) {
      // Simulation: Pass a dummy data URI to trigger vision model
      screenshot = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."; 
    }

    const aiResponse = await geminiService.getTutorResponse(messages, currentProblem, textToSend, screenshot);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: aiResponse, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border-4 border-slate-50 overflow-hidden">
      {/* Extension Panel Header */}
      <div className="bg-[#2d3e50] p-5 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
            👁️
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-sm leading-none">Vision Tutor</h3>
            <span className="text-[9px] opacity-60 uppercase tracking-widest font-black">AI Assistant</span>
          </div>
        </div>
        <button 
          onClick={() => handleSend("Look at the screen and give me a small hint.")}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
          title="Take Snapshot"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
            }`}>
              {m.text}
            </div>
            <span className="text-[8px] mt-1 opacity-30 font-black">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
        {isTyping && (
          <div className="flex space-x-1.5 p-3 bg-white rounded-xl w-max border border-slate-100 shadow-sm">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      {/* Extension Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="w-full bg-slate-100 border-none rounded-xl py-3.5 pl-4 pr-12 focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold outline-none"
          />
          <button 
            onClick={() => handleSend()}
            className="absolute right-1.5 top-1.5 w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Socratic Mode: Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default TutorSidebar;
