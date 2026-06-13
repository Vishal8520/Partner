import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-partner-dark-slate p-6">
      {/* Background styling elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-partner-blue/50 via-partner-dark-slate to-[#0f172a] -z-10"></div>
      
      <div className="max-w-md w-full bg-partner-blue/20 backdrop-blur-xl border border-partner-slate/30 p-8 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-center text-partner-porcelain mb-2">Create an Account</h2>
        <p className="text-center text-partner-slate mb-8">Start organizing your teaching toolkit.</p>
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-partner-slate mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Educator Name"
              className="w-full px-4 py-3 bg-partner-dark-slate/50 border border-partner-slate/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-partner-bronze focus:ring-1 focus:ring-partner-bronze transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-partner-slate mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@school.edu"
              className="w-full px-4 py-3 bg-partner-dark-slate/50 border border-partner-slate/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-partner-bronze focus:ring-1 focus:ring-partner-bronze transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-partner-slate mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-partner-dark-slate/50 border border-partner-slate/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-partner-bronze focus:ring-1 focus:ring-partner-bronze transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-partner-dark-slate bg-gradient-to-r from-partner-bronze to-[#f3cb87] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-partner-bronze transition-all"
          >
            Create Account <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-partner-slate">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-partner-bronze hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
