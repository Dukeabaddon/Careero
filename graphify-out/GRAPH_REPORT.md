# Graph Report - .  (2026-07-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 189 nodes · 262 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Career Assessment Logic
- Frontend Dependencies
- Package Scripts
- Dev Tooling Config
- Recommendation Request Handler
- LLM Provider Rotator
- Recommendation Storage
- Results Visualization
- Assessment Question Logic
- Localization Utilities
- Memory Storage API
- Vercel Deployment Config
- Provider Key Validation
- Location Modal Logic

## God Nodes (most connected - your core abstractions)
1. `scripts` - 11 edges
2. `App()` - 10 edges
3. `MultiLLMRotator` - 8 edges
4. `getRecommendations()` - 7 edges
5. `MemoryStorage` - 7 edges
6. `handler()` - 7 edges
7. `Results()` - 5 edges
8. `RIASEC_CODES` - 5 edges
9. `calculateRiasecScores()` - 5 edges
10. `rankCareerMatches()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `getRotator()` --calls--> `createEnvironmentKeyPool()`  [EXTRACTED]
  api/v1/recommendations.js → src/services/multiLLMRotator.js
- `App()` --calls--> `loadQuizState()`  [EXTRACTED]
  src/App.jsx → src/utils/storage.js
- `App()` --calls--> `saveQuizState()`  [EXTRACTED]
  src/App.jsx → src/utils/storage.js
- `Results()` --calls--> `getRecommendations()`  [EXTRACTED]
  src/components/Results.jsx → src/services/recommendations.js
- `Results()` --calls--> `rankCareerMatches()`  [EXTRACTED]
  src/components/Results.jsx → src/utils/riasecScoring.js

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "Career Assessment Logic"
Cohesion: 0.13
Nodes (22): App(), Assessment, createState(), Landing, LocationModal, Results, dimensionAssets, dimensionImage() (+14 more)

### Community 1 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (27): countries-list, @fontsource/ibm-plex-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, framer-motion, i18next, lucide-react, dependencies (+19 more)

### Community 2 - "Package Scripts"
Cohesion: 0.11
Nodes (17): description, keywords, name, private, scripts, build, check, dev (+9 more)

### Community 3 - "Dev Tooling Config"
Cohesion: 0.12
Nodes (17): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+9 more)

### Community 4 - "Recommendation Request Handler"
Cohesion: 0.20
Nodes (12): allowRequest(), buildPrompt(), config, getRotator(), handler(), json(), locationText, rateLimit (+4 more)

### Community 5 - "LLM Provider Rotator"
Cohesion: 0.23
Nodes (7): createEnvironmentKeyPool(), isRotatableError(), MultiLLMRotator, normalizeProviderPayload(), ProviderRequestError, requestProvider(), ROTATABLE_STATUS_CODES

### Community 6 - "Recommendation Storage"
Cohesion: 0.29
Nodes (12): getRecommendations(), assessmentStateSchema, createProfileHash(), digestPayload(), loadQuizState(), readResultsCache(), responseSchema, saveQuizState() (+4 more)

### Community 7 - "Results Visualization"
Cohesion: 0.21
Nodes (10): point(), RadarChart(), archetypeAssets, archetypes, primaryFallback, resolveArchetype(), Results(), safeHttpUrl() (+2 more)

### Community 8 - "Assessment Question Logic"
Cohesion: 0.39
Nodes (6): Assessment(), optionImage(), questionAssets, upsertResponse(), getLocalizedQuestion(), QUESTION_COPY

### Community 9 - "Localization Utilities"
Cohesion: 0.29
Nodes (5): base, baseKeys, languages, localesDir, projectRoot

### Community 11 - "Vercel Deployment Config"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 12 - "Provider Key Validation"
Cohesion: 0.40
Nodes (4): checks, environment, envPath, projectRoot

## Knowledge Gaps
- **77 isolated node(s):** `name`, `version`, `description`, `private`, `dev` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Frontend Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling Config` to `Package Scripts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Career Assessment Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.12561576354679804 - nodes in this community are weakly interconnected._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Package Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Dev Tooling Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._