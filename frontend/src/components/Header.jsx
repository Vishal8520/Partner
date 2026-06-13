import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationLinks = [
    { name: "How It Works", path: "#how-it-works", isAnchor: true },
    { name: "Pricing", path: "#pricing", isAnchor: true },
    { name: "Engineering Tools", path: "/engineering", isAnchor: false },
    { name: "Partner AI", path: "/chat", isAnchor: false },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-partner-dark-slate shadow-xl" : "bg-partner-dark-slate/95 backdrop-blur-md"
        }`}
    >
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/partner-logo.png" alt="Partner AI Assistant" className="h-10 w-auto rounded border-2 border-partner-bronze/30 shadow-sm" />
          <span className="text-2xl font-bold text-white tracking-wide">
            <span className="text-partner-bronze uppercase">Partner</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-8 md:flex">
          {navigationLinks.map((item) => (
            item.isAnchor ? (
              <a
                key={item.name}
                href={item.path}
                className="relative font-medium text-gray-300 text-sm hover:text-partner-bronze transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-partner-bronze hover:after:w-full after:transition-all pointer-events-auto"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className="relative font-medium text-gray-300 text-sm hover:text-partner-bronze transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-partner-bronze hover:after:w-full after:transition-all"
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="items-center hidden space-x-4 md:flex">
          {user ? (
            <>
              <span className="text-gray-400 text-sm">Welcome, <span className="text-partner-bronze">{user.username}</span></span>
              <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2 font-medium text-gray-300 transition-colors hover:text-partner-bronze">Logout</button>
              <Link to="/engineering" className="px-4 py-2 font-medium text-white transition-colors bg-partner-blue rounded-lg hover:bg-partner-slate border border-partner-bronze/20 shadow-lg shadow-partner-blue/20">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 font-medium text-gray-300 transition-colors hover:text-partner-bronze">Login</Link>
              <Link to="/signup" className="px-4 py-2 font-medium text-white transition-colors bg-partner-blue rounded-lg hover:bg-partner-slate border border-partner-bronze/20 shadow-lg shadow-partner-blue/20">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 transition-colors md:hidden hover:text-partner-bronze"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        <nav className="px-6 pb-4 space-y-4 bg-partner-blue/95 backdrop-blur-sm">
          {navigationLinks.map((item) => (
            item.isAnchor ? (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-300 transition-colors border-b border-gray-700 hover:text-partner-bronze last:border-0"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-300 transition-colors border-b border-gray-700 hover:text-partner-bronze last:border-0"
              >
                {item.name}
              </Link>
            )
          ))}
          <div className="pt-4 space-y-4 border-t border-gray-700">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2 font-medium text-center text-white transition-colors bg-partner-blue rounded-lg hover:bg-partner-slate border border-partner-bronze/20 shadow-lg">Dashboard</Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }} className="block w-full py-2 text-center text-gray-300 transition-colors hover:text-partner-bronze">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2 text-center text-gray-300 transition-colors hover:text-partner-bronze">Login</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2 font-medium text-center text-white transition-colors bg-partner-blue rounded-lg hover:bg-partner-slate border border-partner-bronze/20 shadow-lg">Get Started</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}