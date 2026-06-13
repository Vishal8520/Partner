import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SlidePanel = ({ isOpen, onClose, title, children }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Use double requestAnimationFrame to ensure the initial state (translate-x-full)
      // is painted by the browser before we trigger the transition.
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
        return () => cancelAnimationFrame(frame2);
      });
      return () => cancelAnimationFrame(frame1);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        onTransitionEnd={handleAnimationEnd}
        className={`relative w-full md:w-1/2 h-full bg-[#1e293b] border-l border-nexus-slate/20 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nexus-slate/20 bg-nexus-blue/5">
          <h2 className="text-xl font-bold text-nexus-porcelain tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-nexus-slate hover:text-nexus-porcelain hover:bg-nexus-blue/20 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-nexus-slate/20 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SlidePanel;
