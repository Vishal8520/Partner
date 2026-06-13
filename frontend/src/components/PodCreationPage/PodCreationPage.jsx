import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, BookOpen, FileText, Save } from 'lucide-react';

const PodCreationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    semester: '1',
    subject: '',
    syllabus: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    // Basic Validation
    if (!formData.subject.trim() || !formData.syllabus.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields before saving.' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/pods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          semester: parseInt(formData.semester)
        }),
      });

      if (!response.ok) throw new Error('Failed to save Pod info');

      const savedPod = await response.json();
      setMessage({ type: 'success', text: 'Pod info saved successfully! Redirecting...' });
      setTimeout(() => navigate(`/pod/${savedPod.id}`), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-partner-dark-slate text-partner-porcelain flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-partner-slate/20 flex items-center justify-between px-8 bg-partner-blue/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-partner-blue/20 text-partner-slate hover:text-partner-porcelain transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Create New Pod</h1>
        </div>
        <div className="flex items-center space-x-2 text-partner-slate text-sm">
          <span>Teacher Mode</span>
          <div className="w-2 h-2 rounded-full bg-partner-bronze"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-partner-blue/10 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-partner-bronze/5 blur-[100px] rounded-full -z-10"></div>

        <div className="max-w-4xl w-full bg-partner-blue/5 border border-partner-slate/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left side - Info/Visual */}
            <div className="hidden md:flex flex-col justify-center space-y-8 pr-8 border-r border-partner-slate/10">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-partner-bronze/20 rounded-2xl flex items-center justify-center text-partner-bronze">
                  <GraduationCap size={28} />
                </div>
                <h2 className="text-3xl font-bold leading-tight">Define Your <br /><span className="text-partner-bronze">Learning Environment</span></h2>
                <p className="text-partner-slate">Provide the essential details about your class to help Partner tailor the educational experience for your students.</p>
              </div>

              <div className="space-y-6">
                 <div className="flex items-start space-x-4">
                    <div className="mt-1 text-partner-bronze"><BookOpen size={20} /></div>
                    <div>
                      <h4 className="font-semibold">Structured Curriculum</h4>
                      <p className="text-sm text-partner-slate">Sync subjects across semesters seamlessly.</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-4">
                    <div className="mt-1 text-partner-bronze"><FileText size={20} /></div>
                    <div>
                      <h4 className="font-semibold">AI Syllabus Integration</h4>
                      <p className="text-sm text-partner-slate">Upload content for automatic material generation.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Semester Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-partner-slate block">Which class are you going to teach?</label>
                  <div className="relative group">
                    <select 
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full bg-partner-blue/20 border border-partner-slate/30 rounded-xl px-4 py-3 text-partner-porcelain outline-none focus:border-partner-bronze/50 transition-all appearance-none cursor-pointer"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i+1} value={i+1} className="bg-partner-dark-slate text-partner-porcelain">
                          Semester {i+1}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-partner-slate group-focus-within:text-partner-bronze transition-colors">
                      <ChevronLeft className="-rotate-90" size={18} />
                    </div>
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-partner-slate block">What subject will you be teaching to this class?</label>
                  <input 
                    type="text"
                    name="subject"
                    placeholder="e.g. Advanced Thermodynamics"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-partner-blue/20 border border-partner-slate/30 rounded-xl px-4 py-3 text-partner-porcelain outline-none focus:border-partner-bronze/50 transition-all placeholder:text-partner-slate/50"
                  />
                </div>

                {/* Syllabus Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-partner-slate block">What is the syllabus of this class?</label>
                  <textarea 
                    name="syllabus"
                    rows="5"
                    placeholder="Describe the topics, milestones, and learning objectives..."
                    value={formData.syllabus}
                    onChange={handleChange}
                    className="w-full bg-partner-blue/20 border border-partner-slate/30 rounded-xl px-4 py-3 text-partner-porcelain outline-none focus:border-partner-bronze/50 transition-all placeholder:text-partner-slate/50 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Feedback Message */}
              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                  {message.text}
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-8 py-3 bg-partner-bronze text-partner-dark-slate font-bold rounded-xl transition-all shadow-lg shadow-partner-bronze/10 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-partner-bronze/90 hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-partner-dark-slate/30 border-t-partner-dark-slate rounded-full animate-spin"></div>
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Pod Info'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PodCreationPage;
