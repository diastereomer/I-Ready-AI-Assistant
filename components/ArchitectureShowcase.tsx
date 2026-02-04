import React from 'react';
import { ARCHITECTURES } from '../constants';
import { ArchitectureType } from '../types';

interface ArchitectureShowcaseProps {
  selected: ArchitectureType;
  onSelect: (type: ArchitectureType) => void;
}

const ArchitectureShowcase: React.FC<ArchitectureShowcaseProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ARCHITECTURES.map((arch) => (
          <button
            key={arch.id}
            onClick={() => onSelect(arch.id)}
            className={`p-6 rounded-3xl text-left transition-all border-4 ${
              selected === arch.id 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl scale-[1.02]' 
                : 'bg-white text-gray-600 border-transparent hover:border-indigo-100 shadow-md'
            }`}
          >
            <h4 className="font-fredoka font-bold text-lg mb-2">{arch.title}</h4>
            <p className={`text-xs ${selected === arch.id ? 'text-indigo-100' : 'text-gray-400'}`}>
              {arch.description}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h5 className="text-indigo-900 font-fredoka font-bold text-xl mb-4">How it works</h5>
            <p className="text-indigo-700 text-sm mb-6 leading-relaxed">
              {ARCHITECTURES.find(a => a.id === selected)?.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Key Benefits</span>
                <ul className="text-xs text-indigo-800 space-y-2">
                  {ARCHITECTURES.find(a => a.id === selected)?.benefits.map((b, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">✨</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Tech Stack</span>
                <div className="flex flex-wrap gap-2">
                  {ARCHITECTURES.find(a => a.id === selected)?.techStack.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-200/50 rounded-lg text-[10px] font-bold text-indigo-600 uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 flex items-center justify-center">
             <div className="relative">
                <div className="w-32 h-32 bg-indigo-400 rounded-full animate-pulse absolute -top-4 -left-4 opacity-20"></div>
                <div className="w-32 h-32 bg-indigo-200 rounded-3xl rotate-12 flex items-center justify-center text-4xl shadow-inner relative z-10">
                   {/* Fix: Property 'SIDEBAR_OVERLAY' and 'PROACTIVE_MODAL' do not exist on ArchitectureType. 
                       Mapped to CHROME_EXTENSION, ACCESSIBILITY_BRIDGE, and fallback to MULTIMODAL_VISION. */}
                   {selected === ArchitectureType.CHROME_EXTENSION ? '💬' : selected === ArchitectureType.ACCESSIBILITY_BRIDGE ? '🎯' : '👀'}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureShowcase;