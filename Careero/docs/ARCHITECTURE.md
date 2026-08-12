# Careero feature architecture

## Layout

```
src/
├── assets/styles/     # tokens.css (design tokens)
├── components/        # shared UI: Navbar, LanguageSelector, ClickSpark
├── features/
│   ├── landing/       # LandingPage + sections + Footer
│   ├── assessment/    # quiz flow + question data
│   ├── results/       # results screen + share
│   └── i18n/          # locale loading + language registry
├── hooks/             # global hooks (useScrollNavbar)
├── layouts/           # RootLayout (shell, navbar, lenis)
├── pages/             # phase screens (Home, Assessment, Results)
├── services/          # shared API clients (also used by Careero/api)
├── utils/             # riasecScoring, storage, shareExport
└── locales/           # translation bundles
```

## Import rules

- `pages/` and `App.jsx` import features via `index.js` only
- Features must not import another feature's internals
- `services/` and `data/careers.js` stay global (API server shares them)

## Styles

- `assets/styles/tokens.css` — design tokens
- `assets/styles/global.css` — reset, shell, ambient, utilities
- `assets/styles/shared-ui.css` — shared buttons
- Each feature/component imports its own `.css` for complex UI only
- Prefer Tailwind (`sm:`, `md:`, `min-*`, `max-*`) for layout and spacing

