<div align="center">

![Careero](./readme-banner.png)

# Careero

**Visual career matching → schools and scholarships near you**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Track](https://img.shields.io/badge/OpenAI%20Build%20Week-Education-2563eb)](https://openai.devpost.com/)
[![License](https://img.shields.io/badge/License-MIT-0f172a)](LICENSE)

**A privacy-first career guide for students.**  
**Local assessment. No user database. AI research only when you expand a path.**

[Features](#-features) · [Tech stack](#️-tech-stack) · [Architecture](#️-architecture) · [Privacy](#-privacy) · [Accuracy](#-accuracy--how-matching-works) · [Setup](#-local-development) · [Codex + GPT-5.6](#-how-codex-and-gpt-56-were-used-to-build-careero)

</div>

---

## Why Careero

Choosing college often feels like guessing. Many students do not know which path fits their strengths, which schools are strong for that path, or which scholarships exist for their course. So they default to what is near or already available.

Careero is built for that moment. The assessment is visual and multilingual, not another long text form. Answers stay local in the browser. Career matches appear instantly. Schools and scholarships load when a student expands a profession.

The deterministic assessment and ranking remain useful even if every AI provider is unavailable.

## ✨ Features

| Feature | Description |
| --- | --- |
| 🎨 **Visual RIASEC quiz** | 30 image choices, not a wall of text forms |
| 🌍 **Six languages** | English, Japanese, Chinese, Spanish, Tagalog, French |
| 🔒 **Local-first privacy** | Progress stays in the browser with no user database |
| 📊 **Explainable matches** | Six RIASEC scores plus Pearson ranking over 923 O*NET careers |
| ⚡ **Instant top 10** | Career results show before any AI research |
| 🏫 **Schools near you** | Expand a profession for location-aware school suggestions |
| 🎓 **Scholarships** | Programs students can pursue, with official HTTPS links when verified |
| 🃏 **Share card** | Privacy-safe export without dumping private answers |
| ⌨️ **Keyboard-friendly** | Full assessment navigation without a mouse |

## 🛠️ Tech stack

| Layer | Technology | Version |
| --- | --- | --- |
| UI | React | 19.2.x |
| Bundler | Vite | 8.1.x |
| Styling | Tailwind CSS + `@tailwindcss/vite` | 4.3.x |
| Motion | Framer Motion | 12.x |
| i18n | i18next + react-i18next | 26.x / 17.x |
| Icons | Lucide React | 1.x |
| Share export | html-to-image | 1.11.x |
| Scroll | Lenis | 1.3.x |
| Validation | Zod | 4.4.x |
| Runtime | Node.js | 24.x |
| Tests | Vitest | 4.1.x |
| Career data | O*NET Interests + Occupation Data | 30.2 |
| AI research | Gemini, Groq, OpenRouter, Cerebras, DeepSeek | rotating providers |

## 🏗️ Architecture

```text
Browser (React + Vite)
  ├─ Visual quiz + localStorage quiz state
  ├─ RIASEC scoring + Pearson ranking (client)
  └─ Results UI + share card
           │
           ▼  only when a top-10 profession is expanded
Node API  /api/v1/recommendations
  ├─ Zod request validation
  ├─ Profession must be in that profile's top 10
  ├─ Multi-provider LLM rotator + cooldown
  ├─ HTTPS link verification
  └─ Optional Upstash cache / rate limit
```

- Career ranking never leaves the browser for reordering.
- The API receives a normalized profile, location, language, and one profession ID.
- AI research is optional. The top 10 still works offline from provider outages.

## 🔒 Privacy

- ✅ Assessment answers stay in browser `localStorage`
- ✅ No user accounts and no user database
- ✅ No VITE-prefixed secrets (keys stay server-only)
- ✅ Share card exports a result summary, not raw quiz answers
- ✅ School research runs only when you expand a profession
- ✅ Provider keys never ship to the client bundle

## 🎯 Accuracy / how matching works

Careero separates **deterministic matching** from **AI education research**.

| Step | What happens | What “accuracy” means here |
| --- | --- | --- |
| 1. Score | 30 visual answers → six RIASEC totals → normalized profile | Same answers always produce the same profile |
| 2. Rank | Pearson correlation vs **923** O*NET 30.2 interest vectors | Higher `r` = closer interest shape, shown as a match % |
| 3. Top 10 | Sort by correlation with stable tie-breaks | Ranking is local, inspectable, and independent of LLMs |
| 4. Research | Expand one career → grounded school or scholarship suggestions | Entries need verifiable `https://` links or they are dropped |

**Honest limits**

- Match % is **profile alignment**, not a guarantee you will love the job or get admitted.
- O*NET vectors describe U.S. occupational interest patterns. Local school fit still needs your judgment.
- AI school lists prefer nearby → country → wider options, but only keep verifiable official links.
- If providers are down, career ranks still work. School research can wait.

## 🔁 How it works

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

## 🛡️ Safety and reliability

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

## 🚀 Local development

Requires Node.js 24 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:5173`.

`npm run dev` serves Vite and the local `/api/v1/recommendations` handler. `npm run dev:frontend` intentionally serves only the frontend.

The assessment works without provider keys. AI education research needs at least one configured grounded provider.

## 🔑 Environment variables

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

## ✅ Testing

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

## 🤝 How Codex and GPT-5.6 were used to build Careero

Codex with GPT-5.6 was our engineering partner for Careero.

It helped plan and ship the stack: React app, six languages, visual RIASEC assessment, local persistence, Pearson ranking over 923 O*NET careers, instant top-10 results, share cards, and on-demand school or scholarship research. It also secured the recommendation API with Zod validation, profession checks, HTTPS link rules, caching, rate limits, and multi-provider failover when Gemini free tier was busy.

We kept product and frontend decisions. We tested real flows and screenshots. Codex reproduced bugs, patched them, and expanded unit plus live smoke tests. GPT-5.6 accelerated architecture, coding, and validation without replacing our direction.

`/feedback` Codex Session ID goes in the Devpost form.

## 🎓 Education-track submission draft

**Problem:** Students often choose schools and courses without knowing their fit, nearby options, or scholarships for that path.

**Solution:** Careero combines a visual interest assessment with transparent career matching and grounded, location-aware education research.

**Impact:** Students can explore plausible careers privately, understand why each match appears, and move toward verifiable schools and scholarships.

**Demo outline:** Choose a location, answer several visual questions, finish the assessment, show the instant top ten, expand two different professions, verify official links, refresh to prove persistence, then export the share card.

Before submission, add the deployed URL, a public YouTube demo under three minutes, and the `/feedback` session ID.

## 📚 Data attribution

Career titles, descriptions, and interest profiles are derived from the official O*NET 30.2 database. O*NET is a trademark of the U.S. Department of Labor, Employment and Training Administration. Third-party data and assets remain subject to their respective terms.

## 📄 License

Careero source code is available under the [MIT License](LICENSE).
