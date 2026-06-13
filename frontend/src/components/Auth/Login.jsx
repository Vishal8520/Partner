import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate authentication verification
    if (formData.email && formData.password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nexus-dark-slate p-6">
      {/* Background styling elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-nexus-blue/50 via-nexus-dark-slate to-[#0f172a] -z-10"></div>
      
      <div className="max-w-md w-full bg-nexus-blue/20 backdrop-blur-xl border border-nexus-slate/30 p-8 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-center text-nexus-porcelain mb-2">Welcome Back</h2>
        <p className="text-center text-nexus-slate mb-8">Enter your credentials to access your portal</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-nexus-slate mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@school.edu"
              className="w-full px-4 py-3 bg-nexus-dark-slate/50 border border-nexus-slate/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-bronze focus:ring-1 focus:ring-nexus-bronze transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-nexus-slate">Password</label>
              <a href="#" className="text-xs text-nexus-bronze hover:text-white transition-colors">Forgot password?</a>
            </div>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-nexus-dark-slate/50 border border-nexus-slate/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-bronze focus:ring-1 focus:ring-nexus-bronze transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-nexus-dark-slate bg-gradient-to-r from-nexus-bronze to-[#f3cb87] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-bronze transition-all"
          >
            Sign In <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-nexus-slate">
          New to Nexus?{' '}
          <Link to="/signup" className="font-medium text-nexus-bronze hover:text-white transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
