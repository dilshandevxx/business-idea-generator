"use client";

import Head from "next/head";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Sparkles,
  Zap,
  Bot,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Layers,
  Lock,
  Cpu,
  Terminal,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-indigo-500 selection:text-white">
      <Head>
        <title>Venture Studio — AI-Powered Startup Architect</title>
        <meta name="description" content="Generate high-margin AI and SaaS business ideas with real-time SSE streaming and verified authentication." />
      </Head>

      {/* Navigation */}
      <header className="border-b border-[#27272a] bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">
            Venture Studio
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hidden sm:inline">
            v2.1 Auth
          </span>
        </div>

        <nav className="flex items-center gap-3">
          {isClerkConfigured ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3.5 py-1.5 rounded-md text-xs font-medium linear-btn-secondary cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="px-3.5 py-1.5 rounded-md text-xs font-semibold linear-btn-primary flex items-center gap-1.5 cursor-pointer">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/product"
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold linear-btn-primary flex items-center gap-1.5"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="pl-2 border-l border-[#27272a]">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <Link
              href="/product"
              className="px-4 py-1.5 rounded-md text-xs font-semibold linear-btn-primary flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 lg:py-28 flex flex-col items-center text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>CLERK AUTHENTICATION + GEMINI 2.5 FLASH</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] mb-6">
          Architect High-Margin <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
            SaaS & AI Ventures
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mb-10 leading-relaxed font-normal">
          An enterprise-grade SaaS platform generating instant startup dossiers: market TAM analysis, 
          defensible unit economics, technical architecture, and early distribution strategies.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          {isClerkConfigured ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-lg linear-btn-primary text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5">
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started Free</span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/product"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg linear-btn-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Venture Studio</span>
                </Link>
              </SignedIn>
            </>
          ) : (
            <Link
              href="/product"
              className="w-full sm:w-auto px-6 py-3 rounded-lg linear-btn-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Venture Studio</span>
            </Link>
          )}

          <a
            href="https://github.com/dilshandevxx/business-idea-generator"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-lg linear-btn-secondary text-sm font-medium flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-[#71717a]" />
            <span>View Source on GitHub</span>
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-6 rounded-xl linear-panel">
            <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Real-Time SSE Streaming</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Token-by-token streaming generation using Server-Sent Events directly from Python FastAPI serverless functions.
            </p>
          </div>

          <div className="p-6 rounded-xl linear-panel">
            <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Cryptographic JWT Auth</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Enterprise user management with Clerk, utilizing JWKS public key verification to protect backend endpoints without latency.
            </p>
          </div>

          <div className="p-6 rounded-xl linear-panel">
            <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-sky-400 mb-4">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Linear-Grade Workspace</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Keyboard shortcuts (⌘↵), persistent local idea vault, independent viewport scrolling, and clean markdown exports.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#27272a] py-6 px-6 text-center text-xs font-mono text-[#52525b]">
        Venture Studio • Next.js Pages Router + Clerk Auth + Python FastAPI SSE
      </footer>
    </div>
  );
}
