import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';

const PodFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="h-14 border-t border-nexus-slate/20 flex items-center justify-between px-8 bg-nexus-blue/10 backdrop-blur-md">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 px-5 py-2 bg-nexus-blue/20 border border-nexus-slate/30 rounded-xl text-sm text-nexus-porcelain hover:bg-nexus-blue/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <ChevronLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <button
        onClick={() => navigate('/create-pod')}
        className="flex items-center space-x-2 px-5 py-2 bg-nexus-bronze text-nexus-dark-slate font-bold rounded-xl text-sm transition-all shadow-lg shadow-nexus-bronze/10 hover:bg-nexus-bronze/90 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={16} />
        <span>Create Another Pod</span>
      </button>
    </footer>
  );
};

export default PodFooter;
