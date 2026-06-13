import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronRight, Play, BookOpen, ListTree } from 'lucide-react';

export const LiveOutlineCard = ({ outline }) => {
    if (!outline || outline.length === 0) return null;

    return (
        <div className="bg-partner-dark-slate/40 border border-partner-slate/20 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-right duration-500 backdrop-blur-md">
             <div className="flex items-center space-x-3 mb-5">
                 <div className="p-2 bg-partner-blue/30 rounded-lg text-partner-porcelain shadow-sm border border-partner-blue/50">
                     <ListTree size={20} />
                 </div>
                 <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-partner-porcelain to-partner-slate">Live Outline</h3>
             </div>
             <div className="space-y-4 relative pl-2 pt-2 pb-2">
                 {/* Timeline connecting line */}
                 <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-partner-bronze/30 via-partner-slate/10 to-transparent z-0"></div>
                 
                 {outline.map((point, idx) => (
                     <div key={idx} className="relative z-10 flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-partner-dark-slate border-2 border-partner-slate/30 mt-0.5 shrink-0 flex items-center justify-center shadow-sm">
                              <div className="w-2.5 h-2.5 rounded-full bg-partner-bronze shadow-[0_0_8px_rgba(235,176,141,0.6)]"></div>
                          </div>
                          <p className="text-[15px] font-medium text-partner-porcelain/90 leading-relaxed pt-1.5">{point}</p>
                     </div>
                 ))}
             </div>
        </div>
    );
};

export const LiveQuizCard = ({ quizzes }) => {
  const [answers, setAnswers] = useState({});

  if (!quizzes || quizzes.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-partner-blue/10 to-partner-dark-slate border border-partner-slate/20 rounded-2xl p-6 shadow-xl animate-in slide-in-from-right duration-500 backdrop-blur-xl">
       <div className="flex items-center space-x-3 mb-6">
           <div className="p-2 bg-partner-bronze/20 rounded-lg text-partner-bronze">
               <Target size={20} />
           </div>
           <h3 className="text-xl font-bold text-partner-porcelain">Live Knowledge Check</h3>
           <span className="ml-auto text-xs font-semibold bg-partner-bronze text-partner-dark-slate px-2 py-1 rounded-full animate-pulse">NEW</span>
       </div>

       <div className="space-y-6">
           {quizzes.map((quiz, qIdx) => (
                <div key={qIdx} className="bg-partner-dark-slate/50 p-5 rounded-xl border border-partner-slate/10">
                    <p className="font-medium text-partner-porcelain/90 mb-4">{quiz.question}</p>
                    <div className="grid grid-cols-2 gap-3">
                        {quiz.options.map((opt, oIdx) => {
                            const isSelected = answers[qIdx] === opt;
                            const isCorrect = isSelected && opt === quiz.answer;
                            const isWrong = isSelected && opt !== quiz.answer;

                            return (
                                <button
                                    key={oIdx}
                                    onClick={() => !answers[qIdx] && setAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                    disabled={!!answers[qIdx]}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all text-left flex justify-between items-center ${
                                        isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                        isWrong ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                        isSelected ? 'bg-partner-blue/30 text-partner-porcelain border border-partner-blue/50' :
                                        'bg-partner-blue/5 text-partner-slate hover:bg-partner-blue/20 hover:text-partner-porcelain border border-transparent'
                                    }`}
                                >
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle2 size={16} />}
                                </button>
                            )
                        })}
                    </div>
                    {answers[qIdx] && (
                        <p className={`mt-3 text-sm flex items-center ${answers[qIdx] === quiz.answer ? 'text-emerald-400' : 'text-partner-slate'}`}>
                             {answers[qIdx] === quiz.answer ? 'Correct! Keep it up.' : `The correct answer was: ${quiz.answer}`}
                        </p>
                    )}
                </div>
           ))}
       </div>
    </div>
  );
};

export const SmartRecapCard = ({ recap }) => {
    if (!recap) return null;

    return (
        <div className="bg-gradient-to-tr from-[#0f172a] to-partner-blue/20 border border-partner-bronze/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
             {/* Sparkle background effects */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-partner-bronze/10 rounded-full blur-2xl pointer-events-none"></div>

             <div className="flex items-center space-x-3 mb-6 relative z-10">
                 <div className="p-2 bg-partner-bronze rounded-lg text-partner-dark-slate shadow-[0_0_15px_rgba(235,176,141,0.5)]">
                     <BookOpen size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-partner-porcelain">Session Recap Generated</h3>
             </div>

             <div className="relative z-10">
                 <p className="text-partner-porcelain/90 leading-relaxed text-lg bg-partner-dark-slate/40 p-5 rounded-xl border border-partner-slate/10 shadow-inner">
                     {recap}
                 </p>
                 <button className="mt-6 w-full py-3 bg-partner-blue/20 hover:bg-partner-blue/30 text-partner-porcelain rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 border border-partner-slate/20">
                      <span>Export Note & Publish to Workspace</span>
                      <ChevronRight size={18} />
                 </button>
             </div>
        </div>
    );
}

export const SimulationsCard = ({ simulations }) => {
    if (!simulations || simulations.length === 0) return null;

    return (
        <div className="bg-partner-blue/5 border border-partner-slate/20 rounded-2xl p-6 shadow-xl animate-in slide-in-from-right duration-500 backdrop-blur-md">
             <div className="flex items-center space-x-3 mb-6">
                 <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                     <Play size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-partner-porcelain">Recommended Simulations</h3>
             </div>

             <div className="space-y-4">
                 {simulations.map((sim, idx) => (
                     <a 
                        key={idx} 
                        href={sim.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-partner-dark-slate/60 hover:bg-partner-dark-slate border border-partner-slate/10 hover:border-purple-500/30 transition-all cursor-pointer group no-underline"
                     >
                          <div>
                              <h4 className="font-semibold text-partner-porcelain group-hover:text-purple-400 transition-colors">{sim.title}</h4>
                              <p className="text-xs text-partner-slate mt-1 uppercase tracking-wider">Click to open simulation ↗</p>
                          </div>
                          <div className="bg-partner-blue/20 p-2 rounded-lg text-partner-porcelain group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                               <Play size={16} fill="currentColor" />
                          </div>
                     </a>
                 ))}
             </div>
        </div>
    );
}
