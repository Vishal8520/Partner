import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/LandingPage/Hero';
import Features from './components/LandingPage/Features';
import Pricing from './components/LandingPage/Pricing';
import HowItWorks from './components/LandingPage/HowItWorks';
import Login from './components/Auth/Login'; // legacy file?
import Signup from './components/Auth/Signup'; // legacy file?
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import PodCreationPage from './components/PodCreationPage/PodCreationPage';
import LiveSession from './components/LiveSession/LiveSession';
import PodPage from './components/PodPage/PodPage';
import Chatbot from './components/Chat/Chatbot';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SchedulePage from './components/Schedule/SchedulePage';
import { AuthProvider } from './context/AuthContext';

import './index.css';
import './animations.css';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen relative overflow-x-hidden">
    {/* Global Background */}
    <div className="fixed inset-0 bg-nexus-dark-slate -z-20"></div>
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nexus-blue/20 via-nexus-dark-slate to-[#0f172a] -z-10"></div>

    <Header />
    <main className="flex-grow pt-16">
      {children}
    </main>
    <Footer />
  </div>
);

// Deleted mock pages

import EngineeringDashboard from './components/Engineering/EngineeringDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <Layout>
                <div className="landing-page">
                  <Hero />
                  <Features />
                  <HowItWorks />
                  <Pricing />
                </div>
              </Layout>
            }
          />

          {/* Authed Pages Routes */}
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-pod" element={<ProtectedRoute><PodCreationPage /></ProtectedRoute>} />
          <Route path="/engineering" element={<ProtectedRoute><Layout><EngineeringDashboard /></Layout></ProtectedRoute>} />
          <Route path="/live-session" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
          <Route path="/pod/:id" element={<ProtectedRoute><PodPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Layout><Chatbot /></Layout></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          
          <Route path="/how-it-works" element={<Layout><div className="flex justify-center pt-24 text-white">How it works</div></Layout>} />
          <Route path="/support" element={<Layout><div className="flex justify-center pt-24 text-white">Support</div></Layout>} />
          <Route path="/pricing" element={<Layout><div className="flex justify-center pt-24 text-white">Pricing</div></Layout>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
