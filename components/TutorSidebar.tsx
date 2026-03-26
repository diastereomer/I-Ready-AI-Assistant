import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';

async function captureTab(): Promise<string | null> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'captureTab' });
    if (response?.success) return response.dataUrl;
    console.error('Capture failed:', response?.error);
    return null;
  } catch (err) {
    console.error('Could not capture tab:', err);
    return null;
  }
}

const TutorSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hi! I'm your AI tutor. Click the camera button to capture your I-Ready screen and I'll help explain the question!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleCapture = async () => {
    if (isLoading) return;

    setIsLoading(true);

    const screenshot = await captureTab();
    if (!screenshot) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "I couldn't capture the screen. Make sure you're on an I-Ready page and try again.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      return;
    }

    setLastScreenshot(screenshot);

    const userMsg: Message = {
      role: 'user',
      text: 'I captured my screen. Can you look at it and explain what the question is asking?',
      timestamp: new Date(),
      screenshotUrl: screenshot,
    };
    setMessages(prev => [...prev, userMsg]);

    const response = await geminiService.getTutorResponse(
      messages,
      'Here is a screenshot of the student\'s I-Ready lesson. Look at it carefully, identify the question being asked, and explain it in simple terms. Do NOT give the answer.',
      screenshot,
    );

    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await geminiService.getTutorResponse(
      messages,
      textToSend,
      lastScreenshot ?? undefined,
    );

    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#2d3e50] p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-lg shadow-lg">
            👁️
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-sm leading-none">Vision Tutor</h3>
            <span className="text-[9px] opacity-60 uppercase tracking-widest font-black">I-Ready AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Capture Button Bar */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <button
          onClick={handleCapture}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="13" r="3" strokeWidth="2.5" />
          </svg>
          <span>{isLoading ? 'Analyzing...' : 'Capture I-Ready Screen'}</span>
        </button>
      </div>

      {/* Screenshot Preview (thumbnail of last capture) */}
      {lastScreenshot && (
        <div className="px-3 pt-2 shrink-0">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={lastScreenshot}
              alt="Last captured screen"
              className="w-full h-20 object-cover object-top"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
              <span className="text-[9px] text-white font-bold">Latest capture</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            {m.screenshotUrl && (
              <div className="max-w-[85%] mb-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={m.screenshotUrl} alt="Screen capture" className="w-full h-24 object-cover object-top" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[8px] mt-1 opacity-30 font-black">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-1.5 p-3 bg-white rounded-xl w-max border border-slate-100 shadow-sm">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="absolute right-1.5 top-1.5 w-8 h-8 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <div className="mt-1.5 flex justify-center">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
            Explains questions only &mdash; never gives answers
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorSidebar;
