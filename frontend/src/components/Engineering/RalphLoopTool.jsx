import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Loader2, Play, CheckCircle, Terminal, Copy, Check } from "lucide-react";

export default function RalphLoopTool() {
  const [prd, setPrd] = useState("");
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLoop = async () => {
    if (!prd.trim()) return;
    setLoading(true);
    setLog([]);
    setSummary("");
    try {
      const response = await fetch("/api/engineering/ralph-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd }),
      });
      const data = await response.json();
      setLog(data.log || []);
      setSummary(data.summary || "");
    } catch (error) {
      console.error("Ralph Loop Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-nexus-blue/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-nexus-bronze/20 rounded-lg">
          <Repeat className="text-nexus-bronze w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Ralph Loop</h2>
          <p className="text-sm text-gray-400">PRD → Build → Check → Repeat</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <textarea
          value={prd}
          onChange={(e) => setPrd(e.target.value)}
          placeholder="Paste your PRD or technical requirements here..."
          className="w-full h-32 bg-nexus-dark-slate/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nexus-bronze/50 transition-all resize-none"
        />
        <button
          onClick={handleRunLoop}
          disabled={loading}
          className="w-full bg-nexus-bronze text-nexus-dark-slate py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          <span>Start Loop</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Terminal className="w-3 h-3" />
            <span>Loop Status Log</span>
          </div>
          <AnimatePresence mode="popLayout">
            {log.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-nexus-bronze mr-1">$</span>
                <span className={entry.status === "completed" ? "text-emerald-400" : "text-nexus-slate animate-pulse"}>
                  {entry.message}
                </span>
                {entry.status === "completed" && <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" />}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && log.length === 0 && (
            <div className="text-gray-600 italic">Initializing agentic loop environments...</div>
          )}
        </div>

        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-nexus-bronze/10 border border-nexus-bronze/20 rounded-xl p-4 relative group"
          >
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white transition-colors bg-nexus-dark-slate/50 rounded-lg opacity-0 group-hover:opacity-100"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <h3 className="text-nexus-bronze text-xs font-bold uppercase mb-2">Build Summary</h3>
            <p className="text-gray-300 text-sm italic pr-8">"{summary}"</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
