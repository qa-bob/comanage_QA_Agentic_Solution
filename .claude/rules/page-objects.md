---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

Rules that apply when writing or editing files in the `src/pages/` directory.

## Class structure

Every page object must:
1. Import `Page` and `Locator` from `@playwright/test`
2. Import `SiteConfig` from `@types/site-config.types`
3. Extend `BasePage` from `./base.page`
4. Declare locators as `readonly Locator` properties
5. Accept `(page: Page, config: SiteConfig)` in the constructor

```typescript
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@site-types/site-config.types';

export class ExamplePage extends BasePage {
  readonly heading: Locator;
  readonly primaryCta: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heading = page.locator('h1').first();
    this.primaryCta = page.locator('a, button').filter({ hasText: /get started/i }).first();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url + '/example', { waitUntil: 'domcontentloaded' });
  }

  async clickCta(): Promise<void> {
    await this.primaryCta.click();
  }
}
```

## Locator strategy (priority order)

1. Role-based: `page.getByRole('button', { name: /get started/i })`
2. Text-based: `page.getByText('Get Started')`
3. Label-based: `page.getByLabel('Email address')`
4. Semantic attribute: `page.locator('[aria-label*="menu" i]')`
5. Class pattern (last resort): `page.locator('[class*="hero-cta"]')`

Avoid:
- Positional selectors (`nth-child`, `:first-child`) unless the element has no semantic identity
- XPath
- Brittle IDs that look auto-generated (`#btn-12345`)

## Methods

Methods model user actions, not assertions:

```typescript
// Correct — action
async openMobileMenu(): Promise<void> {
  await this.menuToggle.click();
}

// Wrong — assertion in page object
async checkMenuIsOpen(): Promise<void> {
  await expect(this.navMenu).toBeVisible(); // NO
}
```

Return types must be explicit. Use `Promise<void>` for actions, `Promise<boolean>` for state checks, `Promise<string>` for text extraction.

## No `expect()` in page objects

Page objects must never import or call `expect`. All assertions belong in spec files.

## Adding to fixtures

After creating a new page object, add it to `src/fixtures/site.fixture.ts` so tests can access it:

```typescript
// In site.fixture.ts
import { ExamplePage } from '@pages/example.page';

export interface Fixtures {
  examplePage: ExamplePage;
  // ...
}

export const test = base.extend<Fixtures>({
  examplePage: async ({ page, siteConfig }, use) => {
    const examplePage = new ExamplePage(page, siteConfig);
    await use(examplePage);
  },
});
```
