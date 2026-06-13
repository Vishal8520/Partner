import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Bell, Search, LogOut, Calendar } from 'lucide-react';
import PodCard from '../PodCard/PodCard';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${active ? 'bg-nexus-blue text-nexus-porcelain' : 'text-nexus-slate hover:bg-nexus-blue/20 hover:text-nexus-porcelain'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const Navbar = () => (
  <div className="h-16 border-b border-nexus-slate/20 flex items-center justify-between px-6 bg-nexus-dark-slate/50 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center bg-nexus-blue/20 px-3 py-1.5 rounded-full border border-nexus-slate/30 w-96">
      <Search size={18} className="text-nexus-slate mr-2" />
      <input
        type="text"
        placeholder="Search everything..."
        className="bg-transparent border-none outline-none text-nexus-porcelain placeholder:text-nexus-slate text-sm w-full"
      />
    </div>
    <div className="flex items-center space-x-4">
      <div className="p-2 rounded-full bg-nexus-blue/20 border border-nexus-slate/30 text-nexus-bronze relative cursor-pointer hover:bg-nexus-blue/30 transition-all">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nexus-bronze rounded-full"></span>
      </div>
      <div className="flex items-center space-x-3 pl-4 border-l border-nexus-slate/20">
        <div className="text-right">
          <p className="text-sm font-semibold text-nexus-porcelain">Nexus User</p>
          <p className="text-xs text-nexus-slate">nexus@workspace.com</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-nexus-blue to-nexus-bronze border-2 border-nexus-porcelain/20"></div>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [pods, setPods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const response = await fetch('/api/pods');
        if (!response.ok) throw new Error('Failed to fetch pods');
        const data = await response.json();
        setPods(data);
      } catch (err) {
        console.error('Error fetching pods:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPods();
  }, []);

  return (
    <div className="min-h-screen bg-nexus-dark-slate flex text-nexus-porcelain font-sans">
      {/* Sidebar - remains same */}
      <aside className="w-64 border-r border-nexus-slate/20 flex flex-col p-4 bg-nexus-blue/10">
        <div className="flex items-center space-x-3 px-2 mb-10">
          <div className="w-8 h-8 bg-nexus-bronze rounded-lg flex items-center justify-center">
            <span className="text-nexus-dark-slate font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-nexus-porcelain">PARTNER</span>
        </div>

        <nav className="flex-grow space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active onClick={() => navigate('/dashboard')} />
          <SidebarItem icon={Calendar} label="Schedule" onClick={() => navigate('/schedule')} />
          <SidebarItem icon={Users} label="Workspace" />
          <SidebarItem 
            icon={Settings} 
            label="Backup Database" 
            onClick={() => {
              const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? '/api/database/backup'
                : '/api/database/backup';
              window.open(backendUrl);
            }} 
          />
        </nav>

        <div className="pt-4 border-t border-nexus-slate/20">
          <SidebarItem icon={LogOut} label="Sign Out" onClick={() => navigate('/')} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nexus-blue/20 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-nexus-bronze/10 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

        <Navbar />

        <div className="p-8 flex-grow z-0">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-nexus-porcelain mb-2">Workspace Overview</h1>
              <p className="text-nexus-slate">Welcome back! Here's what's happening in your Partner workspace today.</p>
            </div>
            <div className="flex items-center space-x-4">
              {pods.length > 0 && (
                <button 
                  onClick={() => navigate('/create-pod')}
                  className="px-4 py-2 bg-nexus-bronze text-nexus-dark-slate font-bold rounded-lg hover:bg-nexus-bronze/90 transition-all text-sm shadow-lg shadow-nexus-bronze/10"
                >
                  + New Pod
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-nexus-blue/10 border border-nexus-slate/20 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-red-400 bg-red-400/5 border border-red-500/20 rounded-2xl">
              <p className="font-medium">Failed to load pods</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">Try Again</button>
            </div>
          ) : pods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pods.map((pod) => (
                <PodCard
                  key={pod.id}
                  pod={pod}
                  onClick={() => navigate(`/pod/${pod.id}`)}
                  onDelete={(deletedId) => setPods(prev => prev.filter(p => p.id !== deletedId))}
                />
              ))}
            </div>
          ) : (
            <div className="h-96 bg-nexus-blue/5 border border-dashed border-nexus-slate/30 rounded-2xl flex flex-col items-center justify-center text-nexus-slate">
              <div className="w-16 h-16 rounded-full bg-nexus-blue/20 flex items-center justify-center mb-4">
                <LayoutDashboard size={32} />
              </div>
              <p className="text-lg font-medium">No active Classes found</p>
              <p className="text-sm mt-1">Start by creating a new Pod.</p>
              <button 
                onClick={() => navigate('/create-pod')}
                className="mt-6 px-6 py-2 bg-nexus-bronze text-nexus-dark-slate font-bold rounded-lg hover:bg-nexus-bronze/90 transition-all"
              >
                Create Pod
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
