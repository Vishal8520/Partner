import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, MoveUp, MoveDown } from 'lucide-react';

const SyllabusEditor = ({ initialData, onSave, isSaving }) => {
  const [data, setData] = useState({ chapters: [] });

  useEffect(() => {
    if (initialData && initialData.chapters) {
      setData(JSON.parse(JSON.stringify(initialData))); // Deep clone
    }
  }, [initialData]);

  const updateChapter = (chIdx, name) => {
    const newData = { ...data };
    newData.chapters[chIdx].name = name;
    setData(newData);
  };

  const addChapter = () => {
    const newData = { ...data };
    const newIdx = newData.chapters.length;
    newData.chapters.push({
      id: `ch-${newIdx}-${Date.now()}`,
      name: 'New Chapter',
      completed: false,
      topics: []
    });
    setData(newData);
  };

  const removeChapter = (chIdx) => {
    const newData = { ...data };
    newData.chapters.splice(chIdx, 1);
    setData(newData);
  };

  const addTopic = (chIdx) => {
    const newData = { ...data };
    const tIdx = newData.chapters[chIdx].topics.length;
    newData.chapters[chIdx].topics.push({
      id: `ch-${chIdx}-t-${tIdx}-${Date.now()}`,
      name: 'New Topic',
      completed: false,
      subtopics: []
    });
    setData(newData);
  };

  const updateTopic = (chIdx, tIdx, name) => {
    const newData = { ...data };
    newData.chapters[chIdx].topics[tIdx].name = name;
    setData(newData);
  };

  const removeTopic = (chIdx, tIdx) => {
    const newData = { ...data };
    newData.chapters[chIdx].topics.splice(tIdx, 1);
    setData(newData);
  };

  const addSubtopic = (chIdx, tIdx) => {
    const newData = { ...data };
    const sIdx = newData.chapters[chIdx].topics[tIdx].subtopics.length;
    newData.chapters[chIdx].topics[tIdx].subtopics.push({
      id: `ch-${chIdx}-t-${tIdx}-s-${sIdx}-${Date.now()}`,
      name: 'New Subtopic',
      completed: false
    });
    setData(newData);
  };

  const updateSubtopic = (chIdx, tIdx, sIdx, name) => {
    const newData = { ...data };
    newData.chapters[chIdx].topics[tIdx].subtopics[sIdx].name = name;
    setData(newData);
  };

  const removeSubtopic = (chIdx, tIdx, sIdx) => {
    const newData = { ...data };
    newData.chapters[chIdx].topics[tIdx].subtopics.splice(sIdx, 1);
    setData(newData);
  };

  return (
    <div className="space-y-8 pb-32 pb-40">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-nexus-slate italic">Edit your pod syllabus hierarchy below.</p>
        <button 
          onClick={addChapter}
          className="flex items-center space-x-2 px-4 py-2 bg-nexus-blue/20 border border-nexus-blue/30 rounded-xl text-nexus-bronze hover:bg-nexus-blue/30 transition-all text-sm font-bold"
        >
          <Plus size={16} />
          <span>Add Chapter</span>
        </button>
      </div>

      <div className="space-y-10">
        {data.chapters.map((chapter, chIdx) => (
          <div key={chapter.id} className="p-6 bg-nexus-blue/5 border border-nexus-slate/10 rounded-2xl space-y-4 relative group">
            <div className="flex items-center space-x-4">
              <span className="text-nexus-bronze font-bold min-w-[3rem]">CH {chIdx + 1}</span>
              <input 
                value={chapter.name}
                onChange={(e) => updateChapter(chIdx, e.target.value)}
                className="flex-grow bg-nexus-blue/10 border border-nexus-slate/20 rounded-xl px-4 py-2 text-nexus-porcelain focus:border-nexus-bronze/50 focus:outline-none transition-all font-semibold"
                placeholder="Chapter Name"
              />
              <button 
                onClick={() => removeChapter(chIdx)}
                className="p-2 text-nexus-slate hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="ml-8 space-y-6 border-l-2 border-nexus-slate/10 pl-6">
              {chapter.topics.map((topic, tIdx) => (
                <div key={topic.id} className="space-y-3 relative group/topic">
                  <div className="flex items-center space-x-3">
                    <input 
                      value={topic.name}
                      onChange={(e) => updateTopic(chIdx, tIdx, e.target.value)}
                      className="flex-grow bg-nexus-blue/10 border border-nexus-slate/20 rounded-xl px-4 py-2 text-sm text-nexus-porcelain focus:border-nexus-bronze/50 focus:outline-none transition-all placeholder:text-nexus-slate/30"
                      placeholder="Topic Name"
                    />
                    <button 
                      onClick={() => removeTopic(chIdx, tIdx)}
                      className="p-1.5 text-nexus-slate/50 hover:text-red-400 opacity-0 group-hover/topic:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="ml-4 space-y-2">
                    {topic.subtopics.map((sub, sIdx) => (
                      <div key={sub.id} className="flex items-center space-x-2 group/sub">
                        <div className="w-2 h-2 rounded-full bg-nexus-bronze/30 flex-shrink-0" />
                        <input 
                          value={sub.name}
                          onChange={(e) => updateSubtopic(chIdx, tIdx, sIdx, e.target.value)}
                          className="flex-grow bg-transparent border-b border-nexus-slate/20 px-2 py-1 text-xs text-nexus-slate focus:border-nexus-bronze/50 focus:outline-none transition-all placeholder:text-nexus-slate/30"
                          placeholder="Subtopic Name"
                        />
                        <button 
                          onClick={() => removeSubtopic(chIdx, tIdx, sIdx)}
                          className="p-1 text-nexus-slate/30 hover:text-red-400 opacity-0 group-hover/sub:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addSubtopic(chIdx, tIdx)}
                      className="text-[10px] font-bold text-nexus-slate/60 hover:text-nexus-bronze flex items-center space-x-1 transition-all ml-4"
                    >
                      <Plus size={10} />
                      <span>Add Subtopic</span>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => addTopic(chIdx)}
                className="text-xs font-bold text-nexus-bronze/60 hover:text-nexus-bronze flex items-center space-x-1 transition-all"
              >
                <Plus size={12} />
                <span>Add Topic</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Save Action */}
      <div className="fixed bottom-0 right-0 w-full md:w-1/2 p-6 bg-gradient-to-t from-[#1e293b] via-[#1e293b] to-transparent z-10 border-l border-nexus-slate/20">
        <button 
          onClick={() => onSave(data)}
          disabled={isSaving}
          className={`w-full py-4 rounded-2xl bg-nexus-bronze text-[#1e293b] font-bold flex items-center justify-center space-x-3 shadow-lg shadow-nexus-bronze/20 hover:scale-[1.02] active:scale-[0.98] transition-all
            ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-nexus-dark-slate border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          <span>{isSaving ? 'Saving Changes...' : 'Save Syllabus'}</span>
        </button>
      </div>
    </div>
  );
};

export default SyllabusEditor;
