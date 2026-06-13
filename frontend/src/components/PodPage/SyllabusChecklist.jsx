import React, { useState } from 'react';
import { Circle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';

const CheckItem = ({ checked, label, level, onClick }) => {
  const indent = level === 0 ? '' : level === 1 ? 'ml-6' : 'ml-12';
  const textSize = level === 0 ? 'text-base font-semibold' : level === 1 ? 'text-sm font-medium' : 'text-sm';
  const iconColor = checked ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-partner-slate/50';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left
        ${indent}
        ${checked
          ? 'bg-yellow-400/5 border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
          : 'bg-partner-blue/10 border border-partner-slate/10 hover:border-partner-bronze/20 hover:bg-partner-blue/15'
        }`}
    >
      {checked
        ? <CheckCircle2 size={level === 0 ? 20 : 16} className={`${iconColor} flex-shrink-0`} />
        : <Circle size={level === 0 ? 20 : 16} className={`${iconColor} flex-shrink-0`} />
      }
      <span className={`${textSize} ${checked ? 'text-yellow-400 font-medium line-through drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]' : 'text-partner-porcelain/90'}`}>
        {label}
      </span>
    </button>
  );
};

const SyllabusChecklist = ({ chapters, onToggle }) => {
  // Build initial checked state from the completed fields in the data
  const [checked, setChecked] = useState(() => {
    const initial = {};
    for (const ch of chapters) {
      initial[ch.id] = ch.completed;
      for (const topic of ch.topics || []) {
        initial[topic.id] = topic.completed;
        for (const sub of topic.subtopics || []) {
          initial[sub.id] = sub.completed;
        }
      }
    }
    return initial;
  });

  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    chapters.forEach(ch => { initial[ch.id] = true; });
    return initial;
  });

  const toggle = (id) => {
    const newVal = !checked[id];
    setChecked(prev => ({ ...prev, [id]: newVal }));
    // Fire background save — non-blocking
    onToggle(id, newVal);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = Object.keys(checked).length;
  const completedItems = Object.values(checked).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="mb-6 p-6 rounded-2xl bg-partner-blue/10 border border-partner-slate/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-partner-porcelain">Curriculum Progress</h3>
          <span className="text-2xl font-black text-partner-bronze">{progressPercent}%</span>
        </div>
        <div className="w-full bg-partner-dark-slate/50 h-3 rounded-full overflow-hidden shadow-inner border border-partner-slate/10">
          <div 
            className="bg-gradient-to-r from-partner-bronze to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(250,204,21,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-partner-slate mt-3 text-right">{completedItems} of {totalItems} modules mastered</p>
      </div>

      {chapters.map((chapter) => {
        const chapterExpanded = expanded[chapter.id] !== false;
        const allTopicsChecked = chapter.topics.length > 0 && chapter.topics.every(topic => {
          if (topic.subtopics.length === 0) return checked[topic.id];
          return topic.subtopics.every(sub => checked[sub.id]);
        });

        return (
          <div key={chapter.id} className="space-y-2">
            {/* Chapter Header */}
            <div className="flex items-center space-x-2">
              {chapter.topics.length > 0 && (
                <button
                  onClick={() => toggleExpand(chapter.id)}
                  className="p-1 rounded-lg hover:bg-partner-blue/20 text-partner-slate transition-all"
                >
                  {chapterExpanded
                    ? <ChevronDown size={16} />
                    : <ChevronRight size={16} />
                  }
                </button>
              )}
              <div className="flex-grow">
                <CheckItem
                  checked={allTopicsChecked && chapter.topics.length > 0}
                  label={chapter.name}
                  level={0}
                  onClick={() => {
                    if (chapter.topics.length === 0) toggle(chapter.id);
                  }}
                />
              </div>
            </div>

            {/* Topics */}
            {chapterExpanded && chapter.topics.map((topic) => {
              const topicExpanded = expanded[topic.id] !== false;
              const allSubsChecked = topic.subtopics.length > 0 && topic.subtopics.every(sub => checked[sub.id]);

              return (
                <div key={topic.id} className="space-y-1.5">
                  <div className="flex items-center space-x-2 ml-4">
                    {topic.subtopics.length > 0 && (
                      <button
                        onClick={() => toggleExpand(topic.id)}
                        className="p-1 rounded-lg hover:bg-partner-blue/20 text-partner-slate transition-all"
                      >
                        {topicExpanded
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />
                        }
                      </button>
                    )}
                    <div className="flex-grow">
                      <CheckItem
                        checked={topic.subtopics.length > 0 ? allSubsChecked : checked[topic.id]}
                        label={topic.name}
                        level={1}
                        onClick={() => {
                          if (topic.subtopics.length === 0) toggle(topic.id);
                        }}
                      />
                    </div>
                  </div>

                  {/* Subtopics */}
                  {topicExpanded && topic.subtopics.map((sub) => (
                    <div key={sub.id} className="ml-12">
                      <CheckItem
                        checked={!!checked[sub.id]}
                        label={sub.name}
                        level={2}
                        onClick={() => toggle(sub.id)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SyllabusChecklist;
