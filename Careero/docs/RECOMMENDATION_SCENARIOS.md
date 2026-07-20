# Careero recommendation scenarios

These stories define expected frontend, Edge API, cache, provider, and abuse behavior.

## Normal result flow

### Complete the assessment

**Given** a user completes all 30 questions
**When** the results page opens
**Then** the deterministic top 10 appear immediately
**And** every profession accordion remains closed
**And** profession #1 begins one background recommendation request
**And** professions #2–#10 make no request yet.

### Expand profession #1

**Given** profession #1 was prefetched
**When** the user expands it
**Then** cached schools and scholarships appear immediately when ready
**Or** a spinner remains until the existing request completes
**And** expanding does not start a duplicate request.

### Expand another profession

**Given** profession #2 has not been requested
**When** the user expands it
**Then** one profession-specific request starts
**And** the returned profession is not allowed to rerank the top 10
**And** the response is cached separately from profession #1.

### Reload results

**Given** the completed assessment remains in `global_quiz_state_v1`
**And** profession #1 has a valid `global_results_cache_[ProfileHash]` entry
**When** the same browser reloads
**Then** Careero restores the results page and top 10
**And** profession #1 is served from `localStorage`
**And** no Edge or provider request occurs.

### Reload without local recommendation cache

**Given** the browser recommendation entry was cleared
**When** the result page requests the same profile and profession
**Then** the Edge cache should serve it
**And** no provider call occurs while that cache entry is alive
**And** this survives Edge isolate changes only when Upstash Redis is configured.

### New browser or device

**Given** the user opens Careero on another device
**Then** browser state and recommendations are not transferred
**And** the assessment must be completed again
**And** a matching request may still hit the shared Redis cache.

## Spam and concurrency

### Repeated clicks and reopening

**Given** a profession response is cached
**When** the user repeatedly opens and closes it
**Then** no additional API or provider call occurs.

### Rapid duplicate requests

**Given** prefetch and expand request the same uncached profession together
**Then** the browser coalesces them into one request
**And** one Edge isolate coalesces duplicates into one provider call.

### Many unique profession requests

**Given** one IP submits unique uncached requests
**When** it reaches 20 requests within one hour
**Then** the next request receives `429` and `Retry-After`
**And** valid cache hits do not consume that allowance.

### Distributed bot traffic

**Given** bots use many IP addresses
**Then** per-IP application limiting alone is insufficient
**And** Vercel Firewall rules should provide the first boundary
**And** Upstash must be configured for a durable shared limiter
**And** alerts should track provider calls, `429` responses, and cache-hit rate.

## Direct API and prompt abuse

### Invented profession or prompt injection

**Given** a caller submits `claude-server-recipe` or instruction text as a profession
**When** the API validates the payload
**Then** it verifies the ID against the supplied profile's deterministic top 10
**And** returns `400` before calling any provider.

### Valid profession with hostile location

**Given** a caller places instructions or control characters in country, city, or region
**Then** Zod rejects the payload with `400`
**And** no provider quota is consumed.

### Oversized or malformed request

**Given** a body exceeds 16 KiB, has invalid JSON, or uses the wrong content type
**Then** the API returns `413`, `400`, or `415` respectively
**And** no provider is called.

### Valid catalog probing

**Given** an attacker submits valid top-10 profession requests from many profiles and IPs
**Then** schema checks cannot distinguish them from real anonymous users
**And** Firewall controls, shared rate limiting, monitoring, or an attestation challenge are required.

## Provider and response failures

### Gemini quota exhaustion

**Given** one Gemini key returns `429`
**Then** rotation immediately tries the next active Gemini key
**And** DeepSeek is used only after Gemini keys fail
**And** total execution remains bounded by the provider timeout.

### Every provider fails

**Then** the API returns safe JSON with `502` or `503`
**And** the top 10 client-side professions remain visible
**And** the profession panel offers retry behavior.

### Malformed provider JSON

**Given** a provider returns prose, invalid JSON, extra fields, or invalid data
**Then** the rotator rejects it or tries another provider
**And** the Edge response must match the strict recommendation schema.

### Unsafe or excessive links

**Given** a response contains HTTP links or more than ten entries
**Then** non-HTTPS entries are removed
**And** lists are capped at ten
**And** the frontend also refuses non-HTTPS links.

### Hallucinated but syntactically valid HTTPS URL

**Given** a provider invents a plausible HTTPS URL
**Then** protocol validation alone cannot prove that it is official
**And** Gemini search grounding and returned sources reduce this risk
**But** DeepSeek fallback does not currently provide equivalent search grounding
**And** independent URL/domain verification remains a recommended hardening step.

## Privacy and storage

### Shared computer

**Given** results are stored in browser `localStorage`
**Then** another person using the same browser profile can see them
**And** “take assessment again” or a future clear-data control should remove quiz and result entries.

### Tampered local cache

**Given** a local result payload is edited
**Then** its SHA-256 integrity digest no longer matches
**And** Careero removes it and requests a valid result again.

The local digest detects accidental or casual modification. It is not an authentication signature because browser code can recompute it.

## Release acceptance

- Complete assessment: top 10 render without AI delay.
- Reload: completed results restore.
- Prefetch plus expand: one request.
- Reopen: local cache hit.
- Clear local cache: server cache hit when available.
- Request another top-10 profession: profession-specific result.
- Invented profession: `400`, zero provider calls.
- Twenty unique uncached requests: allowed; next request: `429`.
- Malformed input: safe `4xx` JSON.
- Exhausted providers: safe `503` JSON.
- Provider output: strict JSON, no non-HTTPS links.
- Logs: no API keys, prompts, profiles, or provider bodies.
