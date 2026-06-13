import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Activity, Loader2, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { LiveQuizCard, SmartRecapCard, SimulationsCard, LiveOutlineCard } from './LiveSessionCards';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LiveSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const podId = searchParams.get('podId');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState([]);
  const [outline, setOutline] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [recap, setRecap] = useState(null);
  
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, error
  
  // Real-time scheduling link
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedClassTitle, setSelectedClassTitle] = useState('Live Lecture');

  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunkAccumulatorRef = useRef('');
  const chunkTimerRef = useRef(null);
  const quizTimerRef = useRef(null);
  const simTimerRef = useRef(null);
  const outlineScrollRef = useRef(null);
  const isListeningRef = useRef(false);
  const demoIntervalRef = useRef(null);

  // Fetch active schedules for this Pod
  useEffect(() => {
    if (podId) {
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : '';
      fetch(`${baseUrl}/api/pods/${podId}/schedule`)
        .then(res => res.json())
        .then(data => {
          const activeSchedules = data.filter(s => s.status === 'scheduled');
          setSchedules(activeSchedules);
          if (activeSchedules.length > 0) {
            setSelectedScheduleId(activeSchedules[0].id);
            setSelectedClassTitle(activeSchedules[0].title);
          }
        })
        .catch(err => console.error('Error fetching schedules for live session:', err));
    }
  }, [podId]);

  // Initialize WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost:8000'
      : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live-session`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'outline_update') {
        setOutline(prev => [...prev, ...data.content]);
      } else if (data.type === 'quiz_update') {
        setQuizzes(prev => [...prev, ...data.content]);
      } else if (data.type === 'simulation_update') {
        setSimulations(prev => {
          const newSims = data.content.filter(newSim => !prev.some(p => p.id === newSim.id));
          return [...prev, ...newSims];
        });
      } else if (data.type === 'recap_update') {
        setRecap(data.content);
        setIsListening(false);
      }
    };
    
    ws.onerror = () => {
      setConnectionStatus('error');
    };
    
    ws.onclose = () => {
      setConnectionStatus('error');
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) {
              finalTranscript += text + ' ';
            }
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(interimTranscript);
        
        if (finalTranscript.trim()) {
          chunkAccumulatorRef.current += finalTranscript;
          setFullTranscript(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            text: finalTranscript.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setTimeout(() => {
            if (outlineScrollRef.current) {
              outlineScrollRef.current.scrollTop = outlineScrollRef.current.scrollHeight;
            }
          }, 100);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
             setIsListening(false);
             isListeningRef.current = false;
        }
      };
      
      recognition.onend = () => {
          if (isListeningRef.current) {
             try { recognition.start(); } catch(e) { console.warn('Failed to restart speech recognition:', e); }
          }
      }

      recognitionRef.current = recognition;
      
      return () => {
          if (recognitionRef.current) {
               try { recognitionRef.current.stop(); } catch(e) {}
          }
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Microphone access denied:', err);
    }

    if (recognitionRef.current && connectionStatus === 'connected') {
      isListeningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);

      // 1. Initialize backend session metadata (Pod, Schedule ID, Class Title)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_session',
          pod_id: podId,
          schedule_id: selectedScheduleId || null,
          class_title: selectedClassTitle
        }));
      }

      // Start 15s chunker
      chunkTimerRef.current = setInterval(() => {
        if (chunkAccumulatorRef.current.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            content: chunkAccumulatorRef.current
          }));
          chunkAccumulatorRef.current = '';
        }
      }, 15000);
    }
  };

  const simulateLecture = () => {
      if (connectionStatus !== 'connected') return;
      setIsListening(true);
      isListeningRef.current = true;
      
      // 1. Initialize backend session metadata (Pod, Schedule ID, Class Title)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_session',
          pod_id: podId,
          schedule_id: selectedScheduleId || null,
          class_title: selectedClassTitle
        }));
      }

      const script = [
          "Alright class, today we're going to dive into the fundamentals of Neural Networks.",
          "At its core, a neural network is a computational model inspired by the human brain.",
          "It consists of interconnected nodes or 'neurons' organized into layers: an input layer, hidden layers, and an output layer.",
          "Each connection between neurons has an associated weight and bias, which the network learns during training.",
          "We use a process called backpropagation to adjust these weights and minimize our error loss function.",
          "By passing data forward, calculating the error, and propagating it backward, the network literally 'learns' from its mistakes.",
          "This forms the foundation of modern Deep Learning, powering everything from ChatGPT to autonomous driving.",
          "Are there any questions on the forward pass before we look at the calculus of backpropagation?"
      ];
      
      let index = 0;
      
      demoIntervalRef.current = setInterval(() => {
          if (index >= script.length) {
              clearInterval(demoIntervalRef.current);
              return;
          }
          
          const text = script[index];
          
          setFullTranscript(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          
          setTimeout(() => {
             if (outlineScrollRef.current) {
                 outlineScrollRef.current.scrollTop = outlineScrollRef.current.scrollHeight;
             }
          }, 100);
          
          chunkAccumulatorRef.current += text + ' ';
          index++;
      }, 4000);
      
      // Start chunker
      chunkTimerRef.current = setInterval(() => {
        if (chunkAccumulatorRef.current.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            content: chunkAccumulatorRef.current
          }));
          chunkAccumulatorRef.current = '';
        }
      }, 15000);
  };

  const endSession = () => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
    }
    
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (chunkAccumulatorRef.current.trim()) {
        wsRef.current.send(JSON.stringify({
          type: 'audio_chunk',
          content: chunkAccumulatorRef.current
        }));
      }
      
      // Send end session explicitly to generate Recap and Save to Database
      wsRef.current.send(JSON.stringify({
        type: 'end_session'
      }));
    }
  };

  const closeSession = () => {
      if (podId) {
        navigate(`/pod/${podId}`);
      } else {
        navigate('/dashboard');
      }
  }

  return (
    <div className="min-h-screen bg-partner-dark-slate flex flex-col font-sans text-partner-porcelain overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-partner-blue/10 via-partner-dark-slate to-[#0f172a] -z-10 opacity-60"></div>

        {/* Top Header */}
        <header className="h-14 border-b border-partner-slate/10 flex items-center justify-between px-6 bg-partner-dark-slate/50 backdrop-blur-sm z-10 shrink-0">
             <div className="flex items-center space-x-3">
                 <div className="w-6 h-6 bg-partner-bronze rounded flex items-center justify-center">
                    <span className="text-partner-dark-slate font-bold text-xs">P</span>
                 </div>
                 <span className="font-semibold text-partner-porcelain/80 text-sm tracking-wide">CLASSROOM MODE</span>
             </div>
             
             <div className="flex items-center space-x-4">
                 {connectionStatus === 'connecting' && <span className="flex items-center text-partner-slate text-xs"><Loader2 size={12} className="animate-spin mr-1"/> Connecting T.A...</span>}
                 {connectionStatus === 'connected' && <span className="flex items-center text-emerald-400 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span> T.A Online</span>}
                 {connectionStatus === 'error' && <span className="flex items-center text-red-400 text-xs"><AlertCircle size={12} className="mr-1"/> Disconnected</span>}
                 
                 <button onClick={closeSession} className="text-partner-slate hover:text-partner-porcelain transition-colors text-sm font-medium">Exit</button>
             </div>
         </header>

        <main className="flex-grow flex p-6 gap-6 overflow-hidden z-10">
            {/* Left Side: Real-time Outline / Live Transcript */}
            <div className="w-1/2 flex flex-col bg-partner-blue/5 border border-partner-slate/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                 <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-partner-porcelain to-partner-slate">Live Transcript</h2>
                     <div className="flex items-center space-x-2">
                          {isListening && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">● REC</span>}
                          <Activity className={`text-partner-bronze ${isListening ? 'animate-pulse' : 'opacity-50'}`} size={24} />
                     </div>
                 </div>
                 
                 <div ref={outlineScrollRef} className="flex-grow overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                     {fullTranscript.length === 0 && !isListening && !recap && (
                          <div className="h-full flex flex-col items-center justify-center text-partner-slate/50 space-y-4">
                               <Sparkles size={48} className="opacity-20" />
                               <p className="text-lg">Start speaking to capture live lecture notes.</p>
                          </div>
                     )}

                     {isListening && fullTranscript.length === 0 && (
                          <div className="text-partner-slate/40 text-center py-8">
                               <p className="text-sm">Listening... speak or play audio near the microphone.</p>
                          </div>
                     )}
                     
                     <div className="flex flex-col gap-0 relative">
                          {fullTranscript.map((item, idx) => {
                              const text = typeof item === 'string' ? item : item.text;
                              const timestamp = typeof item === 'string' ? '' : item.timestamp;
                              const id = typeof item === 'string' ? idx : item.id;
                              const isLast = idx === fullTranscript.length - 1;
                              
                              return (
                                  <div key={id} className="group flex gap-4 transition-all duration-300 hover:bg-partner-dark-slate/20 p-4 rounded-2xl border border-transparent hover:border-partner-slate/10">
                                       <div className="flex flex-col items-center gap-3 mt-1 shrink-0">
                                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-partner-bronze/20 to-partner-bronze/5 flex items-center justify-center border border-partner-bronze/20 shadow-[0_0_10px_rgba(235,176,141,0.1)] group-hover:shadow-[0_0_15px_rgba(235,176,141,0.2)] transition-shadow shrink-0">
                                               <Mic size={14} className="text-partner-bronze" />
                                           </div>
                                           {(!isLast || (isListening && transcript)) && (
                                               <div className="w-px flex-grow min-h-[20px] bg-gradient-to-b from-partner-bronze/20 via-partner-slate/10 to-transparent"></div>
                                           )}
                                       </div>
                                       <div className="flex flex-col gap-1.5 pb-2">
                                           <div className="flex items-center gap-2">
                                               <span className="text-sm font-semibold text-partner-porcelain/90">Instructor</span>
                                               {timestamp && <span className="text-[11px] text-partner-slate/60 font-medium px-2 py-0.5 rounded-md bg-partner-dark-slate/30 border border-partner-slate/5">{timestamp}</span>}
                                           </div>
                                           <p className="text-[15px] text-partner-porcelain/90 leading-relaxed font-light tracking-wide">{text}</p>
                                       </div>
                                  </div>
                              );
                          })}
                          
                          {isListening && transcript && (
                              <div className="group flex gap-4 p-4 opacity-70">
                                   <div className="flex flex-col items-center gap-3 mt-1 shrink-0">
                                       <div className="w-8 h-8 rounded-full bg-partner-slate/10 flex items-center justify-center border border-partner-slate/20 shrink-0">
                                           <Loader2 size={14} className="text-partner-slate animate-spin" />
                                       </div>
                                   </div>
                                   <div className="flex flex-col gap-1.5">
                                       <div className="flex items-center gap-2">
                                           <span className="text-sm font-semibold text-partner-slate">Listening...</span>
                                       </div>
                                       <p className="text-[15px] text-partner-slate/80 italic font-light tracking-wide animate-pulse">{transcript}</p>
                                   </div>
                              </div>
                          )}
                     </div>
                 </div>
            </div>

            {/* Right Side: Dynamic Cards */}
            <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-24 relative">
                  {recap && (
                     <SmartRecapCard recap={recap} />
                  )}

                  {outline.length > 0 && !recap && (
                      <LiveOutlineCard outline={outline} />
                  )}

                  {quizzes.length > 0 && (
                      <LiveQuizCard quizzes={quizzes} />
                  )}

                  {simulations.length > 0 && (
                      <SimulationsCard simulations={simulations} />
                  )}
                  
                  {outline.length === 0 && quizzes.length === 0 && !recap && simulations.length === 0 && (
                       <div className="flex-grow rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
                            <p className="text-partner-slate/60 text-center px-12 text-lg font-light animate-pulse">
                                 AI-generated outlines, pop-quizzes, and smart recommendations will automatically appear here as the session progresses.
                            </p>
                       </div>
                  )}
             </div>
        </main>

        {/* Focus Mode Bottom Bar */}
        <footer className="h-20 border-t border-partner-slate/10 bg-partner-dark-slate/80 backdrop-blur-xl absolute bottom-0 left-0 w-full z-20 flex items-center justify-center px-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            <div className="flex items-center space-x-6">
                 {!isListening ? (
                      <>
                          {/* Real-time schedule integration selector */}
                          {schedules.length > 0 && (
                            <div className="flex items-center space-x-2 bg-partner-blue/20 px-4 py-2 border border-partner-slate/20 rounded-full">
                              <Calendar size={16} className="text-partner-bronze" />
                              <select
                                value={selectedScheduleId}
                                onChange={e => {
                                  setSelectedScheduleId(e.target.value);
                                  const s = schedules.find(x => x.id === e.target.value);
                                  if (s) setSelectedClassTitle(s.title);
                                }}
                                className="bg-transparent text-partner-porcelain text-xs focus:outline-none font-bold"
                              >
                                {schedules.map(sch => (
                                  <option key={sch.id} value={sch.id} className="bg-partner-dark-slate text-white text-xs">
                                    {sch.title} ({sch.date})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <button
                             onClick={startSession}
                             disabled={connectionStatus !== 'connected'}
                             className="flex items-center space-x-3 bg-partner-bronze text-partner-dark-slate px-8 py-3 rounded-full font-bold hover:bg-partner-bronze/90 transition-all shadow-[0_0_20px_rgba(235,176,141,0.3)] hover:shadow-[0_0_30px_rgba(235,176,141,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Mic size={20} />
                              <span>Start Speaking</span>
                          </button>
                          
                          <button
                             onClick={simulateLecture}
                             disabled={connectionStatus !== 'connected'}
                             className="flex items-center space-x-3 bg-partner-blue/20 text-partner-porcelain border border-partner-slate/20 px-8 py-3 rounded-full font-bold hover:bg-partner-blue/40 transition-all shadow-[0_0_20px_rgba(54,76,95,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Sparkles size={20} className="text-partner-bronze" />
                              <span>Demo Lecture</span>
                          </button>
                      </>
                 ) : (
                      <button
                         onClick={endSession}
                         className="flex items-center space-x-3 bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-3 rounded-full font-bold hover:bg-red-500/20 transition-all hover:border-red-500/40"
                      >
                          <Square size={16} fill="currentColor" />
                          <span>End & Recap</span>
                      </button>
                 )}
                 
                 {isListening && (
                      <div className="flex items-center space-x-2 text-partner-slate">
                           <span className="flex space-x-1 items-center bg-partner-blue/20 px-4 py-2 rounded-full border border-partner-slate/10">
                               <span className="w-1 h-3 bg-partner-bronze rounded-full animate-[bounce_1s_infinite_0.1s]"></span>
                               <span className="w-1 h-4 bg-partner-bronze rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                               <span className="w-1 h-2 bg-partner-bronze rounded-full animate-[bounce_1s_infinite_0.3s]"></span>
                               <span className="text-xs ml-2 font-medium">T.A. Listening ({selectedClassTitle})</span>
                           </span>
                      </div>
                 )}
            </div>
        </footer>
    </div>
  );
};

export default LiveSession;
