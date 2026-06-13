import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, X as XIcon, User, Plus, Trash2, CalendarPlus, QrCode, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

const StudentInfoPanel = ({ podId, onSave, isSaving }) => {
  const [data, setData] = useState({ dates: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('smart'); // 'smart' or 'roster'
  
  // New Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');

  // Automated Attendance State
  const [attendanceCode, setAttendanceCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitCode, setSubmitCode] = useState('');
  const [submitRoll, setSubmitRoll] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [userRole, setUserRole] = useState('student'); // 'student' or 'teacher'

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/pods/${podId}/attendance`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [podId]);

  // Automated Session Countdown Timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setAttendanceCode(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const handleStartSession = async () => {
    setSubmitSuccess('');
    setSubmitError('');
    try {
      const res = await fetch(`http://localhost:8000/api/pods/${podId}/attendance/session`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        setAttendanceCode(json.code);
        setTimeLeft(json.expires_in);
      } else {
        console.error("Failed to generate code");
      }
    } catch (err) {
      console.error("Failed to start session", err);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');
    if (!submitCode || !submitRoll) {
      setSubmitError('Please enter both the roll number and the session code.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/pods/${podId}/attendance/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: submitCode, roll: submitRoll })
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitSuccess(json.message);
        setSubmitCode('');
        // Reload attendance data to see the check-in on the grid
        const refreshRes = await fetch(`http://localhost:8000/api/pods/${podId}/attendance`);
        if (refreshRes.ok) {
          setData(await refreshRes.json());
        }
      } else {
        setSubmitError(json.detail || 'Invalid code or roll number.');
      }
    } catch (err) {
      setSubmitError('Connection error. Failed to submit.');
    }
  };

  const toggleAttendance = (studentIdx, date) => {
    const newData = { ...data };
    const currentVal = newData.students[studentIdx].attendance[date];
    newData.students[studentIdx].attendance[date] = !currentVal;
    setData(newData);
  };

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;
    const newData = { ...data };
    
    if (newData.students.some(s => s.roll === newStudentRoll)) {
        alert("A student with this Roll No. already exists.");
        return;
    }

    const attendanceObj = {};
    newData.dates.forEach(d => attendanceObj[d] = false);

    newData.students.push({
        name: newStudentName,
        roll: newStudentRoll,
        attendance: attendanceObj
    });
    setData(newData);
    setNewStudentName('');
    setNewStudentRoll('');
  };

  const removeStudent = (index) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    const newData = { ...data };
    newData.students.splice(index, 1);
    setData(newData);
  };

  const addDate = () => {
    const defaultDate = new Date().toISOString().split('T')[0];
    const userDate = window.prompt("Enter new date (YYYY-MM-DD):", defaultDate);
    if (!userDate) return;
    
    const newData = { ...data };
    if (newData.dates.includes(userDate)) {
        alert("This date already exists.");
        return;
    }
    
    newData.dates.push(userDate);
    newData.students.forEach(s => {
        s.attendance[userDate] = false;
    });
    setData(newData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-nexus-slate/30 border-t-nexus-bronze rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Sub Tabs */}
      <div className="flex bg-nexus-blue/10 p-1.5 rounded-xl border border-nexus-slate/10 max-w-sm">
        <button
          onClick={() => setActiveSubTab('smart')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeSubTab === 'smart' ? 'bg-nexus-blue text-nexus-porcelain shadow' : 'text-nexus-slate hover:text-nexus-porcelain'}`}
        >
          ⚡ Smart Attendance
        </button>
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeSubTab === 'roster' ? 'bg-nexus-blue text-nexus-porcelain shadow' : 'text-nexus-slate hover:text-nexus-porcelain'}`}
        >
          📋 Manage Roster
        </button>
      </div>

      {activeSubTab === 'smart' ? (
        /* ⚡ SMART AUTOMATED ATTENDANCE VIEW */
        <div className="space-y-6">
          {/* Role Toggle Selector */}
          <div className="flex items-center justify-between bg-nexus-blue/5 border border-nexus-slate/10 p-3 rounded-2xl">
            <span className="text-xs text-nexus-slate font-medium">Select your view:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setUserRole('student')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${userRole === 'student' ? 'bg-nexus-bronze text-[#1e293b]' : 'text-nexus-slate hover:text-white bg-white/5'}`}
              >
                Student Check-In
              </button>
              <button
                onClick={() => setUserRole('teacher')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${userRole === 'teacher' ? 'bg-nexus-blue text-white' : 'text-nexus-slate hover:text-white bg-white/5'}`}
              >
                Teacher Panel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {userRole === 'teacher' ? (
              /* Teacher Generator Interface */
              <div className="bg-gradient-to-br from-nexus-blue/20 to-nexus-blue/5 border border-nexus-slate/20 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-nexus-bronze/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-nexus-blue/30 rounded-2xl flex items-center justify-center border border-nexus-slate/30 text-nexus-bronze shadow-[0_0_15px_rgba(234,188,106,0.1)]">
                    <QrCode size={24} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-nexus-porcelain">Generate Attendance Session</h3>
                  <p className="text-xs text-nexus-slate max-w-sm mx-auto mt-1">
                    Creates a temporary 6-digit code. Present it to the class; students must enter it within 60 seconds.
                  </p>
                </div>

                {attendanceCode ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-nexus-slate text-xs uppercase tracking-widest font-semibold">Class Attendance Code</div>
                    <div className="text-5xl font-black tracking-widest text-nexus-bronze font-mono select-all select-none scale-105 transition-all drop-shadow-[0_0_15px_rgba(234,188,106,0.3)]">
                      {attendanceCode}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-nexus-slate">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span>Code expires in <strong className="text-red-400 font-mono text-base">{timeLeft}s</strong></span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartSession}
                    className="mx-auto px-8 py-3 bg-nexus-bronze text-[#1e293b] rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nexus-bronze/10 hover:shadow-nexus-bronze/20 flex items-center space-x-2"
                  >
                    <Sparkles size={16} />
                    <span>Generate Code</span>
                  </button>
                )}
              </div>
            ) : (
              /* Student Code Submission Form */
              <form onSubmit={handleSubmitCode} className="bg-white/5 border border-nexus-slate/20 rounded-3xl p-6 md:p-8 space-y-5 backdrop-blur-md shadow-2xl">
                <div>
                  <h3 className="text-lg font-bold text-nexus-porcelain flex items-center gap-2">
                    <Sparkles size={18} className="text-nexus-bronze" /> Student Check-In
                  </h3>
                  <p className="text-xs text-nexus-slate mt-0.5">Enter your roll number and the active 6-digit session code.</p>
                </div>

                {submitSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold flex items-center space-x-3">
                    <Check size={18} />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold flex items-center space-x-3">
                    <ShieldAlert size={18} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-slate mb-1">Your Roll Number</label>
                    <input
                      type="text"
                      required
                      value={submitRoll}
                      onChange={e => setSubmitRoll(e.target.value)}
                      placeholder="e.g. UCSE1001"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-nexus-bronze transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nexus-slate mb-1">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={submitCode}
                      onChange={e => setSubmitCode(e.target.value)}
                      placeholder="e.g. 582914"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-xl tracking-widest font-mono text-nexus-bronze placeholder:text-gray-500 focus:outline-none focus:border-nexus-bronze transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-nexus-bronze text-[#1e293b] font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-nexus-bronze/10 flex items-center justify-center space-x-2"
                >
                  <Check size={18} />
                  <span>Verify and Check In</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Roster Grid Reference */}
          <div className="bg-nexus-blue/5 border border-nexus-slate/10 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-nexus-slate uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>Roster Checklist (Live)</span>
              <span className="text-[10px] lowercase italic font-normal text-nexus-slate/60">Updated automatically</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {data.students.map(student => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isPresent = student.attendance[todayStr] === true;
                return (
                  <div key={student.roll} className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${isPresent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-nexus-slate'}`}>
                    <div className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-400 animate-pulse' : 'bg-nexus-slate/30'}`}></div>
                    <div className="truncate flex-1 text-xs">
                      <p className="font-semibold truncate">{student.name}</p>
                      <p className="font-mono text-[9px] opacity-60">{student.roll}</p>
                    </div>
                    {isPresent && <Check size={12} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 📋 MANAGE ROSTER GRID VIEW */
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-nexus-slate italic">
              Manage student attendance records.
            </p>
            <button 
              onClick={addDate}
              className="px-4 py-2 bg-nexus-blue/20 text-nexus-blue hover:bg-nexus-blue hover:text-white transition-all rounded-xl text-sm font-semibold flex items-center space-x-2 border border-nexus-blue/20"
            >
              <CalendarPlus size={16} />
              <span>Add Date Column</span>
            </button>
          </div>

          <div className="bg-nexus-blue/5 border border-nexus-slate/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs text-nexus-slate mb-1">Student Name</label>
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-nexus-blue"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs text-nexus-slate mb-1">Roll Number</label>
                <input 
                  type="text" 
                  value={newStudentRoll}
                  onChange={e => setNewStudentRoll(e.target.value)}
                  placeholder="e.g. UCSE1001" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-nexus-blue"
                />
              </div>
              <button 
                onClick={addStudent}
                disabled={!newStudentName.trim() || !newStudentRoll.trim()}
                className="w-full md:w-auto px-6 py-2 bg-nexus-bronze text-[#1e293b] rounded-xl font-bold hover:bg-nexus-bronze/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Student</span>
              </button>
          </div>

          <div className="bg-nexus-blue/5 border border-nexus-slate/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-nexus-blue/10 border-b border-nexus-slate/20">
                    <th className="p-4 font-bold text-nexus-bronze text-sm whitespace-nowrap">Roll No.</th>
                    <th className="p-4 font-bold text-nexus-bronze text-sm whitespace-nowrap">Student Name</th>
                    {data.dates.map(date => (
                      <th key={date} className="p-4 font-bold text-nexus-porcelain text-sm text-center whitespace-nowrap">
                        {date}
                      </th>
                    ))}
                    <th className="p-4 font-bold text-nexus-slate text-sm text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexus-slate/10">
                  {data.students.map((student, sIdx) => (
                    <tr key={student.roll} className="hover:bg-nexus-blue/10 transition-colors group">
                      <td className="p-4 text-sm font-mono text-nexus-slate">{student.roll}</td>
                      <td className="p-4 text-sm font-semibold text-nexus-porcelain flex items-center space-x-2">
                        <User size={14} className="text-nexus-slate group-hover:text-nexus-bronze transition-colors" />
                        <span>{student.name}</span>
                      </td>
                      {data.dates.map(date => {
                        const isPresent = student.attendance[date];
                        return (
                          <td key={date} className="p-4 text-center">
                            <button
                              onClick={() => toggleAttendance(sIdx, date)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                isPresent 
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' 
                                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              }`}
                              title={isPresent ? 'Present' : 'Absent'}
                            >
                              {isPresent ? <Check size={16} strokeWidth={3} /> : <XIcon size={16} strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-4 text-center">
                        <button 
                            onClick={() => removeStudent(sIdx)}
                            className="p-2 text-nexus-slate hover:text-red-400 transition-colors"
                            title="Remove Student"
                        >
                            <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
          <span>{isSaving ? 'Saving Records...' : 'Save Attendance'}</span>
        </button>
      </div>
    </div>
  );
};

export default StudentInfoPanel;
