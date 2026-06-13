import React, { useState } from 'react';
import { BookOpen, GraduationCap, ChevronRight, Trash2, X, AlertTriangle } from 'lucide-react';

const PodCard = ({ pod, onClick, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click navigation
    setShowModal(true);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pods/${pod.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete pod');
      setShowModal(false);
      if (onDelete) onDelete(pod.id);
    } catch (err) {
      console.error('Delete failed:', err);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group bg-partner-blue/10 border border-partner-slate/20 rounded-2xl p-6 backdrop-blur-sm hover:border-partner-bronze/40 hover:bg-partner-blue/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-partner-bronze/5 blur-3xl group-hover:bg-partner-bronze/10 transition-colors"></div>

        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-partner-bronze/20 rounded-xl flex items-center justify-center text-partner-bronze">
              <GraduationCap size={20} />
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-partner-blue/30 border border-partner-slate/40 rounded-full text-[10px] font-bold tracking-widest text-partner-slate group-hover:text-partner-bronze transition-colors">
                SEM {pod.semester}
              </div>
              <button
                onClick={handleDeleteClick}
                className="relative z-10 p-1.5 rounded-lg hover:bg-red-500/15 border border-transparent hover:border-red-500/30 text-partner-slate/50 hover:text-red-400 transition-all duration-200"
                title="Delete Pod"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-partner-porcelain group-hover:text-partner-bronze transition-colors line-clamp-1">
              {pod.subject}
            </h3>
            <p className="text-sm text-partner-slate mt-1 line-clamp-2 italic">
              {pod.syllabus}
            </p>
          </div>

          <div className="pt-4 mt-auto flex flex-col border-t border-partner-slate/10 gap-2">
            <div className="flex items-center justify-between text-xs text-partner-slate w-full">
              <span className="flex items-center"><BookOpen size={14} className="mr-1" /> Syllabus Progress</span>
              <span className="font-bold text-partner-bronze">{pod.progress || 0}%</span>
            </div>
            <div className="w-full bg-partner-blue/30 h-1.5 rounded-full overflow-hidden">
               <div 
                 className="bg-gradient-to-r from-partner-bronze to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${pod.progress || 0}%` }}
               ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-[#2a3640] border border-partner-slate/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-partner-porcelain">Delete Pod</h3>
                <p className="text-xs text-partner-slate">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-partner-slate mb-6">
              Are you sure you want to delete <span className="text-partner-porcelain font-semibold">"{pod.subject}"</span>? All associated syllabus data will be permanently removed.
            </p>

            <div className="flex items-center space-x-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm rounded-xl bg-partner-blue/20 border border-partner-slate/30 text-partner-porcelain hover:bg-partner-blue/40 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm rounded-xl font-bold transition-all ${
                  isDeleting
                    ? 'bg-red-500/30 text-red-300 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PodCard;
