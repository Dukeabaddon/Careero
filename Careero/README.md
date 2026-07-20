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

## Deploy to Vercel

1. Import `Dukeabaddon/Careero` into Vercel and name the project `careero` in lowercase.
2. Keep the root directory empty because Careero is the repository root.
3. Use the Vite preset, `npm run build`, and output directory `dist`.
4. Keep Node.js 24. The repository pins it through `package.json`.
5. Add the server-only variables from `.env.example` to Production and Preview.
6. Deploy, then set `OPENROUTER_SITE_URL` to the deployed HTTPS URL and redeploy.
7. Add Upstash Redis for deployment-wide caching and rate limiting.
8. Enable Vercel Firewall rate limiting before public promotion.

The recommendation route uses a 90-second Node.js function limit. This supports provider failover without the Edge runtime's 25-second initial-response deadline. Provider network waits do not expose keys to the browser.

The Vercel CLI is version-pinned in npm scripts without becoming an application dependency. Use `npm run vercel:dev`, `npm run deploy:preview`, or `npm run deploy:production` when CLI deployment is preferred.

The included workflow verifies pull requests and can deploy `main` after `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are added as GitHub Actions secrets.

## How I used Codex

I built Careero through an ongoing collaboration with Codex. I provided the product direction, tested each experience, shared screenshots and real results, and refined the frontend until it matched the experience I wanted. Codex worked alongside me as an implementation and engineering partner, turning those decisions into working code and helping investigate problems as they appeared.

We started with the project requirements and built the application from the ground up. Codex helped scaffold the React application, organize the architecture, configure six languages, implement the visual assessment, persist quiz progress, calculate normalized RIASEC scores, and match profiles against 923 O*NET occupations. We then worked through the results experience, keyboard accessibility, share cards, location-aware recommendations, and the rule that career matches must appear instantly without waiting for AI.

Our process was iterative and practical. I tested the application, reported unexpected rankings or API failures, and explained how I wanted the experience to behave. Codex traced the relevant data and code paths, reproduced issues, proposed fixes, implemented them, and reran the test suite. This helped us catch scoring concerns, malformed provider responses, cache behavior, refresh behavior, rate-limit problems, and deployment risks without replacing my product decisions or visual direction.

Codex also helped build and secure the recommendation backend. Together we added strict request validation, profession verification, prompt-injection boundaries, official HTTPS link validation, browser and server caching, request deduplication, abuse controls, and automatic rotation across Gemini, Groq, OpenRouter, Cerebras, and DeepSeek. The frontend remains useful when every AI provider is unavailable because the assessment and career ranking run locally.

Finally, Codex helped create unit and live smoke tests, scan for exposed credentials, configure GitHub Actions, prepare Vercel deployment, verify production builds, and document the system. I remained responsible for the concept, design choices, testing feedback, and final product direction; Codex helped me move from those decisions to a tested, deployable application much faster.

The required `/feedback` Codex Session ID will be added directly to the Devpost submission.

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
