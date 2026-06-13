import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, ArrowRight, Check, X, Sparkles, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI Panels
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(null); // schedule object
  
  // Role selector (for demonstrating two-way scheduling)
  const [userRole, setUserRole] = useState('teacher'); // 'student' or 'teacher'

  // Form States
  const [newPodId, setNewPodId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  // Reschedule Form States
  const [resDate, setResDate] = useState('');
  const [resStart, setResStart] = useState('');
  const [resEnd, setResEnd] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [schRes, podsRes] = await Promise.all([
        fetch('/api/schedule/all'),
        fetch('/api/pods')
      ]);
      if (schRes.ok && podsRes.ok) {
        setSchedules(await schRes.json());
        const podData = await podsRes.json();
        setPods(podData);
        if (podData.length > 0) setNewPodId(podData[0].id);
      } else {
        setError('Failed to fetch schedule data.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error fetching schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!newPodId || !newTitle || !newDate || !newStart || !newEnd) return;
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pod_id: newPodId,
          title: newTitle,
          description: newDescription,
          date: newDate,
          start_time: newStart,
          end_time: newEnd
        })
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDate('');
        setNewStart('');
        setNewEnd('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposeReschedule = async (e) => {
    e.preventDefault();
    if (!isRescheduleOpen || !resDate || !resStart || !resEnd) return;
    try {
      const res = await fetch(`/api/schedule/${isRescheduleOpen.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: resDate,
          start_time: resStart,
          end_time: resEnd
        })
      });
      if (res.ok) {
        setIsRescheduleOpen(null);
        setResDate('');
        setResStart('');
        setResEnd('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptReschedule = async (scheduleId) => {
    try {
      const res = await fetch(`/api/schedule/${scheduleId}/accept`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelClass = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to cancel this class?")) return;
    try {
      const res = await fetch(`/api/schedule/${scheduleId}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPodSubject = (podId) => {
    const pod = pods.find(p => p.id === podId);
    return pod ? `${pod.subject} (Sem ${pod.semester})` : `Pod ${podId}`;
  };

  return (
    <div className="min-h-screen bg-partner-dark-slate text-partner-porcelain flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-partner-blue/10 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-partner-bronze/5 blur-[100px] rounded-full -z-10"></div>

      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto p-6 md:p-8 pt-24 pb-24 space-y-8 z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-partner-bronze">LMS Scheduler</h2>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Class Schedules</h1>
            <p className="text-partner-slate text-sm mt-1">Manage, schedule, and view all class calendars with two-way rescheduling proposals.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Simulator Role Toggle */}
            <div className="flex bg-partner-blue/20 p-1 rounded-xl border border-partner-slate/20 text-xs">
              <button
                onClick={() => setUserRole('student')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${userRole === 'student' ? 'bg-partner-bronze text-[#1e293b]' : 'text-partner-slate hover:text-white'}`}
              >
                Student View
              </button>
              <button
                onClick={() => setUserRole('teacher')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${userRole === 'teacher' ? 'bg-partner-blue text-white' : 'text-partner-slate hover:text-white'}`}
              >
                Teacher View
              </button>
            </div>

            {userRole === 'teacher' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-partner-bronze text-partner-dark-slate font-bold rounded-xl text-sm hover:scale-105 active:scale-95 hover:bg-partner-bronze/90 transition-all flex items-center space-x-1 shadow-lg shadow-partner-bronze/10"
              >
                <Plus size={16} />
                <span>Schedule Class</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-partner-slate/20 border-t-partner-bronze rounded-full animate-spin"></div>
            <p className="text-partner-slate text-sm">Fetching class calendars...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="h-96 bg-partner-blue/5 border border-dashed border-partner-slate/30 rounded-3xl flex flex-col items-center justify-center text-partner-slate">
            <Calendar size={48} className="opacity-20 mb-4" />
            <p className="text-lg font-medium text-partner-slate/80">No Classes Scheduled</p>
            {userRole === 'teacher' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 px-6 py-2 bg-partner-bronze text-[#1e293b] font-bold rounded-xl text-sm"
              >
                Create First Schedule
              </button>
            )}
          </div>
        ) : (
          /* Sleek Schedule Timeline View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedules.map((sch) => {
              const isProposed = sch.status === 'proposed_reschedule';
              const isCancelled = sch.status === 'cancelled';
              
              return (
                <div
                  key={sch.id}
                  className={`bg-partner-blue/5 border rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between h-56
                    ${isCancelled ? 'border-red-500/10 opacity-60 bg-red-950/5' : isProposed ? 'border-partner-bronze/30 shadow-[0_0_15px_rgba(234,188,106,0.05)]' : 'border-partner-slate/20'}
                  `}
                >
                  {/* Decorative Glow */}
                  {isProposed && <div className="absolute top-0 right-0 w-24 h-24 bg-partner-bronze/5 rounded-full blur-2xl pointer-events-none"></div>}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-partner-bronze px-2 py-0.5 bg-partner-bronze/10 rounded-md border border-partner-bronze/20 truncate max-w-[200px]">
                        {getPodSubject(sch.pod_id)}
                      </span>
                      
                      <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md
                        ${isCancelled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : isProposed ? 'bg-partner-bronze/20 text-partner-bronze border border-partner-bronze/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}
                      `}>
                        {sch.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold leading-snug truncate text-partner-porcelain">{sch.title}</h3>
                      {sch.description && <p className="text-xs text-partner-slate mt-1 line-clamp-2">{sch.description}</p>}
                    </div>

                    {/* Class Timing */}
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center space-x-2 text-partner-slate">
                        <Calendar size={13} className="text-partner-slate/80" />
                        <span>Date: <strong className="text-partner-porcelain/90 font-mono">{sch.date}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2 text-partner-slate">
                        <Clock size={13} className="text-partner-slate/80" />
                        <span>Time: <strong className="text-partner-porcelain/90 font-mono">{sch.start_time} - {sch.end_time}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Rescheduling Details Alert */}
                  {isProposed && (
                    <div className="mt-4 p-3 bg-partner-bronze/10 border border-partner-bronze/20 rounded-2xl flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-partner-bronze font-bold flex items-center gap-1">
                          <Sparkles size={12} /> Proposed Reschedule
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-partner-porcelain/95">
                        <span>{sch.proposed_new_date}</span>
                        <ArrowRight size={10} className="text-partner-bronze" />
                        <span>{sch.proposed_new_start} - {sch.proposed_new_end}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Area */}
                  <div className="mt-4 pt-4 border-t border-partner-slate/10 flex justify-end gap-2 text-xs">
                    {/* Student Actions for Reschedule */}
                    {userRole === 'student' && isProposed && (
                      <button
                        onClick={() => handleAcceptReschedule(sch.id)}
                        className="px-4 py-1.5 bg-partner-bronze text-[#1e293b] font-black rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <Check size={12} />
                        <span>Accept Reschedule</span>
                      </button>
                    )}

                    {/* Teacher Actions */}
                    {userRole === 'teacher' && !isCancelled && (
                      <>
                        <button
                          onClick={() => {
                            setIsRescheduleOpen(sch);
                            setResDate(sch.date);
                            setResStart(sch.start_time);
                            setResEnd(sch.end_time);
                          }}
                          className="px-3 py-1.5 bg-partner-blue/40 border border-partner-slate/20 text-partner-porcelain hover:bg-partner-blue/60 transition-colors rounded-lg font-semibold"
                        >
                          Propose Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelClass(sch.id)}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors rounded-lg font-semibold"
                        >
                          Cancel Class
                        </button>
                      </>
                    )}

                    {/* Admin/Teacher accept own proposed reschedule details */}
                    {userRole === 'teacher' && isProposed && (
                      <div className="flex items-center text-[10px] text-partner-slate italic">
                        Waiting for student approval...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-partner-dark-slate border border-partner-slate/20 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-partner-slate hover:text-white bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-partner-bronze" /> Schedule New Class
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs text-partner-slate mb-1">Select Learning Pod</label>
                <select
                  required
                  value={newPodId}
                  onChange={e => setNewPodId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-partner-bronze transition-colors"
                >
                  {pods.map(p => (
                    <option key={p.id} value={p.id} className="bg-partner-dark-slate text-white">
                      Sem {p.semester} - {p.subject} (ID: {p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-partner-slate mb-1">Class Topic / Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Backpropagation calculus"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-partner-bronze"
                />
              </div>

              <div>
                <label className="block text-xs text-partner-slate mb-1">Description (Optional)</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Reading Chapter 2 before the class..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-partner-bronze h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs text-partner-slate mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-partner-slate mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-partner-slate mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-partner-bronze text-partner-dark-slate font-extrabold rounded-xl shadow-lg transition-all"
              >
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-partner-dark-slate border border-partner-slate/20 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRescheduleOpen(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-partner-slate hover:text-white bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Clock size={20} className="text-partner-bronze" /> Propose New Time
            </h3>
            <p className="text-xs text-partner-slate mb-4">Proposing a reschedule for: <strong>{isRescheduleOpen.title}</strong></p>

            <form onSubmit={handleProposeReschedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-1">
                  <label className="block text-xs text-partner-slate mb-1">New Date</label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={e => setResDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-partner-slate mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={resStart}
                    onChange={e => setResStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-partner-slate mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={resEnd}
                    onChange={e => setResEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-partner-bronze text-[#1e293b] font-extrabold rounded-xl shadow-lg transition-all"
              >
                Send Proposal to Students
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SchedulePage;
