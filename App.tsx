
import React, { useState } from 'react';
import { ArchitectureType } from './types';
import { MOCK_PROBLEMS } from './constants';
import ProblemArea from './components/ProblemArea';
import TutorSidebar from './components/TutorSidebar';
import VisionSimulation from './components/VisionSimulation';

const App: React.FC = () => {
  const activeArch = ArchitectureType.MULTIMODAL_VISION;
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const currentProblem = MOCK_PROBLEMS[currentProblemIndex];

  const handleAnswer = (val: string) => {
    const isCorrect = val.trim() === currentProblem.correctAnswer;
    
    if (isCorrect) {
      alert("🎉 Great job! You solved it.");
      setCurrentProblemIndex((prev) => (prev + 1) % MOCK_PROBLEMS.length);
    } else {
      alert("Not quite! Take another look at the diagram or ask your AI tutor for a hint.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-inter text-slate-900 overflow-hidden">
      {/* Simulation workspace mimics a Chromebook screen */}
      <div className="flex-grow flex p-6 gap-6 max-w-[1600px] mx-auto w-full h-[calc(100vh-40px)]">
        
        {/* Main Application Area (I-Ready Simulation) */}
        <div className="flex-grow relative h-full">
          <div className="h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-200/50 flex flex-col">
            {/* Native-looking I-Ready Header */}
            <div className="bg-[#2d3e50] p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold">i</div>
                <span className="font-bold text-sm tracking-tight">I-Ready Personalized Instruction</span>
              </div>
              <div className="flex space-x-4 text-[10px] font-bold uppercase">
                <span className="text-orange-400">Math</span>
                <span className="opacity-50">Reading</span>
              </div>
            </div>

            <div className="flex-grow relative overflow-hidden">
              <VisionSimulation isActive={activeArch === ArchitectureType.MULTIMODAL_VISION} />
              <ProblemArea problem={currentProblem} onAnswerSubmit={handleAnswer} />
            </div>
          </div>
        </div>

        {/* Extension Sidepanel (Architecture 2) */}
        <div className="w-[400px] h-full animate-in slide-in-from-right-12 duration-500">
          <div className="h-full flex flex-col">
            <div className="mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chrome Extension View</span>
              <div className="flex space-x-1">
                 <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                 <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                 <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              </div>
            </div>
            <TutorSidebar currentProblem={currentProblem} activeArch={activeArch} />
          </div>
        </div>
      </div>

      {/* Chromebook OS Shelf Simulation */}
      <footer className="bg-[#1c2b39] h-10 px-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-white/5">
        <div className="flex items-center space-x-6">
           <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
             <div className="w-3 h-3 bg-white/40 rounded-full"></div>
           </div>
           <span>Chromebook Hub</span>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-blue-400">AI Sidepanel Active</span>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
