import React, { useState, useEffect } from 'react';
import { Video, ChevronDown, ChevronUp, FileText, Calendar, Sparkles } from 'lucide-react';

const PastLectures = ({ podId }) => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:8000'
          : '';
        const response = await fetch(`${baseUrl}/api/pods/${podId}/transcripts`);
        if (!response.ok) throw new Error('Failed to fetch past lectures');
        const data = await response.json();
        // Sort transcripts by date descending
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTranscripts(data);
      } catch (err) {
        console.error('Error fetching transcripts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, [podId]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-partner-slate/30 border-t-partner-bronze rounded-full animate-spin mr-3"></div>
        <p className="text-sm text-partner-slate">Loading past lectures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400 text-sm">
        Failed to load past lectures: {error}
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="py-12 bg-partner-blue/5 border border-partner-slate/10 rounded-2xl text-center text-partner-slate">
        <Video size={36} className="mx-auto mb-3 opacity-40 text-partner-slate" />
        <p className="text-sm font-medium">No past live lecture recordings found</p>
        <p className="text-xs mt-1 opacity-70">Completed live sessions will save recaps and transcripts here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcripts.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <div 
            key={item.id}
            className="bg-partner-blue/5 border border-partner-slate/20 rounded-2xl p-5 backdrop-blur-md hover:border-partner-slate/35 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-partner-bronze/10 border border-partner-bronze/35 flex items-center justify-center text-partner-bronze flex-shrink-0 mt-0.5">
                  <Video size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-partner-porcelain text-base leading-snug">{item.class_title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-partner-slate mt-1">
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {item.date}
                    </span>
                    {item.schedule_id && (
                      <span className="px-2 py-0.5 bg-partner-blue/20 rounded-full border border-partner-blue/30 text-partner-porcelain text-[10px]">
                        Linked Class
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-1.5 rounded-lg bg-partner-blue/10 border border-partner-slate/10 hover:border-partner-bronze/20 text-partner-slate hover:text-partner-porcelain transition-all"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Recap Section */}
            {item.recap && (
              <div className="mt-4 pl-1">
                <h4 className="text-xs font-bold text-partner-bronze tracking-wider uppercase flex items-center mb-2">
                  <Sparkles size={12} className="mr-1" /> Lecture Recap & Key Concepts
                </h4>
                <div className="text-sm text-partner-porcelain/90 bg-partner-blue/10 border border-partner-slate/10 rounded-xl p-3.5 leading-relaxed font-sans whitespace-pre-line">
                  {item.recap}
                </div>
              </div>
            )}

            {/* Full Transcript Section (Expandable) */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-partner-slate/15 animate-fadeIn">
                <h4 className="text-xs font-bold text-partner-slate tracking-wider uppercase flex items-center mb-2 pl-1">
                  <FileText size={12} className="mr-1" /> Full Speech Transcript
                </h4>
                <div className="text-xs font-mono text-partner-slate/90 bg-partner-dark-slate/60 border border-partner-slate/15 rounded-xl p-4 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                  {item.transcript ? item.transcript : "No transcription text captured for this class."}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PastLectures;
