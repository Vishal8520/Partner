import React, { useState, useEffect } from 'react';
import { Check, BookOpen, Star, HelpCircle, Sparkles, Trophy } from 'lucide-react';

const SyllabusGraph = ({ chapters, onToggle, podId }) => {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?.id || null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  
  // Update selection if chapters load/change
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  // Find currently selected chapter
  const activeChapter = chapters.find(ch => ch.id === selectedChapterId);

  // Automatically select the first topic of the selected chapter
  useEffect(() => {
    if (activeChapter && activeChapter.topics && activeChapter.topics.length > 0) {
      setSelectedTopicId(activeChapter.topics[0].id);
    } else {
      setSelectedTopicId(null);
    }
  }, [selectedChapterId, activeChapter]);

  // Find currently selected topic
  const activeTopic = activeChapter?.topics.find(t => t.id === selectedTopicId);

  // Completion percentages for status ring calculation
  const getChapterProgress = (ch) => {
    if (!ch.topics || ch.topics.length === 0) return ch.completed ? 100 : 0;
    let total = 0;
    let completed = 0;
    ch.topics.forEach(t => {
      total += 1;
      if (t.completed) completed += 1;
      if (t.subtopics) {
        t.subtopics.forEach(s => {
          total += 1;
          if (s.completed) completed += 1;
        });
      }
    });
    return Math.round((completed / total) * 100);
  };

  const handleToggleItem = (itemId, currentCompleted) => {
    onToggle(itemId, !currentCompleted);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-partner-porcelain flex items-center gap-2">
            <Trophy size={18} className="text-partner-bronze" /> Visual Syllabus Roadmap
          </h3>
          <p className="text-xs text-partner-slate">
            Click chapters and topics to navigate and track details. Glowing green nodes represent completed items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[450px]">
        {/* SVG Bezier Connectors behind elements */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="w-full h-full" style={{ minHeight: '450px' }}>
            {/* Draw curve from Chapter Column to Topic Column */}
            <path
              d="M 280 150 C 330 150, 310 220, 360 220"
              fill="none"
              stroke="#364C5F"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-40 animate-[dash_20s_linear_infinite]"
            />
            {/* Draw curve from Topic Column to Subtopics Column */}
            <path
              d="M 600 220 C 650 220, 630 180, 680 180"
              fill="none"
              stroke="#EABC6A"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-30"
            />
          </svg>
        </div>

        {/* 1. CHAPTERS COLUMN */}
        <div className="space-y-4 z-10">
          <h4 className="text-xs font-bold text-partner-bronze uppercase tracking-wider mb-2 flex items-center gap-1">
            <BookOpen size={12} /> Chapters
          </h4>
          <div className="space-y-3">
            {chapters.map((ch) => {
              const isActive = ch.id === selectedChapterId;
              const progress = getChapterProgress(ch);
              const isCompleted = progress === 100 || ch.completed;

              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-sm
                    ${isActive 
                      ? 'bg-partner-blue/30 border-partner-bronze/60 shadow-[0_0_15px_rgba(234,188,106,0.15)] scale-[1.02]' 
                      : 'bg-white/5 border-white/10 hover:bg-partner-blue/10'}
                    ${isCompleted ? 'border-emerald-500/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 truncate pr-2">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-partner-porcelain' : 'text-partner-slate'}`}>
                        {ch.name}
                      </p>
                      <p className="text-[10px] text-partner-slate/60 font-mono">
                        Progress: {progress}%
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(ch.id, ch.completed);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0
                        ${ch.completed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-white/5 text-partner-slate/40 border border-white/10 hover:bg-white/10'}`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 rounded-full h-1 mt-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-400' : 'bg-partner-bronze'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TOPICS COLUMN */}
        <div className="space-y-4 z-10">
          <h4 className="text-xs font-bold text-partner-bronze uppercase tracking-wider mb-2 flex items-center gap-1">
            <Star size={12} /> Topics
          </h4>
          
          {activeChapter && activeChapter.topics && activeChapter.topics.length > 0 ? (
            <div className="space-y-3">
              {activeChapter.topics.map((topic) => {
                const isActive = topic.id === selectedTopicId;
                const isCompleted = topic.completed;

                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-sm
                      ${isActive 
                        ? 'bg-partner-blue/30 border-partner-bronze/60 shadow-[0_0_15px_rgba(234,188,106,0.15)] scale-[1.02]' 
                        : 'bg-white/5 border-white/10 hover:bg-partner-blue/10'}
                      ${isCompleted ? 'border-emerald-500/30' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-partner-porcelain' : 'text-partner-slate'}`}>
                        {topic.name}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItem(topic.id, topic.completed);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0
                          ${topic.completed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-white/5 text-partner-slate/40 border border-white/10 hover:bg-white/10'}`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-partner-slate/60 text-xs">
              Select a chapter to explore topics.
            </div>
          )}
        </div>

        {/* 3. SUBTOPICS & STUDY HELPER COLUMN */}
        <div className="space-y-4 z-10">
          <h4 className="text-xs font-bold text-partner-bronze uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle size={12} /> Subtopics & AI Prompts
          </h4>

          {activeTopic ? (
            <div className="space-y-4">
              {/* List of Subtopics */}
              {activeTopic.subtopics && activeTopic.subtopics.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[11px] font-bold text-partner-slate uppercase tracking-wider mb-1">Subtopics Checklist</p>
                  <div className="space-y-2">
                    {activeTopic.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleItem(sub.id, sub.completed)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-white/5
                          ${sub.completed ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-white/5 bg-transparent text-partner-slate'}`}
                      >
                        <span className="text-xs font-medium truncate pr-2">{sub.name}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all
                          ${sub.completed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-white/20 text-transparent'}`}
                        >
                          <Check size={10} strokeWidth={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-partner-slate/50 italic">
                  No subtopics listed for this topic.
                </div>
              )}

              {/* Study Assistant Quick Prompts */}
              <div className="bg-gradient-to-br from-partner-bronze/10 to-transparent border border-partner-bronze/20 rounded-3xl p-5 space-y-3 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-16 h-16 bg-partner-bronze/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center space-x-2 text-partner-bronze">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Tutor AI Helper</span>
                </div>
                <p className="text-xs text-partner-porcelain/90 leading-relaxed font-light">
                  Copy these prompts and ask the AI chatbot to get personalized training on this topic:
                </p>
                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(`Explain the concept of '${activeTopic.name}' in simple terms with an analogy.`);
                      alert("Prompt copied to clipboard!");
                    }}
                    className="p-2 bg-partner-dark-slate/40 border border-partner-slate/20 rounded-xl text-xs text-partner-slate hover:text-partner-porcelain hover:bg-partner-dark-slate/60 cursor-pointer transition-colors truncate font-mono select-none"
                  >
                    "Explain '{activeTopic.name}' with analogy"
                  </div>
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(`Give me a 5-question practice quiz about '${activeTopic.name}' with detailed answer justifications.`);
                      alert("Prompt copied to clipboard!");
                    }}
                    className="p-2 bg-partner-dark-slate/40 border border-partner-slate/20 rounded-xl text-xs text-partner-slate hover:text-partner-porcelain hover:bg-partner-dark-slate/60 cursor-pointer transition-colors truncate font-mono select-none"
                  >
                    "Practice quiz for '{activeTopic.name}'"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-partner-slate/60 text-xs">
              Select a topic to study with AI.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusGraph;
