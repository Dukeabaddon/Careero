# UI/UX Design Specification & Design System
## Global AI Career Assessment Platform

> **Document Status**: Design System Standard
> **Version**: 1.0.0

---

## 1. Visual Aesthetics & Design Philosophy

The global platform elevates the visual aesthetics from regional design to a world-class, modern, ultra-premium interface. It blends **glassmorphism**, **vibrant gradient accents**, **dark/light mode adaptability**, and **subtle micro-animations**.

### 1.1 Palette & Color System

| Token Name | Hex Code / HSL | Usage Purpose |
| :--- | :--- | :--- |
| `--bg-dark` | `#0B0F19` | Deep space background |
| `--bg-card-glass` | `rgba(255, 255, 255, 0.05)` | Glassmorphic card background with `backdrop-filter: blur(16px)` |
| `--border-glass` | `rgba(255, 255, 255, 0.12)` | Subtle glass card borders |
| `--accent-primary` | `hsl(250, 84%, 60%)` | Electric Indigo / Violet primary CTA |
| `--accent-cyan` | `hsl(185, 96%, 50%)` | Vibrant Cyan glow & highlight |
| `--accent-amber` | `hsl(38, 92%, 50%)` | Warm Gold badge accent |
| `--text-main` | `#F8FAFC` | High contrast primary text |
| `--text-muted` | `#94A3B8` | Subtitle & hint text |

---

## 2. Component Design Specifications

### 2.1 Global Header & Language Selector
- **Navigation Bar**: Sticky glassmorphic navbar (`backdrop-filter: blur(20px)`).
- **Language Dropdown**:
  - Displays flag icon + language code (`EN`, `中文`, `日本語`, `ES`, `TL`, `FR`).
  - Seamless animated dropdown menu (`framer-motion`).
  - Selecting a language triggers an immediate UI translation switch with smooth opacity fade.

### 2.2 Pre-Assessment Location Modal (Country -> City)
- **Modal Step 1**: Country Selection with flag icons and instant filter search input.
- **Modal Step 2**: City Selection tailored to chosen Country (e.g. Japan $\rightarrow$ Tokyo, Osaka, Kyoto).
- **Confirmation CTA**: *"Start Assessment for Tokyo, Japan"* with subtle pulse glow effect.

### 2.3 Gamified 30-Question Cards
- **Progress Bar**: Top sticky progress bar showing `Question X of 30` with percentage fill and animated sparkle indicator.
- **Binary Choice Cards**:
  - Two large side-by-side interactive cards (Option A vs Option B).
  - Hover states: 3D micro-tilt, cyan outline glow, scaled image asset.
  - Active selection unlocks the **Intensity Scale**: 3 interactive pill buttons (`Okay` / `Like` / `Love It`).

### 2.4 AI Results & Career Pathway Dashboard
- **Archetype Hero Banner**: Displays user's top RIASEC code combination (e.g., **Investigative-Artistic: The Creative Innovator**) with high-resolution visual artwork.
- **Radar Chart**: Interactive 6-axis SVG/Canvas RIASEC dimension chart.
- **AI Recommendation Cards**:
  - Localized Career Pathways with expected local salary tags in regional currency (e.g. $¥8,000,000 / \text{yr}$ for Tokyo).
  - Key Skills & AI Insights accordion tabs.
  - Local University & Training Hub matches.
- **Cached Status Indicator**: Subtle pill tag: *"⚡ Loaded from cache"* with option to re-generate.

---

## 3. Multi-Language Typography System

To ensure flawless rendering across global character sets (CJK, Cyrillic, Latin):

```css
:root {
  --font-latin: 'Inter', system-ui, -apple-system, sans-serif;
  --font-cjk-sc: 'Noto Sans SC', 'PingFang SC', sans-serif;
  --font-cjk-jp: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
}

body[lang='ja'] {
  font-family: var(--font-cjk-jp);
}

body[lang='zh-CN'] {
  font-family: var(--font-cjk-sc);
}

body[lang='en'], body[lang='es'], body[lang='tl'] {
  font-family: var(--font-latin);
}
```
