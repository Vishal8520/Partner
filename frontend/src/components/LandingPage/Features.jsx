// components/LandingPage/Features.jsx
import { SparklesIcon, AcademicCapIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const Features = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: "GSD Task Decomposition",
      description: "Converts high-level goals into atomic, actionable steps to eliminate hallucinations and context rot.",
    },
    {
      icon: AcademicCapIcon,
      title: "Ralph Loop Building",
      description: "An autonomous agentic loop that reads your PRD, builds code, checks for errors, and iterates until correct.",
    },
    {
      icon: ChartBarIcon,
      title: "CodeRabbit Review",
      description: "Real-time AI code review that catches bugs and performance issues before they hit production.",
    },
    {
      icon: UserGroupIcon,
      title: "Autonomous Integration",
      description: "Seamlessly integrates into your existing workflow to turn AI from a simple chatbot into a powerful engineer.",
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-nexus-dark-slate via-nexus-blue to-nexus-dark-slate">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-transparent bg-gradient-to-r from-nexus-bronze to-nexus-porcelain bg-clip-text mb-8">
          Antigravity Engineering Suite
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 border border-nexus-slate/30 rounded-xl bg-nexus-blue/30 backdrop-blur-lg">
              <feature.icon className="w-12 h-12 mb-4 text-nexus-bronze" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;