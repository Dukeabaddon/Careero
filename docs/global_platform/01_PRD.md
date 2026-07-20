# Product Requirements Document (PRD)
## Next-Gen Global AI Career Assessment Platform

> **Document Status**: Draft Proposal
> **Target Audience**: Product, Engineering, Design
> **Version**: 1.0.0

---

## 1. Product Overview & Vision

### 1.1 Vision Statement
To empower students and career switchers worldwide with a hyper-personalized, gamified, multi-lingual career assessment engine that combines Holland's RIASEC psychometric framework with real-time multi-LLM artificial intelligence to deliver actionable global career insights, localized opportunities, and educational pathways.

### 1.2 Core Value Proposition
- **Gamified 30-Question Assessment**: Low-friction binary choice paired with intensity ratings, preserving high engagement while collecting multi-dimensional interest vectors.
- **Global Context & Location Intelligence**: Country and City pre-selection customizes AI-generated career pathways, market demands, and salary ranges to the user’s local economic ecosystem.
- **Multi-Language Accessibility**: Full internationalization supporting English, Simplified Chinese, Traditional Chinese, Japanese, Tagalog, Spanish, and French.
- **Resilient Multi-LLM Rotating AI Engine**: A fault-tolerant proxy architecture distributing requests across a pool of API keys (5 Gemini keys, 1 DeepSeek key, etc.) with instant zero-retry-delay failover.
- **Seamless State Persistence & Caching**: Zero progress loss during mid-assessment refreshes and instant, zero-cost result reloads via local payload caching.

---

## 2. Target User Personas

1. **Kenji (High School Student - Tokyo, Japan)**
   - *Language*: Japanese
   - *Goal*: Wants to understand whether his passion for coding and digital art fits global technology or game development careers in Tokyo.
   - *Needs*: High-speed, visual assessment in Japanese; accurate localized career path insights.

2. **Mei-Ling (University Sophomore - Singapore / Shanghai, China)**
   - *Language*: Simplified Chinese / English
   - *Goal*: Exploring whether to switch from business administration to data science or UI/UX design.
   - *Needs*: Detailed breakdown of RIASEC profile correlation, salary expectations in her region, and skill gaps.

3. **Carlos (Career Switcher - Madrid, Spain)**
   - *Language*: Spanish
   - *Goal*: Looking for practical trade or engineering paths with immediate local demand.
   - *Needs*: Mobile-friendly interface, fast performance, ability to refresh without losing generated recommendations.

---

## 3. Feature Requirements & User Stories

### 3.1 Internationalization (i18n) & Language Selection
- **REQ-i18n-1**: Global language dropdown present on the header/navbar of all public pages.
- **REQ-i18n-2**: Supported initial languages: English (`en`), Chinese (`zh-CN`, `zh-TW`), Japanese (`ja`), Tagalog (`tl`), Spanish (`es`), French (`fr`).
- **REQ-i18n-3**: Changing language updates UI text instantly without page reload, using `react-i18next` / `i18next`.
- **REQ-i18n-4**: Question text, option labels, and AI generation prompts adapt to the selected language context.

### 3.2 Geographic Pre-Selection (Country & City Selector)
- **REQ-LOC-1**: User must select **Country** first, then select **City** before entering the 30-question assessment.
- **REQ-LOC-2**: Typeahead search and searchable dropdown for 200+ countries and major metropolitan cities.
- **REQ-LOC-3**: Location preference is passed into the AI Recommendation Engine to localize career market demand, salary benchmarks, and local industry hubs.

### 3.3 Assessment Engine & State Persistence
- **REQ-ASSESS-1**: 30-question gamified binary assessment re-using established high-quality visual assets and question items.
- **REQ-ASSESS-2**: **Mid-Assessment Persistence**: Every response (question ID, selected option, intensity rating) is synchronized to `localStorage` / `IndexedDB` in real-time.
- **REQ-ASSESS-3**: If the user reloads or navigates away at Question 18, returning to the page immediately restores Question 18 with all previous answers intact.
- **REQ-ASSESS-4**: Includes an explicit "Reset Progress" option to start fresh.

### 3.4 Multi-LLM Rotating AI Engine (Results Generation)
- **REQ-AI-1**: Replaces static, hardcoded PH-only school lists with live multi-LLM AI recommendations tailored to user's RIASEC profile + Country/City + Language.
- **REQ-AI-2**: **Key Pool Architecture**: Manages an environment key pool containing multiple provider keys (e.g. 5x Gemini 1.5 Flash/Pro, 1x DeepSeek-V3/R1).
- **REQ-AI-3**: **Instant Failover (Zero Delay)**: On HTTP 429 (Rate Limit), 5xx (Server Error), or key quota exhaustion, the engine catches the exception immediately, marks the key as temporarily cooling down, and rotates to the next available key in $< 10\text{ms}$ without making the user wait for retries.
- **REQ-AI-4**: Returns structured JSON containing localized career recommendations, key skill recommendations, local job market outlook, and suggested educational tracks.

### 3.5 Results Caching & Zero-Cost Reload
- **REQ-CACHE-1**: Upon successful AI recommendation generation, the complete result payload (personality profile + AI insights) is cached locally with a unique profile hash.
- **REQ-CACHE-2**: If the user reloads the Results page, the application serves the cached payload immediately ($< 50\text{ms}$ load time) without triggering redundant API calls or consuming API key quota.
- **REQ-CACHE-3**: User can click "Refresh AI Insights" to explicitly invalidate cache and fetch fresh recommendations.

---

## 4. Success Metrics & KPIs

| Metric | Target | Tracking Method |
| :--- | :---: | :--- |
| **Assessment Completion Rate** | $> 85\%$ | Analytics event on Q30 submit |
| **API Rotation Reliability** | $99.9\%$ success | Serverless proxy log analytics |
| **Average AI Result Latency** | $< 2.5\text{s}$ | Performance monitoring |
| **i18n Coverage** | $100\%$ UI strings | i18n translation key audit |
| **Result Page Reload Cache Hit Rate** | $> 95\%$ | Local cache telemetry |
