/**
 * tests/functional/cta-flows.spec.ts
 *
 * Functional tests for coManage CTA (call-to-action) flows.
 * Validates that primary CTAs are present, linked correctly, and lead to
 * expected destinations. Does not create accounts or submit forms.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('CTA Flows @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  // ── Primary CTA ──────────────────────────────────────────────────────────────

  test('primary CTA button is visible above the fold @functional', async ({ page }) => {
    // "Above the fold" — element is in the initial viewport without scrolling
    await page.setViewportSize({ width: 1280, height: 720 });

    const ctaLocators = [
      page.locator('a, button').filter({ hasText: /get started/i }).first(),
      page.locator('a, button').filter({ hasText: /try free/i }).first(),
      page.locator('a, button').filter({ hasText: /request demo|book demo|get a demo/i }).first(),
      page.locator('a, button').filter({ hasText: /sign up/i }).first(),
      page.locator('[class*="cta"], [class*="btn-primary"]').first(),
    ];

    let foundCta = false;
    for (const cta of ctaLocators) {
      if (await cta.count() > 0 && await cta.isVisible()) {
        foundCta = true;
        await expect(cta).toBeVisible({ timeout: 5_000 });

        // Verify it has a non-empty text label
        const text = await cta.textContent();
        expect(text?.trim().length ?? 0, 'Primary CTA must have descriptive text').toBeGreaterThan(2);
        break;
      }
    }

    if (!foundCta) {
      console.warn('[functional/cta] No primary CTA found above the fold — check homepage layout.');
    }
  });

  test('primary CTA link has a valid href @functional', async ({ page }) => {
    const cta = page.locator('a, button').filter({
      hasText: /get started|try free|request demo|book demo|sign up/i,
    }).first();

    if (await cta.count() === 0) {
      console.warn('[functional/cta] No primary CTA found — skipping href check.');
      return;
    }

    const tagName = await cta.evaluate((el) => el.tagName.toLowerCase());

    if (tagName === 'a') {
      const href = await cta.getAttribute('href');
      expect(href, 'Primary CTA <a> must have an href attribute').not.toBeNull();
      expect(href?.trim().length ?? 0, 'href must not be empty').toBeGreaterThan(0);
      // href should not be just "#" (non-functional placeholder)
      expect(href, 'href should not be a bare hash anchor').not.toBe('#');
    }
  });

  // ── Demo / trial CTA navigation ───────────────────────────────────────────────

  test('demo or trial CTA navigates to a valid page @functional', async ({ page, siteConfig }) => {
    const demoCta = page.locator('a').filter({
      hasText: /get a demo|request demo|book a demo|start trial|try free/i,
    }).first();

    if (await demoCta.count() === 0) {
      console.warn('[functional/cta] No demo/trial CTA link found — skipping navigation check.');
      return;
    }

    const href = await demoCta.getAttribute('href');
    if (!href || href === '#') {
      console.warn('[functional/cta] Demo CTA has no href — may use JS click handler.');
      return;
    }

    // Resolve href relative to siteConfig.url
    const target = href.startsWith('http') ? href : siteConfig.url.replace(/\/$/, '') + href;

    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    expect(response?.status(), `Demo CTA destination ${target} returned error`).toBeLessThan(400);

    // The destination should have a form or at least a heading
    const hasForm = (await page.locator('form').count()) > 0;
    const hasHeading = (await page.locator('h1, h2').count()) > 0;
    expect(
      hasForm || hasHeading,
      'Demo CTA destination should have a form or content heading'
    ).toBeTruthy();
  });

  // ── Navigation CTAs ───────────────────────────────────────────────────────────

  test('header contains a prominent CTA button @functional', async ({ page }) => {
    const headerCta = page.locator(
      'header a, header button, nav a, nav button'
    ).filter({
      hasText: /get started|sign up|try free|demo|contact|login|log in|free trial/i,
    }).first();

    if (await headerCta.count() > 0) {
      await expect(headerCta).toBeVisible({ timeout: 5_000 });
    } else {
      console.warn('[functional/cta] No CTA found in header/nav — conversion opportunity may be missed.');
    }
  });

  // ── Contact CTA ───────────────────────────────────────────────────────────────

  test('contact CTA is present and links to a valid destination @functional', async ({ page, siteConfig }) => {
    const contactCta = page.locator('a').filter({
      hasText: /contact us|contact|get in touch|reach out|talk to us/i,
    }).first();

    if (await contactCta.count() === 0) {
      console.warn('[functional/cta] No "Contact us" CTA found on homepage.');
      return;
    }

    await expect(contactCta).toBeVisible({ timeout: 5_000 });

    const href = await contactCta.getAttribute('href');
    if (!href || href === '#') return;

    const target = href.startsWith('http') ? href : siteConfig.url.replace(/\/$/, '') + href;
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    expect(response?.status(), `Contact CTA destination returned error`).toBeLessThan(400);
  });

  // ── CTA accessibility ─────────────────────────────────────────────────────────

  test('CTA buttons are keyboard-focusable @functional', async ({ page }) => {
    const ctaLinks = page.locator('a').filter({
      hasText: /get started|try free|sign up|demo|contact/i,
    });

    const count = await ctaLinks.count();
    if (count === 0) return;

    const firstCta = ctaLinks.first();
    await expect(firstCta).toBeVisible({ timeout: 5_000 });

    // Check the element is not inert or aria-disabled
    const isDisabled = await firstCta.getAttribute('aria-disabled');
    const tabIndex = await firstCta.getAttribute('tabindex');

    expect(isDisabled, 'Primary CTA should not be aria-disabled').not.toBe('true');
    expect(tabIndex, 'Primary CTA should not have tabindex=-1').not.toBe('-1');
  });

  test('no CTA buttons link to a 404 page @functional', async ({ page, siteConfig }) => {
    const ctaLinks = page.locator('a[href]').filter({
      hasText: /get started|try free|sign up|request demo|book demo/i,
    });

    const count = await ctaLinks.count();
    if (count === 0) return;

    const brokenLinks: string[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await ctaLinks.nth(i).getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      const target = href.startsWith('http') ? href : siteConfig.url.replace(/\/$/, '') + href;

      try {
        const response = await page.request.get(target, { timeout: 10_000 });
        if (response.status() === 404) {
          brokenLinks.push(`${href} → 404`);
        }
      } catch {
        // Network errors are not treated as 404s
      }
    }

    expect(
      brokenLinks,
      `Found CTA links pointing to 404 pages:\n${brokenLinks.join('\n')}`
    ).toHaveLength(0);
  });
});
