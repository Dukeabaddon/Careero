# Security Audit & Zero-Trust Architecture
## Global AI Career Assessment Platform

> **Document Status**: Approved Security Architecture
> **Version**: 1.0.0

---

## 1. Zero-Trust API Key Isolation

### 1.1 Client-Side Leak Prevention
- **Threat Model**: Malicious users inspecting Network tabs or decompiling client JS code to extract AI provider keys (Gemini, DeepSeek).
- **Enforcement Policy**:
  - Direct browser calls to LLM provider endpoints (`https://generativelanguage.googleapis.com` or `https://api.deepseek.com`) are strictly prohibited.
  - All LLM interactions route through an obfuscated, rate-limited Edge Function `/api/recommendations`.
  - Content Security Policy (CSP) headers restrict outbound client connections to primary domain endpoints.

---

## 2. API Key Rotation Security & Abuse Protection

### 2.1 Serverless Proxy Protection
- **Request Throttling**: IP-based rate limiting on the `/api/recommendations` endpoint (e.g. max 5 assessment calls per IP per hour) prevents malicious automated bot exhaustion of the multi-LLM key pool.
- **Input Sanitization**: User location (Country/City) and RIASEC profile scores are validated against strict Zod schemas before being passed to LLM prompts, preventing **Prompt Injection** attacks.

---

## 3. Client Storage Security & Privacy

### 3.1 Local Persistence Safety
- **No PII Stored**: The mid-quiz state and cached results contain zero Personally Identifiable Information (PII) such as full names, email addresses, or phone numbers.
- **Payload Hash Verification**: Saved cache entries are integrity-checked with SHA-256 signatures to prevent tampering or corrupted cache loads.
- **GDPR & Privacy Compliance**: Users can trigger an instant "Clear My Data" action in the UI, clearing all `localStorage` and `sessionSettings`.
