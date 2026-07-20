# Careero

A multilingual, visual RIASEC career assessment. It preserves quiz progress locally, computes a normalized six-vector profile, ranks careers with Pearson correlation, and requests localized recommendations through a rotating Vercel Edge proxy.

## Local development

```bash
npm install
npm run dev
```

The assessment works without provider credentials. AI-generated pathways require at least one server-side key from `.env.example`.

For the complete app, including the Edge API, run:

```bash
npx vercel dev
```

Open the local URL printed by Vercel, normally `http://localhost:3000`.

## How to test the app

1. Choose a country. Select a city or continue without one.
2. Use `A`/`B` or arrow keys for choices.
3. Use `1`–`3` for intensity. Press `Enter` to continue.
4. Refresh midway. The exact question and answers should return.
5. Finish all 30 questions. The profile and Pearson matches appear immediately.
6. Schools and scholarships populate below without blocking results.
7. Refresh results. The cache badge should appear and no duplicate AI call should run.
8. Test the share card. Native sharing is used when available; otherwise it copies.

Run automated checks:

```bash
npm run check
npm run test:keys
npm run test:recommendations-live
```

`test:keys` checks authentication only. The live recommendation smoke test uses one Gemini free-tier request and verifies 5–10 schools and programs. It never prints credentials.

## Verification

```bash
npm run check
```

## Vercel deployment

Configure `GEMINI_API_KEY_1` through `GEMINI_API_KEY_5`, `GEMINI_MODEL`, and optionally `KEY_COOLDOWN_MS` in Vercel project settings. Never prefix these variables with `VITE_`.

DeepSeek has no general free API tier. Its key is stored, but `ENABLE_PAID_DEEPSEEK=false` keeps it outside live rotation. Set the flag to `true` only if you intentionally accept DeepSeek usage charges or have granted credits.

Link the repository to Vercel or provide `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub Actions secrets. Pushes to `main` then verify and deploy automatically.

The edge function keeps a best-effort in-memory IP limit per isolate. Production abuse protection should also use Vercel Firewall or a shared rate-limit store.
