import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';

const PodFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="h-14 border-t border-partner-slate/20 flex items-center justify-between px-8 bg-partner-blue/10 backdrop-blur-md">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 px-5 py-2 bg-partner-blue/20 border border-partner-slate/30 rounded-xl text-sm text-partner-porcelain hover:bg-partner-blue/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <ChevronLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <button
        onClick={() => navigate('/create-pod')}
        className="flex items-center space-x-2 px-5 py-2 bg-partner-bronze text-partner-dark-slate font-bold rounded-xl text-sm transition-all shadow-lg shadow-partner-bronze/10 hover:bg-partner-bronze/90 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={16} />
        <span>Create Another Pod</span>
      </button>
    </footer>
  );
};

export default PodFooter;
