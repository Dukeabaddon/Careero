# Careero

Careero is a multilingual career-discovery platform. It turns a visual 30-question RIASEC assessment into explainable career matches, then finds location-aware schools, scholarships, and training programs.

Built for the **Education** track of OpenAI Build Week 2026.

## Why Careero

Career guidance is often generic, text-heavy, and disconnected from real education options. Careero gives students an immediate, private assessment result. AI research loads afterward, only when useful.

The deterministic assessment remains useful if every AI provider is unavailable.

## What it does

- Presents 30 visual, binary RIASEC questions.
- Supports English, Japanese, Simplified Chinese, Spanish, Tagalog, and French.
- Saves assessment progress locally.
- Scores all six RIASEC dimensions.
- Ranks 923 O*NET occupations with Pearson correlation.
- Shows the top ten careers immediately.
- Researches one expanded profession at a time.
- Returns official HTTPS school and program links.
- Prefers nearby, regional, then national options.
- Caches results in the browser and server.
- Exports a privacy-safe share card.
- Supports keyboard-only assessment navigation.

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

Assessment answers and career ranking stay client-side. The Edge API receives only the normalized profile, chosen location, language, and one validated top-ten profession. It never reranks careers.

## Safety and reliability

- Provider keys are server-only.
- `.env` and `.env.local` are ignored.
- Requests use strict Zod validation.
- Profession IDs must belong to the supplied profile's top ten.
- Prompt-injection text is treated as data.
- Provider responses require official HTTPS URLs.
- Failed providers rotate without client secrets.
- Browser and server caches prevent duplicate calls.
- In-flight requests are deduplicated.
- Rate limits protect uncached generation.
- Local Pearson results fail soft when AI is unavailable.

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

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY_1..5` | Rotating Gemini credentials |
| `GEMINI_MODEL` | Primary grounded model |
| `GEMINI_FALLBACK_MODEL` | Grounded Gemini fallback |
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

## Deploy to Vercel

1. Import `Dukeabaddon/Careero` into Vercel.
2. Keep the framework preset as Vite.
3. Add the server-only variables from `.env.example`.
4. Deploy.
5. Add Vercel Firewall rules before public promotion.
6. Add Upstash Redis for deployment-wide caching and rate limiting.

The included workflow verifies pull requests and can deploy `main` after `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are added as GitHub Actions secrets.

## Codex collaboration

Codex accelerated repository analysis, architecture tracing, accessibility implementation, API security review, provider failover, cache design, test generation, and deployment preparation. The product owner retained the core decisions: the visual assessment, light interface, six supported languages, local-first ranking, closed result accordions, and education-first recommendations.

The project used inspectable Telic, Graphify, and Gate MCP workflows during development. Tests and dated commits provide implementation evidence. The required `/feedback` Codex Session ID should be entered directly in the Devpost submission. Exact GPT-5.6 session attribution should be copied from that record rather than guessed in this README draft.

## Education-track submission draft

**Problem:** Students receive broad career labels without a practical bridge to education.

**Solution:** Careero combines a visual interest assessment with transparent career matching and grounded, local education research.

**Impact:** Students can explore plausible careers privately, understand why each match appears, and move directly toward verifiable learning opportunities.

**Demo outline:** Choose a location, answer several visual questions, finish the assessment, show the instant top ten, expand two different professions, verify official links, refresh to prove persistence, then export the share card.

Before submission, add the deployed URL, a public YouTube demo under three minutes, and the `/feedback` session ID.

## Data attribution

Career titles, descriptions, and interest profiles are derived from the official O*NET 30.2 database. O*NET is a trademark of the U.S. Department of Labor, Employment and Training Administration. Third-party data and assets remain subject to their respective terms.

## License

Careero source code is available under the [MIT License](LICENSE).
