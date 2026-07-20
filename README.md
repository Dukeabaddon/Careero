![Careero](./readme-banner.png)

# Careero

Careero helps students find careers that fit who they are, then schools and scholarships near them.

It turns a visual 30-question RIASEC assessment into explainable career matches, then researches location-aware schools, scholarships, and training programs for one profession at a time.

Built for the **Education** track of OpenAI Build Week 2026.

## Why Careero

Choosing college often feels like guessing. Many students do not know which path fits their strengths, which schools are strong for that path, or which scholarships exist for their course. So they default to what is near or already available.

Careero is built for that moment. The assessment is visual and multilingual, not another long text form. Answers stay local in the browser with no user database. Career matches appear instantly. Schools and scholarships load when a student expands a profession.

The deterministic assessment and ranking remain useful even if every AI provider is unavailable.

## What it does

- Presents 30 visual, binary RIASEC questions
- Supports English, Japanese, Simplified Chinese, Spanish, Tagalog, and French
- Saves assessment progress locally with no user database
- Scores all six RIASEC dimensions
- Ranks 923 O*NET occupations with Pearson correlation
- Shows the top ten careers immediately
- Researches one expanded profession at a time
- Suggests schools tied to the selected place, preferring nearby then national options
- Returns scholarships and programs students can pursue, with official HTTPS links when verified
- Caches results in the browser and server
- Exports a privacy-safe share card
- Supports keyboard-only assessment navigation

## How it works

```text
30 visual choices
       ↓
normalized RIASEC vector
       ↓
local Pearson ranking over 923 careers
       ↓
instant top-ten result
       ↓
on-demand grounded education research
       ↓
validated schools, scholarships, and programs
```

Assessment answers and career ranking stay client-side. The Node.js API receives only the normalized profile, chosen location, language, and one validated top-ten profession. It never reranks careers.

## Safety and reliability

- Provider keys are server-only
- All local `.env*` files are ignored except the empty example
- Requests use strict Zod validation
- Profession IDs must belong to the supplied profile's top ten
- Prompt-injection text is treated as data
- Provider responses require official HTTPS URLs
- Failed providers rotate without client secrets
- Browser and server caches prevent duplicate calls
- In-flight requests are deduplicated
- Rate limits protect uncached generation
- Local Pearson results fail soft when AI is unavailable

## Local development

Requires Node.js 24 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:5173`.

`npm run dev` serves Vite and the local `/api/v1/recommendations` handler. `npm run dev:frontend` intentionally serves only the frontend.

The assessment works without provider keys. AI education research needs at least one configured grounded provider.

## Environment variables

Copy names from `.env.example`. Never use a `VITE_` prefix for secrets.

Multiple key slots are intentional. Gemini 2.5 free access is often capacity-limited or marked high demand, so Careero rotates across several keys and falls back to Groq, OpenRouter, Cerebras, and optional DeepSeek when Gemini cannot serve.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY_1..5` | Rotating Gemini credentials (multi-key failover when free tier is busy) |
| `GEMINI_MODEL` | Primary grounded model |
| `GEMINI_FALLBACK_MODEL` | Grounded Gemini fallback |
| `GROQ_API_KEY_1..2` | Grounded Groq Compound rotation |
| `GROQ_MODEL` | Defaults to `groq/compound-mini` |
| `OPENROUTER_API_KEY_1..2` | OpenRouter web-search rotation |
| `OPENROUTER_MODEL` | Free inference model used with paid web search |
| `CEREBRAS_API_KEY_1..2` | Late, non-search Cerebras fallback |
| `CEREBRAS_MODEL` | Defaults to `gpt-oss-120b` |
| `DEEPSEEK_API_KEY_1` | Optional DeepSeek fallback |
| `ENABLE_PAID_DEEPSEEK` | Explicit DeepSeek switch |
| `UPSTASH_REDIS_REST_URL` | Optional durable cache and limiter |
| `UPSTASH_REDIS_REST_TOKEN` | Optional durable-store credential |

Local secrets belong only in `.env.local`. Vercel secrets belong in Project Settings → Environment Variables.

## Testing

```bash
npm run check
npm run test:keys
npm run test:recommendations-live
```

`npm run check` runs linting, translation validation, unit tests, and the production build. `test:keys` checks authentication without generating recommendations. The live smoke test performs one generation, verifies the schema and HTTPS links, then proves the repeat is cached.

Manual flow:

1. Select a country. City or region is optional.
2. Complete all 30 questions.
3. Confirm the top ten appears immediately.
4. Expand profession #1.
5. Expand profession #2 and observe its spinner.
6. Close and reopen #2. It should use cached data.
7. Refresh Results. Saved results should remain.
8. Verify every education link opens an official HTTPS page.

## How Codex and GPT-5.6 were used to build Careero

Codex with GPT-5.6 was our engineering partner for Careero.

It helped plan and ship the stack: React app, six languages, visual RIASEC assessment, local persistence, Pearson ranking over 923 O*NET careers, instant top-10 results, share cards, and on-demand school or scholarship research. It also secured the recommendation API with Zod validation, profession checks, HTTPS link rules, caching, rate limits, and multi-provider failover when Gemini free tier was busy.

We kept product and frontend decisions. We tested real flows and screenshots. Codex reproduced bugs, patched them, and expanded unit plus live smoke tests. GPT-5.6 accelerated architecture, coding, and validation without replacing our direction.

`/feedback` Codex Session ID goes in the Devpost form.

## Education-track submission draft

**Problem:** Students often choose schools and courses without knowing their fit, nearby options, or scholarships for that path.

**Solution:** Careero combines a visual interest assessment with transparent career matching and grounded, location-aware education research.

**Impact:** Students can explore plausible careers privately, understand why each match appears, and move toward verifiable schools and scholarships.

**Demo outline:** Choose a location, answer several visual questions, finish the assessment, show the instant top ten, expand two different professions, verify official links, refresh to prove persistence, then export the share card.

Before submission, add the deployed URL, a public YouTube demo under three minutes, and the `/feedback` session ID.

## Data attribution

Career titles, descriptions, and interest profiles are derived from the official O*NET 30.2 database. O*NET is a trademark of the U.S. Department of Labor, Employment and Training Administration. Third-party data and assets remain subject to their respective terms.

## License

Careero source code is available under the [MIT License](LICENSE).
