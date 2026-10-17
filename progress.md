# 🚀 Business Idea Generator - MLOps Course Project
## Progress & Implementation Roadmap

> **Project Mission**: Build an AI-powered SaaS Full-Stack Application (**Business Idea Generator**) featuring a Next.js (TypeScript + Tailwind CSS) frontend and a Python FastAPI backend with real-time Server-Sent Events (SSE) streaming and Markdown rendering.
>
> **Persistent Tracking Rule**: This file is the **Single Source of Truth** for tracking project phases. When opening a new chat, review this file to resume from the current phase.

---

### 📊 Master Progress Overview

| Phase | Description | Status |
| :--- | :--- | :---: |
| **Phase 1** | Project Blueprint & Next.js Foundation Setup | [x] Completed |
| **Phase 2** | Python FastAPI Backend & Streaming AI Engine (Gemini Free Tier) | [x] Completed |
| **Phase 3** | Frontend UI, Streaming SSE Consumer & Markdown Rendering | [x] Completed |
| **Phase 4** | Full-Stack Local Integration, Verification & Production Build | [x] Completed |
| **Phase 5** | Developer Guide, README & Assignment Submission Documentation | [x] Completed |
| **Phase 6** | Production Deployment Guide (GitHub CLI & Vercel CLI) | [/] In Progress (Guided) |

---

### 📋 Detailed Phase Breakdown

#### Phase 1: Project Blueprint & Next.js Foundation Setup
- [x] **1.1** Define workspace architecture and local routing strategy (Proxy `/api` -> FastAPI `http://127.0.0.1:8000`).
- [x] **1.2** Initialize Next.js project with Pages Router, TypeScript, ESLint, and Tailwind CSS (`--no-src-dir --no-app`).
- [x] **1.3** Clean up default boilerplate files (remove default API routes, adjust initial templates).
- [x] **1.4** Configure `next.config.ts` with local proxy rewrites for smooth development without cloud serverless dependencies.
- [x] **1.5** Phase 1 Verification: Test Next.js dev server runs and displays clean baseline page.

#### Phase 2: Python FastAPI Backend & Streaming AI Engine
- [x] **2.1** Define backend requirements (`requirements.txt` with `fastapi`, `uvicorn`, `openai`, `python-dotenv`).
- [x] **2.2** Set up environment configuration (`.env.example` and `.env` loader with safe Gemini & OpenAI API key handling).
- [x] **2.3** Build FastAPI application structure (`saas/api/index.py` & `api/index.py`) with CORS middleware and health checks.
- [x] **2.4** Implement Google Gemini Free Tier integration (`gemini-1.5-flash`) with Server-Sent Events (SSE `text/event-stream`) streaming generator.
- [x] **2.5** Implement fallback/demo mode when `GEMINI_API_KEY` is not yet configured, ensuring instant testability.
- [x] **2.6** Phase 2 Verification: Tested FastAPI endpoints directly via `curl` and Python async iterator to verify SSE streaming output.

#### Phase 3: Frontend UI, Streaming SSE Consumer & Markdown Rendering
- [x] **3.1** Install necessary UI & Markdown packages (`react-markdown`, `remark-gfm`, `remark-breaks`, `@tailwindcss/typography`, `lucide-react`).
- [x] **3.2** Configure `styles/globals.css` with typography enhancements, glassmorphic styles, and markdown typography.
- [x] **3.3** Update `pages/_app.tsx` and `pages/_document.tsx` with proper metadata, title, and responsive wrappers.
- [x] **3.4** Develop the complete `pages/index.tsx` component:
  - Real-time `EventSource` consumer with buffer accumulator & `[DONE]` sentinel detection
  - Category / industry custom prompt selector (AI Agents, Micro-SaaS, HealthTech, FinTech, Climate, E-commerce)
  - Custom topic input and target audience refinement
  - "Generate Idea" / "Regenerate" controls with loading spin state
  - One-click "Copy to Markdown" with feedback
  - Polished loading indicators and streaming animations
  - Active LLM Provider badge (Gemini Free Tier / OpenAI / Demo)
- [x] **3.5** Phase 3 Verification: Verified UI responsiveness, error boundaries, and markdown rendering.

#### Phase 4: Full-Stack Local Integration, Verification & Production Build
- [x] **4.1** Connect frontend and backend simultaneously in local development environment.
- [x] **4.2** Validate end-to-end stream: user click -> FastAPI endpoint -> Gemini/Demo stream -> SSE -> React Markdown live render.
- [x] **4.3** Test edge cases: connection aborts, network errors, long generations.
- [x] **4.4** Verify production build pipeline (`npm run build`) runs cleanly with zero TypeScript or ESLint errors.
- [x] **4.5** Phase 4 Verification: All static and dynamic production artifacts generated successfully.

#### Phase 5: Developer Guide & Assignment Documentation
- [x] **5.1** Create comprehensive `README.md` explaining architecture, data flow, setup instructions, and MLOps considerations.
- [x] **5.2** Provide handy cross-platform run script (`run_dev.ps1`) for starting both frontend and backend seamlessly.
- [x] **5.3** Final mentor review and sign-off.

#### Phase 6: Production Deployment (CLI Execution Guide)
- [x] **6.1** Stage and commit code cleanly via Git CLI (`git add .`, `git commit`).
- [x] **6.2** Create remote GitHub repository via GitHub CLI (`gh repo create`) and push all application files to origin (`Main`).
- [ ] **6.3** Link Vercel project via CLI (`vercel link`) or Vercel Web Dashboard.
- [ ] **6.4** Set production environment variables via CLI (`vercel env add GEMINI_API_KEY`) or Dashboard.
- [ ] **6.5** Trigger live production deployment (`vercel --prod`).
- [ ] **6.6** Verify live public URL and real-time streaming endpoint.

---

### 📝 Notes & Activity Log
- **2026-10-17**: Project initialized. Roadmap created.
- **2026-10-17**: Next.js Pages Router bootstrapped with TypeScript and Tailwind CSS.
- **2026-10-17**: Configured local reverse proxy in `next.config.ts` routing `/api` to `127.0.0.1:8000`.
- **2026-10-17**: Added native support for **Google Gemini Free API Key** (`gemini-1.5-flash`) via OpenAI-compatible endpoint.
- **2026-10-17**: Installed markdown rendering pipeline (`react-markdown`, `remark-gfm`, `remark-breaks`, `lucide-react`).
- **2026-10-17**: Built interactive frontend with preset topics, custom topic input, SSE consumer, and copy-to-clipboard.
- **2026-10-17**: Successfully passed `npm run build` with zero errors. All local phases verified.
- **2026-10-17**: Formulated step-by-step CLI production deployment guide for GitHub and Vercel.
