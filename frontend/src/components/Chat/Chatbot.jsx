import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chatbot.css';
import { Send, Upload, Trash2, MessageSquare, BookOpen, ThumbsUp, ThumbsDown, Sparkles, Brain, Zap, FileText, Bot } from 'lucide-react';

const QUICK_PROMPTS = [
    { icon: <Sparkles size={14} />, label: "Summarize today's topics", text: "Give me a summary of the topics we've covered so far." },
    { icon: <Brain size={14} />, label: "Quiz me", text: "Quiz me on the important concepts from the syllabus." },
    { icon: <Zap size={14} />, label: "Key concepts", text: "What are the most important key concepts I should focus on?" },
    { icon: <FileText size={14} />, label: "Study plan", text: "Help me create a study plan for upcoming exams based on the syllabus." },
];

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-nexus-blue flex items-center justify-center flex-shrink-0 shadow-lg shadow-nexus-blue/20">
                <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                <span className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    </div>
);

const INTENT_COLORS = {
    'explain': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'quiz': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'summarize': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'study': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const Chatbot = ({ podId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = async (e, overrideText) => {
        if (e) e.preventDefault();
        const messageText = overrideText || input;
        if (!messageText.trim()) return;

        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const placeholderId = Date.now();
        setMessages(prev => [...prev, { role: 'assistant', content: '', placeholderId, loading: true }]);

        try {
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, chat_history: messages })
            });

            if (!response.ok) throw new Error("Failed to connect to AI server.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.token) {
                                fullContent += data.token;
                                setMessages(prev => prev.map(msg =>
                                    msg.placeholderId === placeholderId
                                        ? { ...msg, content: fullContent, loading: false }
                                        : msg
                                ));
                            } else if (data.done) {
                                setMessages(prev => prev.map(msg =>
                                    msg.placeholderId === placeholderId
                                        ? { ...msg, message_id: data.message_id, intent: data.intent, done: true }
                                        : msg
                                ));
                            }
                        } catch (e) { /* ignore parse errors */ }
                    }
                }
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.placeholderId === placeholderId
                    ? { ...msg, content: "⚠️ Couldn't reach Nexus AI. Please ensure the backend is running.", loading: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleFeedback = async (messageId, rating) => {
        try {
            await fetch('/api/chat/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message_id: messageId, rating })
            });
            setMessages(prev => prev.map(msg =>
                msg.message_id === messageId ? { ...msg, feedbackGiven: rating } : msg
            ));
        } catch (error) { console.error("Failed to submit feedback", error); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/chat/upload', { method: 'POST', body: formData });
            if (response.ok) {
                setUploadedFiles(prev => [...prev, file.name]);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ **${file.name}** has been uploaded and indexed into Nexus AI's knowledge base. You can now ask questions about its content!`,
                    done: true
                }]);
            } else {
                alert("Failed to upload document.");
            }
        } catch { alert("Error connecting to server for upload."); }
        finally { setIsUploading(false); }
    };

    const clearHistory = async () => {
        if (!window.confirm("Clear all AI memory and chat history?")) return;
        try {
            await fetch('/api/chat/clear', { method: 'POST' });
            setMessages([]);
            setUploadedFiles([]);
        } catch { alert("Failed to clear database."); }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="chatbot-container h-[calc(100vh-160px)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-nexus-blue flex items-center justify-center shadow-lg shadow-nexus-blue/30">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#1e293b]"></div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Nexus AI</h1>
                        <p className="text-xs text-emerald-400 mt-0.5">Online · Ready to help</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {uploadedFiles.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-nexus-slate bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <FileText size={12} className="text-nexus-bronze" />
                            <span>{uploadedFiles.length} doc{uploadedFiles.length > 1 ? 's' : ''} indexed</span>
                        </div>
                    )}
                    <button onClick={clearHistory} className="p-2 text-nexus-slate hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Clear History">
                        <Trash2 size={18} />
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2 bg-nexus-blue/20 text-nexus-blue border border-nexus-blue/30 hover:bg-nexus-blue hover:text-white rounded-lg cursor-pointer transition-all text-sm font-medium">
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-nexus-blue border-t-transparent rounded-full animate-spin" />
                        ) : <Upload size={16} />}
                        <span>{isUploading ? 'Uploading...' : 'Upload Doc'}</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" disabled={isUploading} />
                    </label>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area flex-grow overflow-y-auto glass rounded-2xl border border-white/10 custom-scrollbar p-6">
                {!hasMessages ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        {/* Welcome State */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-nexus-blue/20 border border-nexus-blue/20 flex items-center justify-center mb-6 shadow-lg">
                            <Brain size={36} className="text-nexus-blue" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ask Nexus AI</h2>
                        <p className="text-nexus-slate max-w-sm mb-8 text-sm leading-relaxed">
                            I'm powered by your course materials, syllabus, and attendance data. Ask me anything about your studies!
                        </p>
                        {/* Quick Prompts */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(null, prompt.text)}
                                    className="flex items-center gap-2.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left text-sm text-nexus-slate hover:bg-nexus-blue/10 hover:border-nexus-blue/30 hover:text-white transition-all group"
                                >
                                    <span className="text-nexus-bronze group-hover:text-nexus-blue transition-colors">{prompt.icon}</span>
                                    <span>{prompt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="flex items-start gap-3 max-w-[82%]">
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-nexus-blue flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-nexus-blue/20">
                                            <Bot size={15} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-5 py-3.5 rounded-2xl shadow-lg ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-br from-nexus-blue to-violet-600 text-white rounded-tr-none'
                                                : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-none'
                                        }`}>
                                            {msg.loading ? (
                                                <div className="flex gap-1.5 items-center py-1">
                                                    <span className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                                                    <span className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                                                </div>
                                            ) : (
                                                <ReactMarkdown
                                                    className="prose prose-invert max-w-none text-[14.5px] leading-relaxed"
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>

                                        {/* Intent badge + feedback */}
                                        {msg.role === 'assistant' && msg.done && (
                                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                                {msg.intent && (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest font-medium ${INTENT_COLORS[msg.intent] || 'bg-white/5 text-gray-500 border-white/10'}`}>
                                                        {msg.intent}
                                                    </span>
                                                )}
                                                {msg.message_id && !msg.feedbackGiven && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleFeedback(msg.message_id, 1)} className="p-1 text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all" title="Helpful">
                                                            <ThumbsUp size={13} />
                                                        </button>
                                                        <button onClick={() => handleFeedback(msg.message_id, -1)} className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Not Helpful">
                                                            <ThumbsDown size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                                {msg.feedbackGiven && (
                                                    <span className="text-[11px] text-gray-500">Thanks for the feedback!</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-bronze to-yellow-500 flex items-center justify-center flex-shrink-0 mt-1 text-[#1e293b] font-black text-xs shadow-lg">
                                            ME
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                <div className="flex-grow relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Nexus AI anything about your studies..."
                        className="w-full pl-5 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue/40 focus:border-nexus-blue/40 transition-all placeholder:text-gray-500 text-sm"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-4 bg-gradient-to-br from-nexus-blue to-violet-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-nexus-blue/30 flex-shrink-0"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </form>

            {/* Quick prompt chips (when in conversation) */}
            {hasMessages && !isLoading && (
                <div className="flex gap-2 flex-wrap">
                    {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => handleSendMessage(null, prompt.text)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-nexus-slate hover:bg-nexus-blue/10 hover:border-nexus-blue/30 hover:text-white transition-all"
                        >
                            <span className="text-nexus-bronze">{prompt.icon}</span>
                            {prompt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Chatbot;
