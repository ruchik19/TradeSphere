# Requirements:
# fastapi
# uvicorn[standard]
# openai          (used as the Ollama-compatible client — no actual OpenAI account needed)
# pydantic

import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel

client = AsyncOpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

OLLAMA_MODEL = "llama3.2"

app = FastAPI(title="Finance AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    user_message: str

class Holding(BaseModel):
    ticker: str
    sector: str
    value: float

class PortfolioRequest(BaseModel):
    holdings: list[Holding]

class SimplifyRequest(BaseModel):
    term_or_text: str
class ChatResponse(BaseModel):
    reply: str

# ── Endpoint 1: AI Tutor  ────────────────────────────────

TUTOR_SYSTEM_PROMPT = """You are a friendly finance tutor. Your rules are strict:
1. Explain financial concepts in simple, easy-to-understand language.
2. NEVER provide direct financial advice such as "buy this stock", "sell now", or "invest in X".
3. Focus exclusively on education — explain what things are and how they work.
4. Always mention the risks associated with any financial concept or strategy discussed.
If a user asks for direct advice, redirect them by explaining the concept educationally instead."""

@app.post("/api/chat",response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        response = await client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
                {"role": "user", "content": req.user_message},
            ],
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Endpoint 2: Portfolio Health Score Analyzer ───────────────────────────────

@app.post("/api/portfolio/analyze")
async def analyze_portfolio(req: PortfolioRequest):
    if not req.holdings:
        raise HTTPException(status_code=400, detail="Holdings list cannot be empty.")

    # Step 1 — Math engine: sector weights and HHI
    total_value = sum(h.value for h in req.holdings)

    sector_totals: dict[str, float] = {}
    for h in req.holdings:
        sector_totals[h.sector] = sector_totals.get(h.sector, 0.0) + h.value

    sector_weights = {sector: val / total_value for sector, val in sector_totals.items()}

    hhi = sum(weight ** 2 for weight in sector_weights.values())

    # Step 2 — Normalize to health score out of 100
    health_score = round((1 - hhi) * 100)

    # Step 3 — LLM narrative analysis
    sector_breakdown_str = "\n".join(
        f"  - {sector}: {weight * 100:.1f}%"
        for sector, weight in sorted(sector_weights.items(), key=lambda x: -x[1])
    )
    analyst_prompt = f"""You are a portfolio analyst. A client's portfolio has been evaluated:

Health Score: {health_score}/100  (derived from the Herfindahl-Hirschman Index; higher = more diversified)

Sector Breakdown:
{sector_breakdown_str}

Provide a concise analysis covering exactly three sections:
**Strengths** — what the portfolio does well.
**Weaknesses** — concentration risks or gaps.
**Diversification Suggestions** — specific, actionable improvements."""

    try:
        response = await client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": analyst_prompt}],
        )
        analysis = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"health_score": health_score, "analysis": analysis}


# ── Endpoint 3: Finance Jargon Simplifier ────────────────────────────────────

SIMPLIFIER_SYSTEM_PROMPT = """You are a finance educator who explains jargon in plain language.
Always respond with a JSON object containing exactly three keys: "definition", "analogy", "why_it_matters".
Output only valid JSON — no markdown fences, no extra text before or after the JSON object.

Here are two examples of the required output format:

User: "Inflation"
Response:
{
  "definition": "The general rise in the prices of goods and services over time, which reduces purchasing power.",
  "analogy": "A pizza that cost 100 last year now costs 120 — your money buys less than it used to.",
  "why_it_matters": "It erodes the real value of your savings, so keeping money idle in a low-interest account can make you poorer over time."
}

User: "Dividend"
Response:
{
  "definition": "A portion of a company's profits distributed to its shareholders, usually on a quarterly basis.",
  "analogy": "Imagine owning a share of a local shop — at the end of the year the owner hands you a cut of the profits.",
  "why_it_matters": "Dividends create a stream of passive income without needing to sell your shares, making them attractive for long-term investors."
}

Now explain the term or text the user provides using the exact same JSON structure."""

def _extract_json(text: str) -> dict:
    """
    Attempt to parse JSON from the model response.
    Falls back to a regex extraction in case the model wraps the JSON
    in markdown fences despite being instructed not to.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise

@app.post("/api/ai/simplify")
async def simplify_term(req: SimplifyRequest):
    try:
        response = await client.chat.completions.create(
            model=OLLAMA_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SIMPLIFIER_SYSTEM_PROMPT},
                {"role": "user", "content": req.term_or_text},
            ],
        )
        raw = response.choices[0].message.content
        parsed = _extract_json(raw)

        return {
            "definition": parsed.get("definition", ""),
            "analogy": parsed.get("analogy", ""),
            "why_it_matters": parsed.get("why_it_matters", ""),
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM returned malformed JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)