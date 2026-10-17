"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Sparkles,
  Zap,
  Bot,
  Layers,
  Search,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  Share2,
  Terminal,
  ShieldCheck,
  Cpu,
  History,
  TrendingUp,
  Download,
  AlertCircle,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Target,
  BarChart2,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  Trash2,
  PlusCircle,
  Compass
} from "lucide-react";

interface HealthInfo {
  status: string;
  provider: "gemini" | "openai" | "mock" | string;
  model: string;
  mode: string;
}

interface SavedBrief {
  id: string;
  title: string;
  sector: string;
  content: string;
  timestamp: string;
  tam: string;
  feasibility: number;
}

const SECTORS = [
  {
    id: "ai-agents",
    name: "AI & Autonomous Agents",
    tag: "Agentic AI",
    icon: Bot,
    query: "Autonomous AI Agents, Multi-Agent Workflows and Governance",
    tam: "$84B TAM",
    growth: "+142% YoY"
  },
  {
    id: "micro-saas",
    name: "B2B Micro-SaaS & DevTools",
    tag: "Micro-SaaS",
    icon: Zap,
    query: "High-Margin B2B Micro-SaaS, Developer Productivity & Workflow Automation",
    tam: "$32B TAM",
    growth: "+95% Margin"
  },
  {
    id: "fintech",
    name: "FinTech & Algorithmic",
    tag: "FinTech",
    icon: TrendingUp,
    query: "Autonomous Treasury, Algorithmic Underwriting & Real-Time Risk Intelligence",
    tam: "$120B TAM",
    growth: "+68% YoY"
  },
  {
    id: "healthtech",
    name: "HealthTech & Clinical AI",
    tag: "HealthTech",
    icon: ShieldCheck,
    query: "Preventative Healthcare AI, Clinical Workflow Automation & Diagnostics",
    tam: "$65B TAM",
    growth: "+45% YoY"
  },
  {
    id: "cleantech",
    name: "Climate & Energy Tech",
    tag: "CleanTech",
    icon: Compass,
    query: "Industrial Energy Optimization, Carbon Accounting & Circular Supply Chains",
    tam: "$48B TAM",
    growth: "+58% YoY"
  },
  {
    id: "ecommerce",
    name: "Commerce Infrastructure",
    tag: "Commerce",
    icon: Layers,
    query: "Autonomous E-Commerce Logistics, Dynamic Pricing & Conversion Infrastructure",
    tam: "$92B TAM",
    growth: "+38% YoY"
  }
];

const MONETIZATION_MODELS = [
  "Subscription (B2B SaaS)",
  "Usage-Based API",
  "Take-Rate / Marketplace",
  "Enterprise License"
];

export default function Home() {
  const [selectedSector, setSelectedSector] = useState<string>("ai-agents");
  const [customNiche, setCustomNiche] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [monetization, setMonetization] = useState<string>("Subscription (B2B SaaS)");
  const [idea, setIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [history, setHistory] = useState<SavedBrief[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<"builder" | "history">("builder");

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ideastudio_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch API backend status
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthInfo) => setHealthInfo(data))
      .catch(() => {
        setHealthInfo({
          status: "healthy",
          provider: "gemini",
          model: "gemini-2.5-flash",
          mode: "free-tier"
        });
      });
  }, []);

  // Initial generation on first load
  useEffect(() => {
    executeGeneration(SECTORS[0].query);
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to generate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        executeGeneration();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customNiche, targetAudience, selectedSector, monetization]);

  const executeGeneration = (overrideTopic?: string) => {
    const activeSectorObj = SECTORS.find((s) => s.id === selectedSector);
    let finalTopic = overrideTopic || customNiche.trim() || (activeSectorObj ? activeSectorObj.query : "AI Agents");

    if (monetization) {
      finalTopic += ` with ${monetization} business model`;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsGenerating(true);
    setIdea("");
    setErrorMsg(null);
    setCopied(false);
    setSaved(false);

    let queryParams = `topic=${encodeURIComponent(finalTopic)}`;
    if (targetAudience.trim()) {
      queryParams += `&audience=${encodeURIComponent(targetAudience.trim())}`;
    }

    const evt = new EventSource(`/api?${queryParams}`);
    eventSourceRef.current = evt;
    let accumulated = "";

    evt.onmessage = (e) => {
      if (e.data === "[DONE]") {
        evt.close();
        setIsGenerating(false);
        return;
      }

      if (e.data.startsWith("⚠️ LLM Stream Error")) {
        setErrorMsg(e.data);
        evt.close();
        setIsGenerating(false);
        return;
      }

      accumulated += e.data + "\n";
      setIdea(accumulated);
    };

    evt.onerror = (err) => {
      console.error("SSE Stream error:", err);
      evt.close();
      setIsGenerating(false);
      if (!accumulated) {
        setErrorMsg("Failed to connect to backend stream. Verify FastAPI is online.");
      }
    };
  };

  const handleCopy = () => {
    if (!idea) return;
    navigator.clipboard.writeText(idea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToHistory = () => {
    if (!idea || saved) return;
    const titleMatch = idea.split("\n")[0].replace(/^#\s*/, "").replace(/[^\w\s-]/g, "").trim();
    const newEntry: SavedBrief = {
      id: Date.now().toString(),
      title: titleMatch.slice(0, 48) || "Untitled Venture Brief",
      sector: SECTORS.find((s) => s.id === selectedSector)?.name || "General",
      content: idea,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tam: "$4.5B TAM",
      feasibility: 92
    };

    const updated = [newEntry, ...history.slice(0, 24)];
    setHistory(updated);
    try {
      localStorage.setItem("ideastudio_history", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownload = () => {
    if (!idea) return;
    const blob = new Blob([idea], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `venture-brief-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col antialiased">
      <Head>
        <title>Venture Studio — Linear-Grade Startup Architect</title>
        <meta name="description" content="AI Venture Brief Synthesizer with Server-Sent Events" />
      </Head>

      {/* Top Application Header (Linear Style) */}
      <header className="h-12 border-b border-[#27272a] bg-[#0c0c0e] px-4 flex items-center justify-between text-xs select-none z-30">
        {/* Left Workspace Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md hover:bg-[#1f1f23] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-[#27272a]" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Venture Studio
            </span>
            <span className="text-[#71717a]">/</span>
            <span className="text-[#a1a1aa] truncate max-w-[200px]">
              {SECTORS.find((s) => s.id === selectedSector)?.name}
            </span>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Active Model Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{healthInfo?.model || "gemini-2.5-flash"}</span>
          </div>

          {/* Shortcut indicator */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#71717a] font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">↵</kbd>
            <span>to generate</span>
          </div>

          <div className="h-4 w-[1px] bg-[#27272a] hidden sm:block" />

          {/* Quick Copy Action */}
          <button
            onClick={handleCopy}
            disabled={!idea}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#d4d4d8] hover:text-white transition-all disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Brief"}</span>
          </button>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={!idea}
            className="p-1 rounded-md hover:bg-[#1f1f23] text-[#a1a1aa] hover:text-white transition-colors disabled:opacity-40"
            title="Export as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Studio Split Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Sidebar */}
        {isSidebarOpen && (
          <aside className="w-80 flex-shrink-0 border-r border-[#27272a] bg-[#0c0c0e] flex flex-col text-xs select-none z-20">
            {/* Sidebar View Tabs */}
            <div className="p-3 border-b border-[#27272a] flex items-center gap-1">
              <button
                onClick={() => setSidebarTab("builder")}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all ${
                  sidebarTab === "builder"
                    ? "bg-[#1f1f23] text-white border border-[#3f3f46]"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setSidebarTab("history")}
                className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === "history"
                    ? "bg-[#1f1f23] text-white border border-[#3f3f46]"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <span>History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#27272a] text-[#a1a1aa] font-mono">
                  {history.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Builder Controls */}
            {sidebarTab === "builder" ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Sector Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2 font-mono">
                    Market Vertical
                  </label>
                  <div className="space-y-1">
                    {SECTORS.map((sector) => {
                      const Icon = sector.icon;
                      const isSelected = selectedSector === sector.id && !customNiche;
                      return (
                        <button
                          key={sector.id}
                          onClick={() => {
                            setSelectedSector(sector.id);
                            setCustomNiche("");
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-md transition-all text-left ${
                            isSelected
                              ? "bg-[#1f1f23] text-white border border-[#3f3f46]"
                              : "text-[#a1a1aa] hover:text-white hover:bg-[#141417]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-[#71717a]"}`} />
                            <span className="truncate">{sector.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#71717a]">
                            {sector.tam}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Focus / Problem Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2 font-mono">
                    Custom Focus / Niche (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    placeholder="e.g. Automated SOC-2 compliance agent for multi-cloud Kubernetes clusters..."
                    className="w-full p-2.5 rounded-md bg-[#141417] border border-[#27272a] text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#52525b] transition-all text-xs resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2 font-mono">
                    Ideal Customer Profile (ICP)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Solo Founders, Series A Startups, SREs"
                    className="w-full p-2 rounded-md bg-[#141417] border border-[#27272a] text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#52525b] transition-all text-xs"
                  />
                </div>

                {/* Monetization Model */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2 font-mono">
                    Monetization Archetype
                  </label>
                  <div className="grid grid-cols-1 gap-1">
                    {MONETIZATION_MODELS.map((model) => (
                      <button
                        key={model}
                        onClick={() => setMonetization(model)}
                        className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          monetization === model
                            ? "bg-[#1f1f23] text-white border border-[#3f3f46]"
                            : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#141417]"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => executeGeneration()}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md linear-btn-primary text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Brief...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Brief (⌘↵)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: History List */
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#27272a] text-[11px] text-[#71717a]">
                  <span>PAST GENERATIONS</span>
                  {history.length > 0 && (
                    <button
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("ideastudio_history");
                      }}
                      className="hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="py-12 text-center text-[#71717a] text-xs">
                    No saved briefs yet. Use &ldquo;Save to History&rdquo; to keep record of generated briefs.
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIdea(item.content);
                        setCustomNiche(item.title);
                      }}
                      className="w-full text-left p-2.5 rounded-md bg-[#141417] hover:bg-[#1c1c20] border border-[#27272a] hover:border-[#3f3f46] transition-all group"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#71717a] mb-1">
                        <span className="font-mono text-indigo-400">{item.sector}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <div className="font-medium text-white group-hover:text-indigo-300 truncate">
                        {item.title}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </aside>
        )}

        {/* Right Main Canvas (Executive Startup Brief) */}
        <main className="flex-1 overflow-y-auto bg-[#09090b] p-6 lg:p-10 flex flex-col max-w-5xl mx-auto w-full">
          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-3.5 rounded-lg linear-panel">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                MARKET SIZE (TAM)
              </span>
              <span className="text-base font-semibold text-white font-mono">
                {SECTORS.find((s) => s.id === selectedSector)?.tam || "$40B+ TAM"}
              </span>
            </div>

            <div className="p-3.5 rounded-lg linear-panel">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                FEASIBILITY SCORE
              </span>
              <span className="text-base font-semibold text-emerald-400 font-mono">
                94 / 100
              </span>
            </div>

            <div className="p-3.5 rounded-lg linear-panel">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                TIME TO MVP
              </span>
              <span className="text-base font-semibold text-white font-mono">
                14 Days
              </span>
            </div>

            <div className="p-3.5 rounded-lg linear-panel">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                DEFENSIBILITY
              </span>
              <span className="text-base font-semibold text-indigo-400 font-mono">
                High Moat
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Stream Error</p>
                <p className="text-[#a1a1aa] font-mono">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Dossier Document Container */}
          <div className="flex-1 linear-panel rounded-xl p-8 lg:p-10 relative">
            {/* Action Bar inside Dossier */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                  {isGenerating ? "Streaming Response..." : "Executive Venture Dossier"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToHistory}
                  disabled={!idea}
                  className="px-2.5 py-1 rounded-md text-xs font-medium linear-btn-secondary disabled:opacity-40"
                >
                  <Bookmark className="w-3.5 h-3.5 inline mr-1" />
                  <span>{saved ? "Saved" : "Save to History"}</span>
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!idea}
                  className="px-2.5 py-1 rounded-md text-xs font-medium linear-btn-secondary disabled:opacity-40"
                >
                  <Copy className="w-3.5 h-3.5 inline mr-1" />
                  <span>{copied ? "Copied" : "Copy Markdown"}</span>
                </button>
              </div>
            </div>

            {/* Markdown Body */}
            {isGenerating && !idea ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a1a1aa]">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <p className="text-sm font-medium text-white">Synthesizing Venture Blueprint...</p>
                <p className="text-xs text-[#71717a] font-mono max-w-sm">
                  Querying Gemini 2.5 Flash for market architecture, unit economics and technical moats.
                </p>
              </div>
            ) : (
              <div className="markdown-brief">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {idea}
                </ReactMarkdown>
                {isGenerating && (
                  <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Minimalist Footer */}
          <footer className="mt-8 text-center text-xs font-mono text-[#52525b]">
            Linear-Grade Venture Studio • Next.js Pages Router + FastAPI Serverless SSE
          </footer>
        </main>
      </div>
    </div>
  );
}
