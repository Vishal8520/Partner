import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rabbit, Loader2, Search, Bug, Zap, ShieldCheck, Code, Copy, Check } from "lucide-react";

export default function CodeRabbitTool() {
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopySuggestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleReviewCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const response = await fetch("/api/engineering/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("CodeRabbit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const icons = [Bug, Zap, ShieldCheck];

  return (
    <div className="bg-partner-blue/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-partner-bronze/20 rounded-lg">
          <Rabbit className="text-partner-bronze w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">CodeRabbit</h2>
          <p className="text-sm text-gray-400">Real-time code review & quality check</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-6">
        <div className="relative flex-grow min-h-[200px]">
          <div className="absolute top-3 left-3 flex items-center gap-2 text-gray-500 z-10 text-xs">
            <Code className="w-3 h-3" />
            <span>Editor</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code snippet here..."
            className="w-full h-full bg-partner-dark-slate/40 border border-white/10 rounded-xl px-4 pt-10 pb-4 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-partner-bronze/50 transition-all resize-none custom-scrollbar"
          />
        </div>

        <button
          onClick={handleReviewCode}
          disabled={loading}
          className="bg-partner-bronze text-partner-dark-slate py-4 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>Run Review</span>
        </button>

        <div className="space-y-3 pb-2">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, idx) => {
              const Icon = icons[idx % icons.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col gap-4 bg-partner-bronze/5 border border-partner-bronze/20 p-4 rounded-xl group relative"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-4">
                      <div className="p-1.5 bg-partner-bronze/10 rounded-lg mt-0.5">
                        <Icon className="text-partner-bronze w-4 h-4" />
                      </div>
                      <p className="text-gray-300 text-sm italic flex-1">"{suggestion}"</p>
                    </div>
                    <button
                      onClick={() => handleCopySuggestion(suggestion, idx)}
                      className="p-1.5 text-gray-500 hover:text-white transition-colors bg-partner-dark-slate/50 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {loading && suggestions.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-partner-bronze rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-partner-bronze rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-partner-bronze rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Analyzing code patterns...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
