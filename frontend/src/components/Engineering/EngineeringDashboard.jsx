import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GSDTool from "./GSDTool";
import RalphLoopTool from "./RalphLoopTool";
import CodeRabbitTool from "./CodeRabbitTool";
import { ListTodo, Repeat, Rabbit } from "lucide-react";

export default function EngineeringDashboard() {
  const [activeTab, setActiveTab] = useState("gsd");

  const tabs = [
    { id: "gsd", label: "GSD Tasker", icon: ListTodo, component: GSDTool },
    { id: "ralph", label: "Ralph Loop", icon: Repeat, component: RalphLoopTool },
    { id: "rabbit", label: "CodeRabbit", icon: Rabbit, component: CodeRabbitTool },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab).component;

  return (
    <div className="min-h-screen bg-nexus-dark-slate pt-24 pb-12 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-bronze/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexus-blue/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="mb-12 text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-nexus-bronze/10 rounded-full border border-nexus-bronze/30 mb-6"
          >
            <span className="text-xs font-bold text-nexus-bronze uppercase tracking-widest">Engineering Suite</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-white mb-4"
          >
            Engineering <span className="text-nexus-bronze italic">Intelligence</span>
          </motion.h1>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-nexus-blue/30 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${activeTab === tab.id ? "text-nexus-dark-slate" : "text-gray-400 hover:text-white"
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-nexus-bronze rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 relative z-10 ${activeTab === tab.id ? "text-nexus-dark-slate" : "group-hover:text-nexus-bronze"}`} />
                <span className="font-bold text-sm relative z-10 tracking-wide uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Tool View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto h-[650px]"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
