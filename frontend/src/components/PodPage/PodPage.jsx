import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PodNavbar from '../PodNavbar/PodNavbar';
import PodFooter from '../PodFooter/PodFooter';
import SyllabusChecklist from './SyllabusChecklist';
import SyllabusGraph from './SyllabusGraph';
import SlidePanel from '../SlidePanel/SlidePanel';
import SyllabusEditor from './SyllabusEditor';
import StudentInfoPanel from './StudentInfoPanel';
import Chatbot from '../Chat/Chatbot';
import PodChat from '../Chat/PodChat';
import PastLectures from './PastLectures';

const PodPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pod, setPod] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pod-info');
  const [syllabusViewMode, setSyllabusViewMode] = useState('graph');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingSyllabus, setIsSavingSyllabus] = useState(false);
  const [isStudentInfoOpen, setIsStudentInfoOpen] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pod info and syllabus in parallel
        const [podRes, syllabusRes] = await Promise.all([
          fetch(`/api/pods/${id}`),
          fetch(`/api/pods/${id}/syllabus`),
        ]);

        if (!podRes.ok) throw new Error('Pod not found');
        if (!syllabusRes.ok) throw new Error('Syllabus not found');

        const [podData, sylData] = await Promise.all([
          podRes.json(),
          syllabusRes.json(),
        ]);

        setPod(podData);
        setSyllabusData(sylData);
      } catch (err) {
        setError(err.message || 'Failed to load pod information.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Background save — fire and forget
  const handleToggle = useCallback((itemId, completed) => {
    fetch(`/api/pods/${id}/syllabus`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, completed }),
    }).catch(err => console.error('Failed to save completion state:', err));
  }, [id]);

  const handleSaveSyllabus = async (updatedSyllabus) => {
    setIsSavingSyllabus(true);
    try {
      const response = await fetch(`/api/pods/${id}/syllabus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSyllabus),
      });

      if (!response.ok) throw new Error('Failed to save syllabus changes');
      
      setSyllabusData(updatedSyllabus);
      setIsEditorOpen(false);
    } catch (err) {
      console.error('Error saving syllabus:', err);
      // Optional: Show error to user
    } finally {
      setIsSavingSyllabus(false);
    }
  };

  const handleSaveAttendance = async (updatedAttendance) => {
    setIsSavingAttendance(true);
    try {
      const response = await fetch(`/api/pods/${id}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAttendance),
      });

      if (!response.ok) throw new Error('Failed to save attendance changes');
      setIsStudentInfoOpen(false);
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-dark-slate flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-nexus-slate/30 border-t-nexus-bronze rounded-full animate-spin"></div>
          <p className="text-nexus-slate">Loading pod information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-nexus-dark-slate flex items-center justify-center">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-nexus-blue/30 border border-nexus-slate/30 rounded-xl text-nexus-porcelain hover:bg-nexus-blue/50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-dark-slate text-nexus-porcelain flex flex-col font-sans">
      <PodNavbar 
        pod={pod} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onStudentInfoClick={() => setIsStudentInfoOpen(true)}
      />

      <main className="flex-grow p-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-blue/10 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-nexus-bronze/5 blur-[100px] rounded-full -z-10"></div>

        {activeTab === 'nexus-ai' ? (
          /* ── Nexus AI Chatbot ── */
          <div className="max-w-5xl mx-auto">
            <Chatbot podId={id} />
          </div>
        ) : activeTab === 'pod-chat' ? (
          /* ── Pod Local Chat ── */
          <div className="max-w-5xl mx-auto">
            <PodChat podId={id} />
          </div>
        ) : (
          /* ── Pod Info / Syllabus ── */
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-nexus-bronze">Syllabus</h2>
                <div className="flex bg-nexus-blue/20 p-1 rounded-xl border border-nexus-slate/20 text-xs">
                  <button
                    onClick={() => setSyllabusViewMode('graph')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${syllabusViewMode === 'graph' ? 'bg-nexus-bronze text-[#1e293b]' : 'text-nexus-slate hover:text-white'}`}
                  >
                    Roadmap Graph
                  </button>
                  <button
                    onClick={() => setSyllabusViewMode('checklist')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${syllabusViewMode === 'checklist' ? 'bg-nexus-blue text-white' : 'text-nexus-slate hover:text-white'}`}
                  >
                    Checklist
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditorOpen(true)}
                className="p-2 rounded-xl text-nexus-slate hover:text-nexus-bronze hover:bg-nexus-blue/20 transition-all flex items-center space-x-2 border border-nexus-slate/10 hover:border-nexus-bronze/20 self-start sm:self-auto"
                title="Edit Syllabus"
              >
                <Pencil size={14} />
                <span className="text-xs font-bold">Edit Hierarchy</span>
              </button>
            </div>

            <div className="bg-nexus-blue/5 border border-nexus-slate/20 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative">
              {syllabusData && syllabusData.chapters ? (
                syllabusViewMode === 'graph' ? (
                  <SyllabusGraph chapters={syllabusData.chapters} onToggle={handleToggle} podId={id} />
                ) : (
                  <SyllabusChecklist chapters={syllabusData.chapters} onToggle={handleToggle} />
                )
              ) : (
                <p className="text-nexus-slate text-center py-8">No syllabus data available.</p>
              )}
            </div>

            {/* Past Lectures Section */}
            <div className="mt-12">
              <h2 className="text-sm font-bold uppercase tracking-widest text-nexus-bronze mb-6">Past Lecture Transcripts</h2>
              <PastLectures podId={id} />
            </div>
          </div>
        )}
      </main>

      <SlidePanel 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        title="Edit Syllabus Hierarchy"
      >
        <SyllabusEditor 
          initialData={syllabusData} 
          onSave={handleSaveSyllabus}
          isSaving={isSavingSyllabus}
        />
      </SlidePanel>

      {/* Student Info Panel */}
      <SlidePanel 
        isOpen={isStudentInfoOpen} 
        onClose={() => setIsStudentInfoOpen(false)} 
        title="Student Information & Attendance"
      >
        <StudentInfoPanel 
          podId={id}
          onSave={handleSaveAttendance}
          isSaving={isSavingAttendance}
        />
      </SlidePanel>

      <PodFooter />
    </div>
  );
};

export default PodPage;
