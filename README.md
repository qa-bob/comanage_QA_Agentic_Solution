# coManage — QA Agentic Solution

Playwright + TypeScript regression test suite for [coManage](https://comanage.com), a property management platform. Built with Page Object Model (POM) architecture and optimized for agentic execution via Claude Code.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18.x | LTS recommended |
| npm | ≥ 9.x | Comes with Node.js |
| Claude Code | Latest | For agentic test generation |
| Git | Any | For version control |

---

## Development Environment Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd comanage_QA_Agentic_Solution

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install --with-deps chromium

# 4. Verify configuration
cat site.config.json          # Confirm target URL is https://comanage.com

# 5. Run the smoke suite to confirm everything works
npm run test:smoke
```

---

## Running Tests

```bash
npm test                  # All tests (all browsers, all tags)
npm run test:smoke        # Fast availability checks — run first in CI
npm run test:navigation   # Nav links, menus, routing
npm run test:forms        # Form field interaction and validation
npm run test:functional   # Business logic, CTAs, features, pricing
npm run test:visual       # Screenshot regression (requires baselines)
npm run test:responsive   # Layout at mobile / tablet / desktop

npm run test:headed       # Run with visible browser (useful for debugging)
npm run report            # Open the last HTML test report
npm run baseline          # (Re-)generate visual regression snapshots
npm run lint              # ESLint
npm run typecheck         # TypeScript type-check (no emit)
```

### Targeting a specific test file

```bash
npx playwright test tests/smoke/site-availability.spec.ts
npx playwright test --grep "@smoke"
npx playwright test --grep "@functional" --project=chromium-desktop
```

---

## Project Structure

```
comanage_QA_Agentic_Solution/
├── site.config.json              # Target URL, flags, expected nav items
├── playwright.config.ts          # Playwright projects (desktop/mobile/tablet)
├── global-setup.ts               # Reachability pre-check before test run
│
├── src/
│   ├── pages/
│   │   ├── base.page.ts          # BasePage — shared locators & helpers
│   │   ├── home.page.ts          # HomePage
│   │   ├── navigation.page.ts    # NavigationPage
│   │   ├── contact.page.ts       # ContactFormPage
│   │   └── <feature>.page.ts     # One class per discovered page/section
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom test fixtures (exposes page objects)
│   ├── utils/
│   │   ├── link-checker.ts       # HTTP link reachability helper
│   │   └── visual-helper.ts      # Screenshot diffing utilities
│   └── types/
│       └── site-config.types.ts  # SiteConfig TypeScript interface
│
├── tests/
│   ├── smoke/                    # @smoke — site up, title, HTTPS
│   ├── navigation/               # @navigation — nav links, menus, routing
│   ├── forms/                    # @forms — field interaction, validation
│   ├── functional/               # @functional — features, CTAs, pricing
│   ├── visual/                   # @visual — screenshot regression
│   └── responsive/               # @responsive — viewport layout checks
│
├── .claude/
│   ├── agents/                   # Sub-agent definitions for Claude Code
│   │   ├── site-analyzer.md      # Crawls site, populates site.config.json
│   │   └── test-generator.md     # Generates site-specific Playwright tests
│   ├── commands/                 # Slash commands (skills)
│   │   ├── analyze-site.md       # /analyze-site
│   │   ├── generate-full-suite.md# /generate-full-suite
│   │   ├── run-smoke.md          # /run-smoke
│   │   ├── update-baseline.md    # /update-baseline
│   │   └── generate-report.md    # /generate-report
│   ├── rules/
│   │   ├── testing.md            # Path-scoped rules for tests/**
│   │   └── page-objects.md       # Path-scoped rules for src/pages/**
│   └── hooks/
│       └── pre-test.sh           # Hook: typecheck before running tests
│
├── .github/
│   ├── workflows/
│   │   ├── playwright.yml        # Full CI test suite
│   │   └── smoke.yml             # PR smoke gate
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── test_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── AGENTS.md                     # Instructions for all AI coding agents
├── SKILLS.md                     # Reference for Claude Code slash commands
├── CLAUDE.md                     # Claude Code project instructions
└── __snapshots__/                # Visual regression baseline images
```

---

## Architecture

### Page Object Model (POM)

Every page or major section gets its own class in `src/pages/` that extends `BasePage`. Page objects hold typed locators and action methods — never assertions.

```typescript
// src/pages/pricing.page.ts
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@types/site-config.types';

export class PricingPage extends BasePage {
  readonly pricingCards: Locator;
  readonly ctaButtons: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.pricingCards = page.locator('[class*="plan"], [class*="pricing"]');
    this.ctaButtons = this.pricingCards.locator('a, button').filter({
      hasText: /get started|sign up|try free/i,
    });
  }

  async navigateToPricing(): Promise<void> {
    await this.page.goto(this.url.replace(/\/$/, '') + '/pricing', {
      waitUntil: 'domcontentloaded',
    });
  }
}
```

### Test fixture pattern

Import `test` and `expect` from the custom fixture, not directly from `@playwright/test`.

```typescript
import { test, expect } from '@fixtures/site.fixture';

test('pricing tiers are visible @functional', async ({ page, siteConfig }) => {
  await page.goto(siteConfig.url + '/pricing', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[class*="plan"]').first()).toBeVisible();
});
```

---

## Contributor Rules

| Rule | Details |
|------|---------|
| No form submissions | Interact with fields; never click Submit |
| No accounts | Do not register or log in |
| No hardcoded URLs | Always use `baseURL` from Playwright config |
| No assertions in page objects | Assertions belong in spec files only |
| No `waitForTimeout` | Use `waitForSelector` or Playwright auto-waiting |
| No `any` without justification | TypeScript strict mode is enforced |
| Tag every test | At least one: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive` |
| Run typecheck before PR | `npm run typecheck` must pass |

---

## Claude Code Integration

This repo is designed for agentic use with Claude Code. See [`CLAUDE.md`](./CLAUDE.md) for full instructions, [`AGENTS.md`](./AGENTS.md) for agent definitions, and [`SKILLS.md`](./SKILLS.md) for available slash commands.

### Quick agentic start

```bash
# Open Claude Code in this directory
claude

# Analyze the target site and refresh site.config.json
/analyze-site

# Generate a complete test suite from scratch
/generate-full-suite

# Run smoke tests and view results
/run-smoke
```

---

## CI/CD

Pull requests trigger a smoke test gate via `.github/workflows/smoke.yml`. The full suite runs on merge to `main` via `.github/workflows/playwright.yml`. Test reports are uploaded as GitHub Actions artifacts.

---

## Visual Regression

Visual baselines are stored in `__snapshots__/`. To update after intentional UI changes:

```bash
npm run baseline
```

Commit the updated snapshots alongside the change that caused them.

---

*Part of the Phoenix Startup QA Agentic Solutions project.*
