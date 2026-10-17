"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Layers, 
  AlertCircle,
  Lightbulb,
  Cpu,
  ShieldCheck,
  Terminal
} from "lucide-react";

interface HealthInfo {
  status: string;
  provider: "gemini" | "openai" | "mock" | string;
  model: string;
  mode: string;
}

const PRESET_TOPICS = [
  { id: "ai-agents", label: "AI Agents", icon: "🤖", query: "Autonomous AI Agents & Multi-Agent Workflows" },
  { id: "micro-saas", label: "Micro-SaaS", icon: "⚡", query: "B2B Micro-SaaS & Developer Productivity Tools" },
  { id: "healthtech", label: "HealthTech", icon: "🩺", query: "Preventative HealthTech and Clinical Automation" },
  { id: "fintech", label: "FinTech", icon: "💳", query: "Autonomous Finance, WealthTech & Algorithmic Accounting" },
  { id: "cleantech", label: "Climate & Green", icon: "🌱", query: "Circular Economy, Energy Optimization & Carbon Accounting" },
  { id: "ecommerce", label: "E-Commerce", icon: "🛍️", query: "Autonomous E-Commerce Operations & Dynamic Merchandising" },
];

export default function Home() {
  const [topic, setTopic] = useState<string>("Autonomous AI Agents & Multi-Agent Workflows");
  const [selectedPreset, setSelectedPreset] = useState<string>("ai-agents");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [idea, setIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Check backend health on initial load
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthInfo) => setHealthInfo(data))
      .catch(() => {
        // Fallback if backend proxy not yet reached
        setHealthInfo({
          status: "connecting",
          provider: "mock",
          model: "local",
          mode: "demo-fallback"
        });
      });
  }, []);

  // Initial automatic generation
  useEffect(() => {
    generateNewIdea("Autonomous AI Agents & Multi-Agent Workflows");

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const generateNewIdea = (topicToUse?: string) => {
    const finalTopic = topicToUse || customPrompt.trim() || topic;
    if (!finalTopic) return;

    // Reset states
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsGenerating(true);
    setIdea("");
    setErrorMsg(null);
    setCopied(false);

    let queryParams = `topic=${encodeURIComponent(finalTopic)}`;
    if (audience.trim()) {
      queryParams += `&audience=${encodeURIComponent(audience.trim())}`;
    }

    const evt = new EventSource(`/api?${queryParams}`);
    eventSourceRef.current = evt;
    let buffer = "";

    evt.onmessage = (e) => {
      if (e.data === "[DONE]") {
        evt.close();
        setIsGenerating(false);
        return;
      }

      // Check for error payload
      if (e.data.startsWith("⚠️ LLM Stream Error")) {
        setErrorMsg(e.data);
        evt.close();
        setIsGenerating(false);
        return;
      }

      buffer += e.data + "\n";
      setIdea(buffer);
    };

    evt.onerror = (err) => {
      console.error("SSE connection error or closed:", err);
      evt.close();
      setIsGenerating(false);
      if (!buffer) {
        setErrorMsg("Failed to connect to streaming backend. Check if FastAPI backend is running.");
      }
    };
  };

  const handleCopy = () => {
    if (!idea) return;
    navigator.clipboard.writeText(idea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setSelectedPreset(preset.id);
    setTopic(preset.query);
    setCustomPrompt("");
    generateNewIdea(preset.query);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Head>
        <title>IdeaSpark - AI Business Idea Generator</title>
      </Head>
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                IdeaSpark
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AI-Powered Business Idea Generator • MLOps Full-Stack App
              </p>
            </div>
          </div>

          {/* Provider Badge */}
          <div className="flex items-center gap-2">
            {healthInfo?.provider === "gemini" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Google Gemini Free API Active ({healthInfo.model})
              </span>
            ) : healthInfo?.provider === "openai" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800 shadow-sm">
                <Cpu className="w-3.5 h-3.5" />
                OpenAI Active ({healthInfo.model})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 shadow-sm">
                <Lightbulb className="w-3.5 h-3.5" />
                Demo Stream Mode (Add Gemini Key to .env)
              </span>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Generate High-Potential <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SaaS & AI Ideas</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time streaming intelligence for startup ideas, complete with business models, feature blueprints, and monetization strategies.
          </p>
        </section>

        {/* Topic Selector & Generator Controls */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Choose an Innovation Sector:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isGenerating}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    selectedPreset === preset.id && !customPrompt
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Custom Topic or Niche (Optional):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value) setSelectedPreset("");
                }}
                placeholder="e.g. AI-driven cybersecurity for cloud databases..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Target Audience (Optional):
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Solo Founders, Enterprise..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Real-time SSE stream connected to FastAPI</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => generateNewIdea()}
                disabled={isGenerating}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Streaming Idea...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate New Idea</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Stream Notice</p>
              <p className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Generated Content Card */}
        <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-10 transition-all">
          {/* Card Top Actions */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                {isGenerating ? "AI Thinking & Streaming..." : "Idea Ready"}
              </span>
            </div>

            {idea && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Copy to Markdown"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Card Body */}
          {isGenerating && !idea ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 animate-bounce">
                <Lightbulb className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Synthesizing startup concept...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Querying language model with venture architecture guidelines.
              </p>
            </div>
          ) : (
            <div className="markdown-content text-slate-800 dark:text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {idea}
              </ReactMarkdown>
              {isGenerating && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>
            Built for MLOps Course Assignment • Next.js Pages Router + FastAPI SSE Engine
          </p>
        </footer>
      </div>
    </div>
  );
}
