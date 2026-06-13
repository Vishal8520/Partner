import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Sparkles, GraduationCap } from 'lucide-react';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Frontend validation
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters.');
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            
            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok) {
                navigate('/login');
            } else if (response.status === 400) {
                setError(data.detail || 'Username or email is already taken. Please try different ones.');
            } else {
                setError('Something went wrong on our end. Please try again in a moment.');
            }
        } catch (err) {
            setError('Cannot connect to server. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-row-reverse min-h-[85vh] bg-[#0f172a] font-sans text-nexus-porcelain overflow-hidden relative rounded-[2.5rem] shadow-2xl mx-8 my-8 border border-white/10">
            {/* Left Column: Form (Now on Right due to flex-row-reverse) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-nexus-dark-slate/80 backdrop-blur-xl">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full mx-auto"
                >
                    <Link to="/" className="inline-block mb-10 text-nexus-bronze font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                        PARTNER.
                    </Link>

                    <h2 className="text-4xl font-black mb-3 tracking-tight">Create your account</h2>
                    <p className="text-nexus-slate mb-8 text-lg">Start building your intelligent workspaces today.</p>
                    
                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse"></span>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-slate group-focus-within:text-nexus-bronze transition-colors">
                                <User size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Username" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                required
                                className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-nexus-slate/50 focus:outline-none focus:border-nexus-bronze focus:ring-1 focus:ring-nexus-bronze transition-all" 
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-slate group-focus-within:text-nexus-bronze transition-colors">
                                <Mail size={20} />
                            </div>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required
                                className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-nexus-slate/50 focus:outline-none focus:border-nexus-bronze focus:ring-1 focus:ring-nexus-bronze transition-all" 
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-slate group-focus-within:text-nexus-bronze transition-colors">
                                <Lock size={20} />
                            </div>
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required
                                className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-nexus-slate/50 focus:outline-none focus:border-nexus-bronze focus:ring-1 focus:ring-nexus-bronze transition-all" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-nexus-bronze to-yellow-500 font-bold text-nexus-blue hover:shadow-[0_0_30px_rgba(235,176,141,0.4)] hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-xl"
                        >
                            <span>{isLoading ? 'Creating Account...' : 'Sign up'}</span>
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-center space-x-4">
                        <div className="h-px bg-white/10 flex-grow"></div>
                        <span className="text-nexus-slate text-sm font-medium tracking-wide">OR SIGN UP WITH</span>
                        <div className="h-px bg-white/10 flex-grow"></div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white font-medium shadow-md">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            <span>Google</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white font-medium shadow-md">
                            <Github size={20} />
                            <span>GitHub</span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-nexus-slate">
                        Already have an account? <Link to="/login" className="text-nexus-bronze hover:text-white transition-colors font-bold ml-1">Log in</Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Column: Visual Showcase (Now on Left) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-nexus-blue/10 items-center justify-center overflow-hidden">
                {/* Abstract animated background */}
                <div className="absolute inset-0 z-0 opacity-80">
                    <div className="absolute top-1/2 left-1/4 w-[700px] h-[700px] bg-nexus-blue/20 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_7s_ease-in-out_infinite] -translate-y-1/2"></div>
                </div>

                {/* Glass Card Floating */}
                <motion.div 
                    initial={{ opacity: 0, x: -60 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 p-12 max-w-lg rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_20px_60px_rgba(35,51,64,0.4)] leading-relaxed"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 shadow-lg">
                        <GraduationCap className="text-white w-8 h-8" />
                    </div>
                    
                    <h3 className="text-4xl font-black text-white mb-6 leading-tight">Elevate your <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-nexus-porcelain to-nexus-blue">learning modules.</span></h3>
                    <p className="text-nexus-slate text-lg mb-8 leading-relaxed font-medium">
                        Convert static curriculum documents into sprawling interactive trees, live intelligent quizzes, and real-time recaps. 
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-white font-medium">
                            <div className="w-6 h-6 rounded-full bg-nexus-bronze/20 flex items-center justify-center text-nexus-bronze border border-nexus-bronze/50"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                            <span>Instant Interactive Checklists</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white font-medium">
                            <div className="w-6 h-6 rounded-full bg-nexus-bronze/20 flex items-center justify-center text-nexus-bronze border border-nexus-bronze/50"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                            <span>Semantic Progress Analytics</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white font-medium">
                            <div className="w-6 h-6 rounded-full bg-nexus-bronze/20 flex items-center justify-center text-nexus-bronze border border-nexus-bronze/50"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                            <span>Seamless Multi-Device Sync</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
export default SignupPage;
