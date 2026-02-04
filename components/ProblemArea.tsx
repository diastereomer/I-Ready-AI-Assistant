
import React from 'react';
import { Problem, GeometryShape } from '../types';

interface ProblemAreaProps {
  problem: Problem;
  onAnswerSubmit: (val: string) => void;
}

const ShapeRenderer: React.FC<{ shape: GeometryShape }> = ({ shape }) => {
  if (shape.type === 'triangle') {
    return (
      <div className="relative w-72 h-72 flex items-center justify-center bg-white rounded-full shadow-inner border-8 border-slate-50">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl p-8">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <path d="M 20 80 L 85 80 L 20 15 Z" fill="none" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Labels */}
          <text x="50" y="92" fontSize="9" className="font-black fill-slate-700">b = 4 cm</text>
          <text x="4" y="50" fontSize="9" className="font-black fill-slate-700" transform="rotate(-90 4 50)">a = 3 cm</text>
          <text x="60" y="45" fontSize="10" className="font-black fill-orange-500 italic">c = ?</text>
          
          {/* Right angle symbol */}
          <rect x="20" y="70" width="10" height="10" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
  return null;
};

const ProblemArea: React.FC<ProblemAreaProps> = ({ problem, onAnswerSubmit }) => {
  const [input, setInput] = React.useState('');

  return (
    <div id="i-ready-content" className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-12 h-full border-b-[12px] border-slate-200 flex flex-col relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
      
      {/* Simulation Header */}
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {problem.subject[0]}
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Mathematics</span>
            <span className="block text-sm font-bold text-slate-700">Level G / Geometry Exploration</span>
          </div>
        </div>
        <div className="bg-slate-100 px-6 py-2 rounded-2xl border border-slate-200">
           <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">Progress: 14 / 20</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-slate-800 leading-tight mb-4">
            {problem.question}
          </h2>
          <div className="h-1.5 w-24 bg-orange-400 rounded-full mx-auto"></div>
        </div>
        
        {/* Shape Display Area */}
        {problem.shapes && problem.shapes.length > 0 && (
          <div className="mb-12 relative">
            {problem.shapes.map((s, i) => <ShapeRenderer key={i} shape={s} />)}
            {/* Visual Hint Indicator */}
            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
              <span className="text-2xl">📐</span>
            </div>
          </div>
        )}
        
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="relative w-full">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnswerSubmit(input)}
              placeholder="Type answer..."
              className="w-full text-3xl p-6 border-b-8 border-slate-100 focus:border-blue-400 outline-none text-center font-fredoka transition-all bg-slate-50/50 rounded-3xl"
            />
          </div>
          <button 
            onClick={() => {
              onAnswerSubmit(input);
              setInput('');
            }}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-5 px-12 rounded-[2rem] shadow-[0_10px_0_rgb(37,99,235)] active:shadow-none active:translate-y-[10px] transition-all"
          >
            Submit Answer
          </button>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>© Curriculum Associates</span>
        <div className="flex space-x-4">
          <button className="hover:text-blue-500 transition-colors">Tools</button>
          <button className="hover:text-blue-500 transition-colors">Glossary</button>
          <button className="hover:text-blue-500 transition-colors">Help</button>
        </div>
      </div>
    </div>
  );
};

export default ProblemArea;
