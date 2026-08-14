# AGENTS.md — coManage QA Agentic Solution

Instructions for AI coding agents (Claude Code, GitHub Copilot, Cursor, Devin, and others) working in this repository.

> Claude Code users: this file is imported by `CLAUDE.md`. See that file for the full Claude-specific instruction set.

---

## Project Overview

This repository is a **Playwright + TypeScript regression test suite** for [coManage](https://comanage.com), a property management SaaS platform. It follows the **Page Object Model (POM)** design pattern with strict **Object-Oriented Programming (OOP)** principles.

**What this repo tests:** The public-facing coManage website — navigation, forms, functional features, visual regression, and responsive layout. No account creation or authentication required.

---

## Architecture Constraints

### File Ownership

| Path | Purpose | Notes |
|------|---------|-------|
| `site.config.json` | Single source of truth for target URL and feature flags | Read before writing any test |
| `src/pages/*.page.ts` | Page Object Model classes | One class per page or major section |
| `src/fixtures/site.fixture.ts` | Custom Playwright fixtures | The only test import source for `test` and `expect` |
| `src/utils/` | Shared helpers | Do not duplicate logic already here |
| `src/types/site-config.types.ts` | TypeScript interfaces | Keep in sync with `site.config.json` shape |
| `tests/**/*.spec.ts` | Test files | One concern per file; one `describe` block per page/feature |
| `.claude/agents/*.md` | Sub-agent definitions for Claude Code | Follow the schema in each file |
| `.claude/commands/*.md` | Slash command / skill definitions | One command per file |
| `.claude/rules/*.md` | Path-scoped instruction files | May include YAML frontmatter with `paths:` |

### Page Object Rules

- Every page class extends `BasePage` from `./base.page`
- Locators are `readonly Locator` properties declared in the constructor
- Methods model user actions (click, fill, navigate) — not assertions
- **No `expect()` calls inside page objects**
- Constructor signature: `constructor(page: Page, config: SiteConfig)`

```typescript
// Correct pattern
export class FeaturePage extends BasePage {
  readonly heroHeading: Locator;
  readonly primaryCta: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heroHeading = page.locator('h1').first();
    this.primaryCta = page.locator('a, button').filter({ hasText: /get started|try free/i }).first();
  }

  async clickPrimaryCta(): Promise<void> {
    await this.primaryCta.click();
  }
}
```

### Test File Rules

- Import `test` and `expect` from `@fixtures/site.fixture`, not from `@playwright/test`
- Every test must have at least one tag: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Never hardcode the base URL — read it from `siteConfig.url` (provided by the fixture)
- Never submit forms; never create accounts; never enter real credentials
- Never use `page.waitForTimeout()` — use Playwright's built-in auto-waiting
- Never use `any` type without an explicit `// eslint-disable-next-line` comment and justification

```typescript
// Correct pattern
import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Section @functional', () => {
  test('feature cards are visible @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[class*="feature"], [class*="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });
});
```

### TypeScript Rules

- Strict mode is enabled — all variables must be typed
- Run `npx tsc --noEmit` before declaring any task complete
- Prefer `type` over `interface` for simple shapes; use `interface` for extendable contracts
- Use `readonly` for locator properties on page objects

---

## Test Coverage Targets

### Smoke (`@smoke`) — `tests/smoke/`
- Site loads with HTTP 2xx
- Page has `<title>` and meta description
- No critical JavaScript console errors
- Site is served over HTTPS
- Page loads within 10 seconds

### Navigation (`@navigation`) — `tests/navigation/`
- Primary navigation is visible
- All nav links return non-404 responses
- Mobile hamburger menu toggles correctly
- Logo links back to homepage

### Forms (`@forms`) — `tests/forms/`
- Contact form is present and fields are interactive
- Required field validation fires without submission
- Email field rejects invalid format
- Form is accessible (labels, ARIA attributes)

### Functional (`@functional`) — `tests/functional/`
- Homepage hero section renders with heading and CTA
- Feature / solution sections are visible
- Pricing page (if present) loads with at least one tier
- CTA links are not broken
- Testimonials or social proof elements present
- Footer links are reachable

### Visual (`@visual`) — `tests/visual/`
- Full-page screenshot regression against stored baselines
- One baseline per viewport: desktop, mobile, tablet

### Responsive (`@responsive`) — `tests/responsive/`
- No horizontal overflow at any viewport
- Navigation adapts correctly to mobile viewport
- Images and text remain legible at all sizes

---

## Forbidden Actions

- Submitting forms
- Creating accounts or entering credentials
- Hardcoding `https://comanage.com` or any URL in test bodies
- Adding `expect()` calls inside `src/pages/` files
- Using `page.waitForTimeout()` with any value > 0
- Leaving TypeScript compile errors
- Committing `__snapshots__/` changes without an intentional baseline update
- Modifying `site.config.json` without running `/analyze-site` first

---

## Agent Definitions (Claude Code)

Two sub-agents are defined in `.claude/agents/`:

### `site-analyzer`
Crawls the live site and produces a populated `site.config.json`. Invoke with `/analyze-site` or when onboarding. See `.claude/agents/site-analyzer.md` for full spec.

### `test-generator`
Reads `site.config.json` and generates site-specific Playwright test files in `tests/custom/`. Invoke with `/generate-full-suite` or for targeted scenario coverage. See `.claude/agents/test-generator.md`.

---

## Slash Commands (Claude Code Skills)

| Command | Description |
|---------|-------------|
| `/analyze-site` | Crawl site, update `site.config.json` |
| `/generate-full-suite` | Generate complete POM + tests from scratch |
| `/run-smoke` | Execute `@smoke` tests and report results |
| `/update-baseline` | Refresh visual regression snapshots |
| `/generate-report` | Summarize latest test run results |

See [`SKILLS.md`](./SKILLS.md) for detailed usage.

---

## npm Scripts

```bash
npm test                  # All tests
npm run test:smoke        # @smoke only
npm run test:navigation   # @navigation only
npm run test:forms        # @forms only
npm run test:functional   # @functional only
npm run test:visual       # @visual only
npm run test:responsive   # @responsive only
npm run baseline          # Update visual snapshots
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
```
