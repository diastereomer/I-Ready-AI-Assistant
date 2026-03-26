import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { geminiService, getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../services/geminiService';

type AuthStatus = "checking" | "ready" | "needs_key";

interface CaptureResult {
  dataUrl: string | null;
  error: string | null;
}

async function captureTab(): Promise<CaptureResult> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'captureTab' });
    if (response?.success) return { dataUrl: response.dataUrl, error: null };
    return { dataUrl: null, error: response?.error ?? 'Unknown capture error' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { dataUrl: null, error: msg };
  }
}

const TutorSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: Message['role'], text: string) => {
    setMessages(prev => [...prev, { role, text, timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await chrome.identity.getAuthToken({ interactive: false });
        if (token?.token) {
          setAuthStatus("ready");
          addMessage('model', "Hi! I'm your AI tutor. Click the camera button to capture your I-Ready screen and I'll help explain the question!");
          return;
        }
      } catch { /* OAuth not configured — fall through */ }

      const apiKey = await getStoredApiKey();
      if (apiKey) {
        setAuthStatus("ready");
        addMessage('model', "Hi! I'm your AI tutor. Click the camera button to capture your I-Ready screen and I'll help explain the question!");
      } else {
        setAuthStatus("needs_key");
        setShowSettings(true);
        addMessage('model', "Welcome! Google sign-in isn't available yet. Please enter a Gemini API key in the settings above to get started.");
      }
    })();
  }, [addMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSignIn = async () => {
    try {
      const result = await chrome.identity.getAuthToken({ interactive: true });
      if (result?.token) {
        setAuthStatus("ready");
        setShowSettings(false);
        addMessage('model', "Signed in! You're all set. Click the camera button to capture your I-Ready screen.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addMessage('model', `Google sign-in failed: ${msg}. You can use an API key instead.`);
    }
  };

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    await setStoredApiKey(trimmed);
    setAuthStatus("ready");
    setShowSettings(false);
    setApiKeyInput('');
    addMessage('model', "API key saved! Click the camera button to capture your I-Ready screen.");
  };

  const handleClearApiKey = async () => {
    await clearStoredApiKey();
    setApiKeyInput('');
    setAuthStatus("needs_key");
    addMessage('model', "API key removed. Sign in with Google or enter a new key.");
  };

  const handleCapture = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const { dataUrl: screenshot, error } = await captureTab();
    if (!screenshot) {
      addMessage('model', `I couldn't capture the screen: ${error}. Make sure a webpage is open in the active tab and try again.`);
      setIsLoading(false);
      return;
    }

    setLastScreenshot(screenshot);
    setMessages(prev => [...prev, {
      role: 'user',
      text: 'I captured my screen. Can you look at it and explain what the question is asking?',
      timestamp: new Date(),
      screenshotUrl: screenshot,
    }]);

    const response = await geminiService.getTutorResponse(
      messages,
      'Here is a screenshot of the student\'s I-Ready lesson. Look at it carefully, identify the question being asked, and explain it in simple terms. Do NOT give the answer.',
      screenshot,
    );

    setIsLoading(false);
    if (response === "NO_AUTH") {
      setAuthStatus("needs_key");
      setShowSettings(true);
      addMessage('model', "I need authentication to work. Please sign in with Google or enter an API key.");
    } else {
      addMessage('model', response);
    }
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    const response = await geminiService.getTutorResponse(
      messages,
      textToSend,
      lastScreenshot ?? undefined,
    );

    setIsLoading(false);
    if (response === "NO_AUTH") {
      setAuthStatus("needs_key");
      setShowSettings(true);
      addMessage('model', "I need authentication to work. Please sign in with Google or enter an API key.");
    } else {
      addMessage('model', response);
    }
  };

  const isReady = authStatus === "ready";

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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          {/* Google Sign-In */}
          <div>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-2">
            <div className="flex-grow h-px bg-slate-200" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">or use API key</span>
            <div className="flex-grow h-px bg-slate-200" />
          </div>

          {/* API Key fallback */}
          <div>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
                placeholder="Paste Gemini API key"
                className="flex-grow bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors shrink-0"
              >
                Save
              </button>
              {isReady && (
                <button
                  onClick={handleClearApiKey}
                  className="bg-red-100 hover:bg-red-200 text-red-600 font-bold text-[10px] py-2 px-2 rounded-lg transition-colors shrink-0"
                  title="Remove API key"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              Get a free key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-600">
                aistudio.google.com/apikey
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Capture Button */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <button
          onClick={handleCapture}
          disabled={isLoading || !isReady}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="13" r="3" strokeWidth="2.5" />
          </svg>
          <span>
            {isLoading ? 'Analyzing...' : authStatus === 'checking' ? 'Loading...' : isReady ? 'Capture I-Ready Screen' : 'Sign in first'}
          </span>
        </button>
      </div>

      {/* Screenshot Preview */}
      {lastScreenshot && (
        <div className="px-3 pt-2 shrink-0">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <img src={lastScreenshot} alt="Last captured screen" className="w-full h-20 object-cover object-top" />
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
            disabled={isLoading || !isReady}
            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !isReady}
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
