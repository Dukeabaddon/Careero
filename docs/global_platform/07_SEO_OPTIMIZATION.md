# International SEO & Performance Optimization Strategy
## Global AI Career Assessment Platform

> **Document Status**: Production SEO & Performance Guide
> **Version**: 1.0.0

---

## 1. International SEO Strategy (i18n & hreflang)

To capture organic global traffic across multiple search engines (Google, Baidu, Yahoo Japan, DuckDuckGo):

### 1.1 `hreflang` Tag Management
Dynamic `<head>` metadata updates target tags for supported locales:
```html
<link rel="alternate" hreflang="en" href="https://global-career-app.com/en/" />
<link rel="alternate" hreflang="zh-CN" href="https://global-career-app.com/zh-CN/" />
<link rel="alternate" hreflang="ja" href="https://global-career-app.com/ja/" />
<link rel="alternate" hreflang="es" href="https://global-career-app.com/es/" />
<link rel="alternate" hreflang="tl" href="https://global-career-app.com/tl/" />
<link rel="alternate" hreflang="x-default" href="https://global-career-app.com/" />
```

---

## 2. Core Web Vitals (CWV) & Performance Targets

| Metric | Target Goal | Technical Strategy |
| :--- | :---: | :--- |
| **LCP (Largest Contentful Paint)** | $< 1.2\text{s}$ | Preloaded visual assets, WebP/AVIF images |
| **INP (Interaction to Next Paint)** | $< 50\text{ms}$ | React 18 concurrent rendering, lightweight state updates |
| **CLS (Cumulative Layout Shift)** | `0.00` | Reserved aspect ratios for question assets & dynamic components |
| **FCP (First Contentful Paint)** | $< 0.8\text{s}$ | Critical CSS inline, dynamic chunk splitting |

---

## 3. Dynamic Structured Data (Schema.org)

Every localized page injects dynamic JSON-LD markup:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Global AI Career Assessment Engine",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "inLanguage": ["en", "zh-CN", "ja", "es", "tl", "fr"]
}
```
