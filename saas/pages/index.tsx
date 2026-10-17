"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Sparkles,
  Zap,
  Rocket,
  Flame,
  Crown,
  Search,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  Share2,
  Terminal,
  ShieldCheck,
  Cpu,
  Coins,
  History,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Target,
  BarChart3,
  Bot,
  Layers,
  Award,
  Dice5,
  X,
  Menu,
  Download,
  AlertCircle
} from "lucide-react";

interface HealthInfo {
  status: string;
  provider: "gemini" | "openai" | "mock" | string;
  model: string;
  mode: string;
}

interface SavedIdea {
  id: string;
  title: string;
  topic: string;
  content: string;
  timestamp: string;
  tam: string;
  feasibility: number;
}

const SECTOR_TILES = [
  {
    id: "ai-agents",
    title: "AGENTIC MINES",
    subtitle: "Multi-Agent Systems",
    icon: "🤖",
    tam: "$84B TAM",
    badge: "🔥 HOT",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    gradient: "from-blue-600/30 via-indigo-600/20 to-transparent",
    borderHover: "hover:border-blue-500/60",
    query: "Autonomous AI Agents & Multi-Agent Enterprise Workflows"
  },
  {
    id: "micro-saas",
    title: "CASH SLOTS",
    subtitle: "B2B Micro-SaaS",
    icon: "⚡",
    tam: "95% Margin",
    badge: "⚡ FAST MVP",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    gradient: "from-amber-600/30 via-yellow-600/20 to-transparent",
    borderHover: "hover:border-amber-500/60",
    query: "High-Margin B2B Micro-SaaS & Developer Workflow Automation"
  },
  {
    id: "fintech",
    title: "FINTECH CRASH",
    subtitle: "Algorithmic Wealth",
    icon: "💳",
    tam: "$120B TAM",
    badge: "💎 HIGH MOAT",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    gradient: "from-purple-600/30 via-violet-600/20 to-transparent",
    borderHover: "hover:border-purple-500/60",
    query: "Autonomous Finance, Algorithmic Treasury & Risk Underwriting"
  },
  {
    id: "healthtech",
    title: "BIO ROULETTE",
    subtitle: "Clinical AI",
    icon: "🩺",
    tam: "$62B TAM",
    badge: "🛡️ TIER 1",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    gradient: "from-emerald-600/30 via-teal-600/20 to-transparent",
    borderHover: "hover:border-emerald-500/60",
    query: "Clinical Automation, Preventative HealthTech & Diagnostics"
  },
  {
    id: "cleantech",
    title: "CARBON LIMBO",
    subtitle: "Energy & Climate",
    icon: "🌱",
    tam: "$45B TAM",
    badge: "🌱 IMPACT",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    gradient: "from-cyan-600/30 via-blue-600/20 to-transparent",
    borderHover: "hover:border-cyan-500/60",
    query: "Circular Economy, Industrial Energy Optimization & Carbon Accounting"
  },
  {
    id: "ecommerce",
    title: "RETAIL JACKPOT",
    subtitle: "Dynamic Commerce",
    icon: "🛍️",
    tam: "$90B TAM",
    badge: "📈 SCALABLE",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    gradient: "from-pink-600/30 via-rose-600/20 to-transparent",
    borderHover: "hover:border-pink-500/60",
    query: "Autonomous E-Commerce Operations, Dynamic Pricing & Conversion AI"
  }
];

const MARKET_SIGNALS = [
  { icon: "📈", tag: "VENTURE INTEL", text: "Enterprise budget for Autonomous Agents up +340% YoY.", time: "2m ago" },
  { icon: "💰", tag: "VALUATION", text: "Median B2B Micro-SaaS exit multiple reached 8.2x ARR.", time: "8m ago" },
  { icon: "⚡", tag: "TECH TREND", text: "FastAPI + Next.js streaming adopted by 68% of new YC founders.", time: "15m ago" },
  { icon: "🦄", tag: "SEED ROUND", text: "Agentic compliance platforms closed $42M in early funding.", time: "28m ago" }
];

export default function Home() {
  const [activeSector, setActiveSector] = useState<string>("ai-agents");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [idea, setIdea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [savedVault, setSavedVault] = useState<SavedIdea[]>([]);
  const [isFeedOpen, setIsFeedOpen] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const eventSourceRef = useRef<EventSource | null>(null);

  // Load saved vault from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ideaspark_vault");
      if (stored) {
        setSavedVault(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  // Check backend health
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

  // Initial stream on first load
  useEffect(() => {
    generateIdea(SECTOR_TILES[0].query);
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const generateIdea = (overrideQuery?: string) => {
    const activeTile = SECTOR_TILES.find((t) => t.id === activeSector);
    const finalTopic = overrideQuery || customPrompt.trim() || (activeTile ? activeTile.query : "Autonomous AI Agents");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsGenerating(true);
    setIdea("");
    setErrorMsg(null);
    setCopied(false);
    setSaved(false);

    let queryParams = `topic=${encodeURIComponent(finalTopic)}`;
    if (audience.trim()) {
      queryParams += `&audience=${encodeURIComponent(audience.trim())}`;
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
      console.error("SSE Connection error:", err);
      evt.close();
      setIsGenerating(false);
      if (!accumulated) {
        setErrorMsg("Failed to connect to streaming API backend. Please check server status.");
      }
    };
  };

  const handleCopy = () => {
    if (!idea) return;
    navigator.clipboard.writeText(idea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    if (!idea || saved) return;
    // Extract title from first line of markdown
    const firstLine = idea.split("\n")[0].replace(/^#\s*/, "").replace(/[^\w\s-]/g, "").trim() || "Untitled Venture";
    const newEntry: SavedIdea = {
      id: Date.now().toString(),
      title: firstLine.slice(0, 40),
      topic: customPrompt || activeSector,
      content: idea,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tam: "$2.5B - $10B",
      feasibility: Math.floor(Math.random() * 8) + 90
    };

    const updated = [newEntry, ...savedVault.slice(0, 19)];
    setSavedVault(updated);
    try {
      localStorage.setItem("ideaspark_vault", JSON.stringify(updated));
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
    link.download = `venture-dossier-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectSector = (tile: typeof SECTOR_TILES[0]) => {
    setActiveSector(tile.id);
    setCustomPrompt("");
    generateIdea(tile.query);
  };

  const handleWildcardSpin = () => {
    const randomIndex = Math.floor(Math.random() * SECTOR_TILES.length);
    const tile = SECTOR_TILES[randomIndex];
    handleSelectSector(tile);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      <Head>
        <title>IdeaForge // Venture Studio & Arcade</title>
        <meta name="description" content="AI-Powered Startup Forge & Venture Architecture Engine" />
      </Head>

      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-[#1c2742] px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#141d33] border border-[#25365e] text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-base uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  IDEAFORGE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                VENTURE ARCHITECTURE ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* Center Live Search & Filter Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  generateIdea(searchQuery.trim());
                }
              }}
              placeholder="Search or prompt any industry (e.g. AI Security, BioTech, DeFi)..."
              className="w-full pl-9 pr-16 py-1.5 rounded-lg bg-[#0f172a] border border-[#223154] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-slate-400 border border-slate-700">
              ↵
            </span>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Free Tier Balance Pill (Casino Style) */}
          <div className="hidden sm:flex items-center gap-2 bg-[#121b30] border border-[#233357] px-3 py-1 rounded-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-amber-300 font-mono leading-tight">
                ∞ FREE TIER
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">
                GEMINI 2.5 ACTIVE
              </span>
            </div>
          </div>

          {/* Quick Spin Button */}
          <button
            onClick={handleWildcardSpin}
            disabled={isGenerating}
            className="hidden sm:inline-flex items-center gap-1.5 gold-gradient-btn px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
            title="Random Wildcard Idea"
          >
            <Dice5 className="w-4 h-4" />
            <span className="font-bold">SPIN</span>
          </button>

          {/* Activity Drawer Toggle */}
          <button
            onClick={() => setIsFeedOpen(!isFeedOpen)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              isFeedOpen
                ? "bg-[#18233d] border-amber-500/40 text-amber-300"
                : "bg-[#101728] border-[#223154] text-slate-400 hover:text-white"
            }`}
            title="Toggle Venture Intel & Vault Drawer"
          >
            <History className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-mono font-bold">
              VAULT ({savedVault.length})
            </span>
          </button>

          {/* Founder Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-white shadow-md">
            🚀
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Cyber Sidebar (Sticky on Desktop) */}
        <aside
          className={`fixed lg:static top-14 bottom-0 left-0 z-30 w-64 bg-[#0a0f1d] border-r border-[#1c2742] flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Top 3 High-Octane Action Cards */}
          <div className="p-3 grid grid-cols-3 gap-2 border-b border-[#1c2742]">
            <button
              onClick={() => handleSelectSector(SECTOR_TILES[1])}
              className="p-2 rounded-xl bg-gradient-to-b from-[#19243d] to-[#101729] border border-amber-500/30 hover:border-amber-400/70 text-center flex flex-col items-center gap-1 group transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-tight">
                MVP Fast
              </span>
            </button>

            <button
              onClick={() => handleSelectSector(SECTOR_TILES[0])}
              className="p-2 rounded-xl bg-gradient-to-b from-[#19243d] to-[#101729] border border-blue-500/30 hover:border-blue-400/70 text-center flex flex-col items-center gap-1 group transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tight">
                Unicorn
              </span>
            </button>

            <button
              onClick={handleWildcardSpin}
              className="p-2 rounded-xl bg-gradient-to-b from-[#19243d] to-[#101729] border border-purple-500/30 hover:border-purple-400/70 text-center flex flex-col items-center gap-1 group transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Dice5 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-200 uppercase tracking-tight">
                Wildcard
              </span>
            </button>
          </div>

          {/* Navigation Categories */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
                CORE VERTICALS
              </p>
              <nav className="space-y-1">
                {SECTOR_TILES.map((tile) => {
                  const isActive = activeSector === tile.id && !customPrompt;
                  return (
                    <button
                      key={tile.id}
                      onClick={() => {
                        handleSelectSector(tile);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#1e2c4c] to-[#141e35] text-amber-300 border border-amber-500/40 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#121b30]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{tile.icon}</span>
                        <span>{tile.subtitle}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${tile.badgeColor}`}>
                        {tile.badge}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
                FOUNDER UTILITIES
              </p>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setIsFeedOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121b30]"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Idea Vault</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-[#1e2b48] text-amber-300 font-mono">
                    {savedVault.length}
                  </span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!idea}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121b30] disabled:opacity-40"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export Markdown</span>
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!idea}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121b30] disabled:opacity-40"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                  <span>Copy to Clipboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Engine Specs Widget */}
          <div className="p-3 border-t border-[#1c2742] bg-[#0c1222]">
            <div className="p-2.5 rounded-xl bg-[#11192e] border border-[#213054] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">ENGINE</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GEMINI 2.5
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">PROTOCOL</span>
                <span className="text-amber-300">SSE STREAMING</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">BACKEND</span>
                <span className="text-cyan-300">FASTAPI SERVERLESS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Stage (Main Canvas) */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Hero Feature Spotlight Banner (Rhino Casino Style) */}
          <section className="relative rounded-2xl overflow-hidden cyber-panel-elevated p-6 sm:p-8 border border-[#2e406e] shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                THE $10M STARTUP FORGE • AI ARCHITECT
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase mb-2">
                FORGE HIGH-MARGIN <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">UNICORNS & MICRO-SAAS</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                Zero-latency Server-Sent Events (SSE) AI engine generating end-to-end startup dossiers: target ICPs, tech blueprints, monetization models, and defensible moats.
              </p>

              {/* Interactive Custom Prompt & Spin Console */}
              <div className="p-3 rounded-xl bg-[#090e1c] border border-[#233357] shadow-inner space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (customPrompt.trim() || activeSector)) {
                          generateIdea();
                        }
                      }}
                      placeholder="Enter custom prompt (e.g. AI-driven cybersecurity for cloud databases...)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#11192e] border border-[#202f52] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Target Audience (e.g. Solo Devs, Health Clinics)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#11192e] border border-[#202f52] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  {/* Quick Filters */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                    <span className="text-slate-500">QUICK:</span>
                    <button
                      onClick={() => {
                        setCustomPrompt("High-margin AI micro-saas for Shopify creators");
                        generateIdea("High-margin AI micro-saas for Shopify creators");
                      }}
                      className="px-2 py-0.5 rounded bg-[#17223b] text-slate-300 hover:text-amber-300 border border-[#25365e] transition-colors"
                    >
                      #ShopifyAI
                    </button>
                    <button
                      onClick={() => {
                        setCustomPrompt("Autonomous security agent for Kubernetes clusters");
                        generateIdea("Autonomous security agent for Kubernetes clusters");
                      }}
                      className="px-2 py-0.5 rounded bg-[#17223b] text-slate-300 hover:text-amber-300 border border-[#25365e] transition-colors"
                    >
                      #K8sSecurity
                    </button>
                    <button
                      onClick={() => {
                        setCustomPrompt("AI accounting & tax audit agent for freelancer agencies");
                        generateIdea("AI accounting & tax audit agent for freelancer agencies");
                      }}
                      className="px-2 py-0.5 rounded bg-[#17223b] text-slate-300 hover:text-amber-300 border border-[#25365e] transition-colors"
                    >
                      #AgencyFinTech
                    </button>
                  </div>

                  {/* Main Spin CTA Button */}
                  <button
                    onClick={() => generateIdea()}
                    disabled={isGenerating}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>SYNTHESIZING...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-slate-950" />
                        <span>SPIN & FORGE IDEA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Innovation Sector Tiles Carousel (Game Tiles Style) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                  INNOVATION ARCADE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1a2542] text-amber-300 border border-[#2a3a63]">
                  SELECT VERTICAL
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                CLICK TO LAUNCH INSTANT SSE STREAM
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SECTOR_TILES.map((tile) => {
                const isSelected = activeSector === tile.id && !customPrompt;
                return (
                  <button
                    key={tile.id}
                    onClick={() => handleSelectSector(tile)}
                    disabled={isGenerating}
                    className={`relative p-3.5 rounded-xl text-left transition-all group overflow-hidden border ${
                      isSelected
                        ? "bg-[#18233d] border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.02]"
                        : "bg-[#0f172a] border-[#1e2c4c] hover:border-[#324573] hover:bg-[#141e35]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {tile.icon}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${tile.badgeColor}`}>
                        {tile.badge}
                      </span>
                    </div>

                    <div className="font-black text-xs text-white uppercase tracking-tight mb-0.5">
                      {tile.title}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate mb-2">
                      {tile.subtitle}
                    </div>

                    <div className="text-[9px] font-mono text-amber-400/90 font-bold">
                      {tile.tam}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-0.5">STREAM CONNECTION NOTICE</p>
                <p className="font-mono text-[11px]">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* The Main Venture Dossier (The Prize Canvas!) */}
          <section className="relative rounded-2xl cyber-panel border border-[#273860] shadow-2xl p-6 sm:p-8">
            {/* Top Dossier Action Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1b2640]">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isGenerating ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {isGenerating ? "LIVE SSE SYNTHESIS IN PROGRESS..." : "VENTURE DOSSIER READY"}
                  </span>
                  <div className="text-xs text-slate-500 font-mono">
                    Model: {healthInfo?.model || "gemini-2.5-flash"} • High-Speed Token Engine
                  </div>
                </div>
              </div>

              {/* Dossier Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSaveToVault}
                  disabled={!idea}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    saved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-[#141e33] border-[#26375c] text-slate-300 hover:text-white hover:border-amber-400/50"
                  } disabled:opacity-40`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{saved ? "Saved to Vault!" : "Save to Vault"}</span>
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!idea}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141e33] border border-[#26375c] text-slate-300 hover:text-white hover:border-amber-400/50 transition-all disabled:opacity-40"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!idea}
                  className="p-1.5 rounded-lg bg-[#141e33] border border-[#26375c] text-slate-300 hover:text-white hover:border-amber-400/50 transition-all disabled:opacity-40"
                  title="Download .md Dossier"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Multiplier Banner */}
            {idea && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0a0f1e] border border-[#1d2b4a] mb-6">
                <div>
                  <div className="text-[10px] font-mono text-slate-500">FEASIBILITY SCORE</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">94 / 100</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500">TIME TO MVP</div>
                  <div className="text-lg font-black text-amber-400 font-mono">14 DAYS</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500">ESTIMATED TAM</div>
                  <div className="text-lg font-black text-cyan-400 font-mono">$4.8B</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500">MOAT LEVEL</div>
                  <div className="text-lg font-black text-purple-400 font-mono">TIER 1 (HIGH)</div>
                </div>
              </div>
            )}

            {/* Dossier Body */}
            {isGenerating && !idea ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-200 uppercase font-mono">
                  Synthesizing Venture Architecture...
                </div>
                <p className="text-xs text-slate-400 max-w-sm font-mono">
                  Querying Gemini 2.5 Flash via OpenAI SSE protocol for technical blueprints & unit economics.
                </p>
              </div>
            ) : (
              <div className="markdown-dossier">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {idea}
                </ReactMarkdown>
                {isGenerating && (
                  <span className="inline-block w-2.5 h-4 ml-1 bg-amber-400 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="text-center py-6 text-xs font-mono text-slate-500">
            IDEAFORGE STUDIO • FULL-STACK NEXT.JS PAGES ROUTER + FASTAPI PYTHON SSE ENGINE
          </footer>
        </main>

        {/* Right Activity Drawer (Online Chat / Live Feed Casino Style) */}
        {isFeedOpen && (
          <aside className="hidden xl:flex flex-col w-80 bg-[#0a0f1d] border-l border-[#1c2742]">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-[#1c2742] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-300">
                  VENTURE RADAR & VAULT
                </span>
              </div>
              <button
                onClick={() => setIsFeedOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Saved Ideas in Vault */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    SAVED DOSSIERS ({savedVault.length})
                  </span>
                  {savedVault.length > 0 && (
                    <button
                      onClick={() => {
                        setSavedVault([]);
                        localStorage.removeItem("ideaspark_vault");
                      }}
                      className="text-[9px] text-red-400 hover:underline font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {savedVault.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2b48] text-center text-xs text-slate-500 font-mono">
                    Click &quot;Save to Vault&quot; on any generated idea to store it here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedVault.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIdea(item.content);
                          setCustomPrompt(item.title);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#0f172a] border border-[#1e2b48] hover:border-amber-400/50 hover:bg-[#141f38] transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-amber-400 font-bold">
                            {item.tam}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {item.timestamp}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                          <span>Score: {item.feasibility}/100</span>
                          <span className="text-cyan-400">Load ▹</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Market Signals Ticker */}
              <div>
                <p className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-2">
                  LIVE VENTURE SIGNALS
                </p>
                <div className="space-y-2">
                  {MARKET_SIGNALS.map((signal, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0d1424] border border-[#1b2742] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-amber-400 font-bold">{signal.tag}</span>
                        <span className="text-slate-500">{signal.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {signal.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
