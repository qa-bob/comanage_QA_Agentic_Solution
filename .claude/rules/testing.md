---
paths:
  - "tests/**/*.spec.ts"
  - "tests/**/*.test.ts"
---

# Test File Rules

Rules that apply when writing or editing files in the `tests/` directory.

## Imports

Always import `test` and `expect` from the custom fixture, never from `@playwright/test` directly:

```typescript
// Correct
import { test, expect } from '@fixtures/site.fixture';

// Wrong
import { test, expect } from '@playwright/test';
```

## Tags

Every test must have at least one tag in its name or describe block:

| Tag | Use when |
|-----|----------|
| `@smoke` | Site loads, title, HTTPS, no JS errors |
| `@navigation` | Nav links, menus, routing, breadcrumbs |
| `@forms` | Form fields, validation, accessibility |
| `@functional` | Business features, CTAs, pricing, search |
| `@visual` | Screenshot regression |
| `@responsive` | Viewport-specific layout |

Tags appear at the end of the `test.describe` name or the individual `test` name:

```typescript
test.describe('Hero Section @functional', () => {
  test('CTA button is visible @functional', async ({ page }) => { ... });
});
```

## URL handling

Never hardcode URLs. Use the `siteConfig` fixture:

```typescript
// Correct
test('pricing loads @functional', async ({ page, siteConfig }) => {
  await page.goto(siteConfig.url.replace(/\/$/, '') + '/pricing', {
    waitUntil: 'domcontentloaded',
  });
});

// Wrong
await page.goto('https://comanage.com/pricing');
```

## Waiting

Never use `waitForTimeout`. Use Playwright's semantic waits:

```typescript
// Wrong
await page.waitForTimeout(2000);

// Correct
await expect(element).toBeVisible({ timeout: 10_000 });
await page.waitForLoadState('networkidle');
await page.waitForSelector('[class*="hero"]');
```

## Form tests

Never submit forms. Test field interactions and validation only:

```typescript
// Correct — type and check validation
await emailField.fill('invalid');
await emailField.blur();
await expect(page.locator('[class*="error"]')).toBeVisible();

// Wrong — never do this
await submitButton.click();
```

## Assertions

Place all `expect()` calls inside spec files, never in page object methods:

```typescript
// Correct — assertion in spec
const isVisible = await heroPage.isHeroVisible();
expect(isVisible).toBeTruthy();

// Wrong — assertion in page object
async isHeroVisible(): Promise<void> {
  await expect(this.heroSection).toBeVisible(); // NO
}
```
