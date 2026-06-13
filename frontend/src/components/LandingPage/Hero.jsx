import { Link } from "react-router"; // Updated import for React Router v6
import { ArrowRight } from "lucide-react";
import { LockClosedIcon, UserGroupIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <header className="relative flex items-center justify-center min-h-screen overflow-hidden bg-nexus-dark-slate">
      {/* Gradient Background */}
      <div className="absolute inset-0 opacity-95">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-nexus-blue/80 via-nexus-dark-slate to-[#0f172a]/90"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-nexus-blue/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-nexus-dark-slate via-nexus-dark-slate/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-6 mx-auto max-w-7xl lg:px-8">
        <div className="text-center">
          {/* Pre-header Badge */}
          <div className="inline-flex items-center mb-8 space-x-3 px-4 py-2.5 bg-nexus-bronze/10 rounded-full border border-nexus-bronze/30">
            <span className="text-sm font-semibold text-nexus-bronze">Trusted by progressive educators worldwide</span>
          </div>

          {/* Main Heading */}
          <h1 className="max-w-4xl mx-auto font-serif text-5xl font-medium leading-tight text-white text-balance md:text-6xl lg:text-7xl">
            Meet Antigravity,
            <span className="block text-transparent bg-gradient-to-r from-nexus-bronze to-nexus-porcelain bg-clip-text">
              The Engineering AI Platform
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto mt-8 text-xl font-light leading-relaxed text-gray-300">
            Turning AI from a chatbot into an engineer. 
            Break big tasks into atomic steps with GSD, build and iterate with Ralph Loop, 
            and ensure code quality with real-time CodeRabbit reviews.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-6 mt-12 sm:flex-row">
            <Link
              to="/signup"
              className="relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-medium text-nexus-dark-slate transition-all rounded-lg shadow-xl group bg-gradient-to-br from-nexus-bronze to-[#f3cb87] hover:shadow-2xl hover:brightness-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 transition-opacity border rounded-lg opacity-0 border-white/30 group-hover:opacity-100"></div>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-nexus-slate">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="w-6 h-6 text-emerald-400" />
              <span className="text-sm">Secure In-Class Tool</span>
            </div>
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-nexus-bronze" />
              <span className="text-sm">Adapts to Any Syllabus</span>
            </div>
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-6 h-6 text-purple-400" />
              <span className="text-sm">Autonomous Engineering</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Geometric Pattern */}
      <div className="absolute inset-0 opacity-15 [mask-image:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.8))]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Subtle animated circles */}
            <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.6">
                <animate attributeName="r" values="1.5;3;1.5" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="8s" repeatCount="indefinite" />
              </circle>
            </pattern>

            {/* Hexagonal mesh */}
            <pattern id="hexagons" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path 
                d="M0 40L40 0 80 40 40 80 0 40ZM20 60L40 80 60 60 40 40 20 60ZM60 20L80 40 60 60 40 40 60 20Z"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.2"
              />
            </pattern>

            {/* Gradient overlay */}
            <radialGradient id="patternOverlay" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Layered patterns */}
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circles)" className="text-nexus-slate/20" />
          <rect x="0" y="0" width="100%" height="100%" fill="url(#hexagons)" className="text-nexus-bronze/5" />
          <rect x="0" y="0" width="100%" height="100%" fill="url(#patternOverlay)" />
          
          {/* Animated lines */}
          <path 
            d="M0 20Q40 50 80 20T160 20" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="text-nexus-bronze/20"
            strokeLinecap="round"
          >
            <animate 
              attributeName="d" 
              values="M0 20Q40 0 80 20T160 20; M0 20Q40 40 80 20T160 20; M0 20Q40 0 80 20T160 20" 
              dur="12s" 
              repeatCount="indefinite" 
            />
          </path>
        </svg>
      </div>
    </header>
  );
}