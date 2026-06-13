import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Sparkles, Hash, Radio, MessageSquare } from 'lucide-react';

const PodNavbar = ({ pod, activeTab, onTabChange, onStudentInfoClick }) => {
  const navigate = useNavigate();
  const tabs = [
    { id: 'pod-info', label: 'Pod Info', icon: BookOpen },
    { id: 'partner-ai', label: 'Partner AI', icon: Sparkles },
    { id: 'pod-chat', label: 'Pod Chat', icon: MessageSquare },
  ];

  return (
    <nav className="h-16 border-b border-partner-slate/20 flex items-center justify-between px-8 bg-partner-blue/10 backdrop-blur-md sticky top-0 z-10">
      {/* Left — Semester, Subject & Pod ID */}
      <div className="flex items-center space-x-4">
        <div className="px-3 py-1 bg-partner-bronze/20 border border-partner-bronze/30 rounded-full text-xs font-bold tracking-widest text-partner-bronze">
          SEM {pod.semester}
        </div>
        <h1 className="text-lg font-bold text-partner-porcelain tracking-tight">{pod.subject}</h1>
        <div className="hidden sm:flex items-center space-x-1.5 text-partner-slate text-xs">
          <Hash size={12} />
          <span className="font-mono">{pod.id}</span>
        </div>
      </div>

      {/* Right — Tab Buttons */}
      <div className="flex items-center space-x-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === id
                ? 'bg-partner-bronze/20 text-partner-bronze border border-partner-bronze/30'
                : 'text-partner-slate hover:text-partner-porcelain hover:bg-partner-blue/20'
              }`}
          >
            <Icon size={16} />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}

        {/* Student Info — Opens Slide Panel */}
        <button
          onClick={onStudentInfoClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-partner-slate hover:text-partner-porcelain hover:bg-partner-blue/20 transition-all duration-200"
        >
          <Users size={16} />
          <span className="hidden md:inline">Student Info</span>
        </button>

        {/* Live Session — distinct style */}
        <button 
          onClick={() => navigate(`/live-session?podId=${pod.id}`)}
          className="px-6 py-2 bg-gradient-to-r from-partner-bronze to-partner-porcelain/80 text-partner-dark-slate font-bold rounded-lg hover:shadow-[0_0_20px_rgba(235,176,141,0.4)] transition-all text-sm shadow-lg shadow-partner-bronze/10 flex items-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="hidden md:inline">Start Live Session</span>
        </button>
      </div>
    </nav>
  );
};

export default PodNavbar;
