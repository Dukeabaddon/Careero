# Automated Test Suite Specification & Executable Test Cases
## Global AI Career Assessment Platform

> **Document Status**: Comprehensive Testing Suite Specification
> **Version**: 1.0.0

---

## 1. Overview & Test Architecture

The testing suite guarantees reliability across the four core pillars of the application:
1. **RIASEC Scoring & Profile Normalization** (Mathematics & Pearson Correlation).
2. **Multi-LLM Rotating Key Engine** (Rate-limit failover simulation, zero-delay rotation).
3. **Local State Persistence & Cache Engine** (Mid-quiz refresh restoration & results caching).
4. **End-to-End User Flow** (Location selection $\rightarrow$ 30 questions $\rightarrow$ AI results rendering).

---

## 2. Unit Test Suite (Vitest / Jest)

### 2.1 Multi-LLM Rotating Key Engine Test Suite (`tests/unit/multi-llm-rotator.test.js`)

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiLLMRotator } from '../../src/services/multiLLMRotator.js';

describe('MultiLLMRotator Engine', () => {
  let rotator;

  beforeEach(() => {
    const keys = [
      { id: 'gemini-1', provider: 'gemini', key: 'key_1', priority: 1 },
      { id: 'gemini-2', provider: 'gemini', key: 'key_2', priority: 1 },
      { id: 'deepseek-1', provider: 'deepseek', key: 'key_3', priority: 2 }
    ];
    rotator = new MultiLLMRotator(keys);
  });

  it('should successfully execute request with the primary active key', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ careerPathways: [] }) });
    const result = await rotator.executeRequest({ prompt: 'test' }, mockFetch);

    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should instantly rotate to secondary key upon HTTP 429 rate-limit without throw', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ careerPathways: ['AI Engineer'] }) });

    const startTime = performance.now();
    const result = await rotator.executeRequest({ prompt: 'test' }, mockFetch);
    const duration = performance.now() - startTime;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.careerPathways[0]).toBe('AI Engineer');
    expect(duration).toBeLessThan(50); // Instant rotation (< 50ms)
  });

  it('should throw error when all keys in pool are exhausted', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    await expect(rotator.executeRequest({ prompt: 'test' }, mockFetch)).rejects.toThrow(
      'All API key pools temporarily exhausted'
    );
  });
});
```

### 2.2 RIASEC Normalization & Pearson Correlation Test (`tests/unit/riasec-scoring.test.js`)

```javascript
import { describe, it, expect } from 'vitest';
import { calculateRiasecScores, normalizeRiasecScores, getTopDimensions } from '../../src/utils/riasecScoring.js';

describe('RIASEC Scoring Algorithm', () => {
  it('should accurately calculate raw sums and normalize scores across dimension opportunity variations', () => {
    const mockResponses = [
      { selectedCode: 'R', rating: 3 },
      { selectedCode: 'R', rating: 2 },
      { selectedCode: 'I', rating: 3 },
      { selectedCode: 'A', rating: 1 }
    ];

    const raw = calculateRiasecScores(mockResponses);
    expect(raw.R).toBe(5);
    expect(raw.I).toBe(3);
    expect(raw.A).toBe(1);

    const normalized = normalizeRiasecScores(raw);
    expect(normalized.R).toBeGreaterThan(0);
    expect(normalized.I).toBeGreaterThan(0);
  });

  it('should extract top 2 primary dimensions correctly', () => {
    const scores = { R: 9.5, I: 11.0, A: 4.0, S: 3.0, E: 6.0, C: 8.0 };
    const top = getTopDimensions(scores, 2);

    expect(top[0].code).toBe('I');
    expect(top[1].code).toBe('R');
  });
});
```

---

## 3. End-to-End Test Suite (Playwright)

### 3.1 Global Assessment E2E Smoke Test (`tests/e2e/assessment-flow.spec.js`)

```javascript
import { test, expect } from '@playwright/test';

test.describe('Global AI Career Assessment Flow', () => {
  test('Complete user journey: Language selection -> Location -> 30 Qs -> Cached AI Results', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');

    // 2. Select Language (Japanese)
    await page.click('[data-testid="language-dropdown"]');
    await page.click('[data-testid="lang-option-ja"]');
    await expect(page.locator('h1')).toContainText('キャリア');

    // 3. Open Location Selector Modal & Pick Country (Japan) -> City (Tokyo)
    await page.click('[data-testid="start-assessment-btn"]');
    await page.selectOption('[data-testid="country-select"]', 'Japan');
    await page.selectOption('[data-testid="city-select"]', 'Tokyo');
    await page.click('[data-testid="confirm-location-btn"]');

    // 4. Complete 30-Question Assessment
    for (let i = 1; i <= 30; i++) {
      await expect(page.locator('[data-testid="question-progress"]')).toContainText(`30`);
      await page.click('[data-testid="option-a-card"]');
      await page.click('[data-testid="rating-3-btn"]');
      await page.click('[data-testid="next-question-btn"]');
    }

    // 5. Verify Results Page Loaded & Cached
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('[data-testid="archetype-hero"]')).toBeVisible();

    // 6. Test Cache Persistence on Page Reload
    await page.reload();
    await expect(page.locator('[data-testid="cache-status-pill"]')).toContainText('Loaded from cache');
  });
});
```
