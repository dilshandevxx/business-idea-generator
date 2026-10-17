import os
import time
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv

# Search and load .env from current directory or parent directories
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

app = FastAPI(
    title="Business Idea Generator API",
    description="Real-time Streaming AI API supporting Google Gemini (Free Tier) and OpenAI",
    version="1.0.0"
)

# Enable CORS so Next.js frontend can communicate with FastAPI locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ai_client():
    """
    Detects whether Gemini API key or OpenAI API key is configured.
    Returns: (client, model_name, provider_name)
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if gemini_key:
        from openai import OpenAI
        # Google Gemini supports the OpenAI-compatible REST endpoint
        # Free tier model: gemini-1.5-flash or gemini-2.0-flash
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        client = OpenAI(
            api_key=gemini_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        return client, model, "gemini"

    if openai_key:
        from openai import OpenAI
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        client = OpenAI(api_key=openai_key)
        return client, model, "openai"

    return None, "mock-demo", "mock"


DEMO_IDEAS = [
    """# 🤖 AgentOps: Automated Compliance & Security for Autonomous AI

## 💡 Executive Summary
**AgentOps** is an autonomous compliance guardian designed specifically for enterprise multi-agent workflows. As companies deploy autonomous agents that interact with APIs, databases, and customers, AgentOps monitors agent actions in real time to prevent hallucinated transactions, data leakage, and compliance breaches.

---

## 🎯 Target Audience
- Mid-to-Enterprise companies deploying customer-facing AI agents
- FinTech and HealthTech startups with stringent audit requirements
- Autonomous AI agent framework developers

---

## 🚀 Key Features
- **Real-Time Guardrail Interception**: Catches unauthorized API calls before execution.
- **Audit-Ready Ledger**: Immutable logging of every prompt, thought chain, and tool call.
- **Automated Rollback Engine**: One-click rollback for unauthorized database mutations caused by rogue agents.
- **PII / Secret Masking**: Zero-latency token-level redaction of customer secrets.

---

## 💰 Monetization & Revenue Model
1. **Developer Tier**: Free for up to 10,000 monitored agent tool calls/month.
2. **Growth Tier**: $199/month for up to 250,000 events + custom security rules.
3. **Enterprise SLA**: Custom pricing starting at $1,500/month with on-prem deployment and SOC2 compliance automation.

---

## 🏆 Competitive Advantage
Existing LLM observability tools (like LangSmith or Arize) focus on prompt evaluation and cost tracing. **AgentOps** focuses exclusively on **transaction safety, programmatic guardrails, and automated remediation**.""",

    """# 🥗 GreenShelf: AI Food Waste Reduction for Independent Grocers

## 💡 Executive Summary
**GreenShelf** is an edge-AI inventory and dynamic discounting platform for local supermarkets. By combining point-of-sale data with predictive expiry modeling and local weather patterns, GreenShelf automatically generates daily dynamic flash sales and notifies nearby budget-conscious shoppers.

---

## 🎯 Target Audience
- Independent grocery stores, delis, and boutique food markets
- Eco-conscious consumers and bargain hunters
- Local food banks seeking timely surplus donations

---

## 🚀 Key Features
- **Predictive Expiry AI**: Flags perishables likely to spoil 72 hours in advance.
- **Automated Digital Shelf Pricing**: Syncs directly with electronic shelf tags and POS registers.
- **Hyperlocal Geo-Push Alerts**: Sends instant WhatsApp / SMS alerts to registered local shoppers.
- **Zero-Waste Tax Deduction Reports**: Automatically generates charitable donation write-off sheets.

---

## 💰 Monetization & Revenue Model
- **SaaS Subscription**: $79/month per grocery store location.
- **Marketplace Commission**: 5% transaction fee on flash-discount purchases driven through the consumer app.

---

## 🏆 Competitive Advantage
Unlike generic supermarket ERPs that cost tens of thousands of dollars to configure, GreenShelf installs in 15 minutes via simple CSV or POS webhook integration."""
]


@app.get("/")
def root():
    return {
        "message": "Business Idea Generator API is active",
        "docs": "/docs",
        "endpoints": ["/api", "/api/health"]
    }


@app.get("/api/health")
def health():
    _, model, provider = get_ai_client()
    return {
        "status": "healthy",
        "provider": provider,
        "model": model,
        "mode": "free-tier" if provider == "gemini" else ("paid-tier" if provider == "openai" else "demo-fallback")
    }


@app.get("/api")
def generate_idea(
    topic: str = Query("AI Agents", description="Domain or topic for business idea generation"),
    audience: Optional[str] = Query(None, description="Optional target audience focus")
):
    """
    Streams an AI-generated business idea using Server-Sent Events (SSE).
    Supports Gemini Free API, OpenAI, or Mock Demo streaming.
    """
    client, model, provider = get_ai_client()

    # Construct customized prompt
    audience_text = f" focused on {audience}" if audience else ""
    prompt_content = (
        f"Reply with a compelling, innovative, and highly practical new business idea for '{topic}'{audience_text}. "
        "Format the response using clean, professional Markdown with:\n"
        "- A catchy title (# Title)\n"
        "- Executive Summary (## 💡 Executive Summary)\n"
        "- Target Audience (## 🎯 Target Audience)\n"
        "- Key Features (## 🚀 Key Features with bullet points)\n"
        "- Monetization & Revenue Model (## 💰 Monetization & Revenue Model)\n"
        "- Competitive Advantage (## 🏆 Competitive Advantage)\n\n"
        "Ensure the response is detailed, concrete, and formatted cleanly."
    )

    def event_stream():
        if provider in ["gemini", "openai"] and client is not None:
            try:
                stream = client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a world-class venture capitalist, serial tech founder, and startup mentor known for actionable, creative, and viable business ideas."
                        },
                        {"role": "user", "content": prompt_content}
                    ],
                    stream=True,
                )

                for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    text = delta.content if delta and delta.content else ""
                    if text:
                        lines = text.split("\n")
                        for line in lines:
                            yield f"data: {line}\n"
                        yield "\n"

                # Send completion sentinel
                yield "data: [DONE]\n\n"

            except Exception as e:
                err_msg = f"⚠️ LLM Stream Error ({provider}): {str(e)}"
                lines = err_msg.split("\n")
                for line in lines:
                    yield f"data: {line}\n"
                yield "\n"
                yield "data: [DONE]\n\n"

        else:
            # Mock / Demo fallback stream
            demo_index = 0 if "agent" in topic.lower() or "ai" in topic.lower() else 1
            demo_text = DEMO_IDEAS[demo_index]

            # Stream words with slight delay to mimic real-time AI generation
            words = demo_text.split(" ")
            for i, word in enumerate(words):
                time.sleep(0.03)
                piece = word + (" " if i < len(words) - 1 else "")
                lines = piece.split("\n")
                for line in lines:
                    yield f"data: {line}\n"
                yield "\n"

            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
