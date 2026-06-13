import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ListTodo, Loader2, Plus, Send, Copy, Check } from "lucide-react";

export default function GSDTool() {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(steps.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBreakTask = async () => {
    if (!task.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/engineering/gsd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await response.json();
      setSteps(data.steps || []);
    } catch (error) {
      console.error("GSD Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-nexus-blue/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-nexus-bronze/20 rounded-lg">
          <ListTodo className="text-nexus-bronze w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">GSD (Get Shit Done)</h2>
          <p className="text-sm text-gray-400">Breaks big tasks into atomic steps</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full bg-nexus-dark-slate/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-bronze/50 transition-all"
            onKeyPress={(e) => e.key === "Enter" && handleBreakTask()}
          />
        </div>
        <button
          onClick={handleBreakTask}
          disabled={loading}
          className="bg-nexus-bronze text-nexus-dark-slate px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span>Break</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-nexus-bronze font-bold uppercase tracking-widest text-xs">Atomic Steps</h3>
          {steps.length > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy All"}
            </button>
          )}
        </div>
        <AnimatePresence mode="popLayout">
          {steps.length > 0 ? (
            steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-all group"
              >
                <div className="h-6 w-6 rounded-full border-2 border-nexus-bronze/50 flex items-center justify-center flex-shrink-0 group-hover:border-nexus-bronze transition-colors">
                  <span className="text-xs font-bold text-nexus-bronze">{idx + 1}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{step}</p>
                <CheckCircle2 className="w-5 h-5 text-gray-600 ml-auto group-hover:text-nexus-bronze/50 transition-colors" />
              </motion.div>
            ))
          ) : !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-2xl py-12">
              <Plus className="w-12 h-12 mb-4 opacity-20" />
              <p>Your atomic task list will appear here</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
