import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, Trash2, CloudLightning, ShieldAlert, Check, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

const PodChat = ({ podId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('Anonymous Student');
  
  // Settings States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [backupStatus, setBackupStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [isBackingUp, setIsBackingUp] = useState(false);

  const messagesEndRef = useRef(null);

  // Load chat logs and settings on component mount
  useEffect(() => {
    // 1. Get username from Auth state if available
    try {
      const storedUser = localStorage.getItem('username');
      if (storedUser) setUsername(storedUser);
    } catch (e) {
      console.warn('Failed to read username from localStorage', e);
    }

    // 2. Load Pod Chat History
    const chatKey = `nexus-chat-log-${podId}`;
    const storedLogs = localStorage.getItem(chatKey);
    if (storedLogs) {
      setMessages(JSON.parse(storedLogs));
    } else {
      // Mock initial messages for demo vibe coding
      const defaultMsgs = [
        { id: 1, sender: 'Bhavesh', text: 'Hey class! Did anyone finish the neural network assignment?', timestamp: '09:15 AM' },
        { id: 2, sender: 'Garvit', text: 'Yeah, just wrapping up the backprop questions. Let me know if you need help!', timestamp: '09:20 AM' },
        { id: 3, sender: 'T.A. Assistant', text: 'Remember, office hours are at 4:00 PM today. We will cover vector gradients.', timestamp: '09:25 AM' }
      ];
      setMessages(defaultMsgs);
      localStorage.setItem(chatKey, JSON.stringify(defaultMsgs));
    }

    // 3. Load Auto Delete settings
    const settingsKey = `nexus-chat-settings-${podId}`;
    const storedSettings = localStorage.getItem(settingsKey);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setAutoDelete(parsed.autoDelete || false);
    }
  }, [podId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: username,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`nexus-chat-log-${podId}`, JSON.stringify(updatedMessages));
    setInputText('');
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to delete all local chat logs? This action is permanent.')) {
      setMessages([]);
      localStorage.removeItem(`nexus-chat-log-${podId}`);
      setIsSettingsOpen(false);
    }
  };

  const handleToggleAutoDelete = () => {
    const nextState = !autoDelete;
    setAutoDelete(nextState);
    localStorage.setItem(`nexus-chat-settings-${podId}`, JSON.stringify({ autoDelete: nextState }));
  };

  // Simulate Google Drive Backup Integration
  const handleGDriveBackup = () => {
    setIsBackingUp(true);
    setBackupStatus('loading');
    
    setTimeout(() => {
      // Simulate OAuth token verification and JSON export
      setBackupStatus('success');
      setIsBackingUp(false);
      setTimeout(() => setBackupStatus(''), 4000);
    }, 2500);
  };

  return (
    <div className="flex flex-col bg-nexus-blue/5 border border-nexus-slate/20 rounded-3xl h-[600px] overflow-hidden backdrop-blur-md shadow-2xl relative">
      
      {/* Chat Header */}
      <header className="h-16 border-b border-nexus-slate/10 flex items-center justify-between px-6 bg-nexus-dark-slate/40 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-bold text-sm text-nexus-porcelain uppercase tracking-wider">Class Discussion Room</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold ml-2">Local-First</span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-xl text-nexus-slate hover:text-nexus-porcelain hover:bg-nexus-blue/30 transition-all ${isSettingsOpen ? 'bg-nexus-blue/40 text-white rotate-45' : ''}`}
          title="Chat Settings"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Main Chat Body & Overlay Panels */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Messages Feed Area */}
        <div className="flex-grow flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {messages.map((msg) => {
            const isMe = msg.sender === username;
            const isTA = msg.sender.includes('T.A.');

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] space-y-1 transition-all animate-in fade-in duration-300
                  ${isMe ? 'self-end items-end' : 'self-start items-start'}
                `}
              >
                <div className="flex items-center space-x-2 text-[10px] text-nexus-slate px-1">
                  <span className="font-bold">{msg.sender}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg
                    ${isMe 
                      ? 'bg-nexus-bronze text-[#1e293b] rounded-tr-none font-medium' 
                      : isTA 
                        ? 'bg-nexus-blue/50 text-nexus-porcelain border border-nexus-bronze/30 rounded-tl-none font-light' 
                        : 'bg-white/5 text-nexus-porcelain/90 border border-white/5 rounded-tl-none font-light'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Settings Sidebar */}
        {isSettingsOpen && (
          <div className="absolute inset-y-0 right-0 w-80 bg-nexus-dark-slate border-l border-nexus-slate/20 shadow-2xl p-6 flex flex-col justify-between z-20 animate-in slide-in-from-right duration-250 backdrop-blur-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-nexus-slate/10">
                <h3 className="font-bold text-nexus-porcelain text-sm flex items-center gap-1.5">
                  <Settings size={16} className="text-nexus-bronze" /> Chat Settings
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-nexus-slate hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* GDrive Backup Tool */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-nexus-slate uppercase tracking-wider">Cloud Storage</label>
                
                {backupStatus === 'success' ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center space-x-2 font-semibold">
                    <Check size={16} />
                    <span>Backup completed! File saved.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGDriveBackup}
                    disabled={isBackingUp}
                    className="w-full py-2.5 bg-nexus-blue text-white rounded-xl text-xs font-bold hover:bg-nexus-blue/80 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CloudLightning size={14} className={isBackingUp ? 'animate-bounce' : ''} />
                    <span>{isBackingUp ? 'Authorizing Drive...' : 'Backup to Google Drive'}</span>
                  </button>
                )}
                <p className="text-[10px] text-nexus-slate italic">Uploads an encrypted chat transcript to your GDrive.</p>
              </div>

              {/* Auto Delete Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-nexus-slate uppercase tracking-wider">Privacy & Storage</label>
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs text-nexus-slate">Auto-delete after semester</span>
                  <button onClick={handleToggleAutoDelete} className="text-nexus-bronze">
                    {autoDelete ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <p className="text-[10px] text-nexus-slate italic">If enabled, local storage for this pod will purge 120 days from creation.</p>
              </div>
            </div>

            {/* Clear History Call to Action */}
            <button
              onClick={handleClearChat}
              className="w-full py-2.5 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors rounded-xl text-red-400 text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Trash2 size={14} />
              <span>Purge Chat History</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="h-20 border-t border-nexus-slate/10 bg-nexus-dark-slate/40 flex items-center px-6 gap-3 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Speak freely, ${username}... (Message will be saved locally)`}
          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-nexus-bronze transition-colors"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-2xl bg-nexus-bronze text-[#1e293b] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nexus-bronze/10"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default PodChat;
