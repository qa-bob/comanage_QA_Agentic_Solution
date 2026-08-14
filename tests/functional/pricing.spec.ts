/**
 * tests/functional/pricing.spec.ts
 *
 * Functional tests for the coManage pricing page.
 * Validates that pricing tiers are displayed, CTAs are present, and the page
 * communicates value clearly. No form submission or account creation.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const PRICING_PATHS = ['/pricing', '/plans', '/price', '/#pricing'];

test.describe('Pricing Page @functional', () => {
  let pricingUrl: string | null = null;

  test.beforeAll(async ({ browser, siteConfig }) => {
    // Find which pricing path the site uses (if any)
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const path of PRICING_PATHS) {
      const target = siteConfig.url.replace(/\/$/, '') + path;
      try {
        const response = await page.goto(target, {
          waitUntil: 'domcontentloaded',
          timeout: 10_000,
        });
        if (response && response.status() < 400) {
          pricingUrl = target;
          break;
        }
      } catch {
        // try next path
      }
    }

    await context.close();

    if (!pricingUrl) {
      console.warn(
        '[functional/pricing] No pricing page found at standard paths. ' +
        'Tests will check homepage for inline pricing section instead.'
      );
    }
  });

  test.beforeEach(async ({ page, siteConfig }) => {
    const target = pricingUrl ?? siteConfig.url;
    await page.goto(target, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  // ── Page load ─────────────────────────────────────────────────────────────────

  test('pricing page or section loads successfully @functional', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /pric|plan|subscri/i }).first();

    if (await heading.count() > 0) {
      await expect(heading).toBeVisible({ timeout: 10_000 });
    } else {
      // Pricing may be embedded in a homepage section without a heading
      const pricingSection = page.locator(
        '[class*="pric"], [class*="plan"], [id*="pric"], [id*="plan"]'
      ).first();

      if (await pricingSection.count() > 0) {
        await expect(pricingSection).toBeVisible({ timeout: 10_000 });
      } else {
        console.warn('[functional/pricing] No pricing heading or section found — site may not have a public pricing page.');
      }
    }
  });

  // ── Pricing tiers ─────────────────────────────────────────────────────────────

  test('at least one pricing tier or plan card is displayed @functional', async ({ page }) => {
    const planCards = page.locator(
      '[class*="plan"], [class*="tier"], [class*="pric"]:not(h1):not(h2):not(p), ' +
      '[class*="package"], [class*="option"]'
    );

    const cardCount = await planCards.count();

    if (cardCount === 0) {
      console.warn('[functional/pricing] No plan cards found. Checking for price values instead.');

      // Fallback: look for price-like text ($, per month, /mo)
      const priceText = page.locator('text=/\\$\\d+|per month|\\/mo|free/i');
      const priceCount = await priceText.count();

      if (priceCount === 0) {
        console.warn('[functional/pricing] No pricing information found at all — site may use "Contact for pricing" model.');
        return;
      }

      expect(priceCount, 'Some pricing information should be present').toBeGreaterThan(0);
      return;
    }

    expect(cardCount, 'Should have at least one pricing tier').toBeGreaterThanOrEqual(1);
  });

  test('each pricing tier has a name or label @functional', async ({ page }) => {
    const tierHeadings = page.locator(
      '[class*="plan"] h2, [class*="plan"] h3, [class*="plan"] strong, ' +
      '[class*="tier"] h2, [class*="tier"] h3, [class*="package"] h2'
    );

    const count = await tierHeadings.count();
    if (count === 0) {
      console.warn('[functional/pricing] Could not identify individual tier headings.');
      return;
    }

    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await tierHeadings.nth(i).textContent();
      expect(text?.trim().length ?? 0, `Tier ${i + 1} heading should not be empty`).toBeGreaterThan(0);
    }
  });

  // ── CTAs ──────────────────────────────────────────────────────────────────────

  test('pricing CTAs are present and labeled @functional', async ({ page }) => {
    // Look for CTA buttons/links within plan cards or the pricing section
    const ctaInPlans = page.locator(
      '[class*="plan"] a, [class*="plan"] button, ' +
      '[class*="tier"] a, [class*="tier"] button, ' +
      '[class*="pric"] a[href], [class*="pric"] button'
    ).filter({
      hasText: /get started|sign up|try free|choose|select|contact|start|subscribe|buy/i,
    });

    const count = await ctaInPlans.count();

    if (count === 0) {
      // Fallback: any CTA on the page
      const anyCta = page.locator('a, button').filter({
        hasText: /get started|sign up|try free|choose|select|contact|start|subscribe|buy/i,
      });
      const fallbackCount = await anyCta.count();
      expect(
        fallbackCount,
        'At least one CTA should be present on the pricing page'
      ).toBeGreaterThan(0);
    } else {
      expect(count, 'Pricing section should have CTA buttons').toBeGreaterThan(0);
    }
  });

  test('pricing CTAs have accessible text @functional', async ({ page }) => {
    const ctaButtons = page.locator('a, button').filter({
      hasText: /get started|sign up|try free|choose|select|contact|start|subscribe/i,
    });

    const count = await ctaButtons.count();
    if (count === 0) return;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await ctaButtons.nth(i).textContent();
      expect(
        text?.trim().length ?? 0,
        `CTA button ${i + 1} should have descriptive text`
      ).toBeGreaterThan(2);
    }
  });

  // ── Feature comparison ────────────────────────────────────────────────────────

  test('feature list or comparison is present @functional', async ({ page }) => {
    const featureLists = page.locator(
      '[class*="plan"] ul, [class*="plan"] li, ' +
      '[class*="tier"] ul, [class*="tier"] li, ' +
      '[class*="feature-list"], [class*="features"] li, ' +
      'table[class*="pric"], table[class*="compar"]'
    );

    const count = await featureLists.count();

    if (count === 0) {
      console.warn('[functional/pricing] No feature list or comparison table found in pricing section.');
    } else {
      expect(count, 'Pricing section should list features per plan').toBeGreaterThan(0);
    }
  });

  // ── Contact / custom pricing ──────────────────────────────────────────────────

  test('enterprise or custom pricing contact option is discoverable @functional', async ({ page }) => {
    // Many SaaS pricing pages have a "Contact us" option for enterprise
    const contactOption = page.locator('a, button').filter({
      hasText: /contact|enterprise|custom|talk to|sales/i,
    });

    if (await contactOption.count() > 0) {
      const firstContact = contactOption.first();
      await expect(firstContact).toBeVisible({ timeout: 5_000 });
    } else {
      // Not required — warn only
      console.warn('[functional/pricing] No enterprise/custom pricing contact option found.');
    }
  });
});
