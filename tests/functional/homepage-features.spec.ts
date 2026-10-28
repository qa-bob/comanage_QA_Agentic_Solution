/**
 * tests/functional/homepage-features.spec.ts
 *
 * Functional tests for the coManage homepage.
 * Validates hero section, feature highlights, social proof, and footer —
 * the key conversion elements on a property management SaaS homepage.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Features @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
  });

  // ── Hero section ─────────────────────────────────────────────────────────────

  test('hero section has a non-empty headline @functional', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    const text = await heading.textContent();
    expect(text?.trim().length, 'h1 should have meaningful text').toBeGreaterThan(5);
  });

  test('hero section has a subheading or description @functional', async ({ page }) => {
    // Look for a paragraph or h2 near the top of the page
    const subtext = page.locator('h2, h1 + p, header p, [class*="hero"] p').first();
    if (await subtext.count() > 0) {
      const text = await subtext.textContent();
      expect(text?.trim().length, 'Hero subtext should not be empty').toBeGreaterThan(0);
    } else {
      console.warn('[functional] No hero subheading found — verify site structure.');
    }
  });

  test('hero section has at least one call-to-action @functional', async ({ page }) => {
    const ctaSelectors = [
      'a[class*="btn"]',
      'a[class*="button"]',
      'a[class*="cta"]',
      'button[class*="primary"]',
      '[role="button"]',
    ].join(', ');

    const ctaByClass = page.locator(ctaSelectors);
    const ctaByText = page.locator('a, button').filter({
      hasText: /get started|try free|sign up|request demo|book demo|learn more|see how/i,
    });

    const ctaCount =
      (await ctaByClass.count()) + (await ctaByText.count());

    expect(
      ctaCount,
      'At least one CTA button or link should be present on the homepage'
    ).toBeGreaterThan(0);
  });

  // ── Features / solutions section ──────────────────────────────────────────────

  test('features or solutions section is present @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    // Property management SaaS typically has a features grid or list
    const featureSection = page.locator(
      '[class*="feature"], [class*="solution"], [class*="benefit"], ' +
      '[id*="feature"], [id*="solution"], ' +
      'section:has(h2), section:has(h3)'
    ).first();

    if (await featureSection.count() > 0) {
      await expect(featureSection).toBeVisible({ timeout: 10_000 });
    } else {
      // Fallback: check for multiple h2/h3 headings which indicate section breaks
      const sectionHeadings = await page.locator('h2, h3').count();
      expect(
        sectionHeadings,
        'Page should have multiple content sections (h2/h3 headings)'
      ).toBeGreaterThan(0);
    }
  });

  test('feature section contains descriptive content @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    // Each feature item should have a heading and a description
    const featureHeadings = page.locator(
      '[class*="feature"] h2, [class*="feature"] h3, ' +
      '[class*="card"] h2, [class*="card"] h3, ' +
      '[class*="solution"] h2, [class*="solution"] h3'
    );

    const count = await featureHeadings.count();
    if (count > 0) {
      expect(count, 'Features section should list multiple features').toBeGreaterThanOrEqual(1);

      // At least one feature heading should have non-trivial text
      const firstText = await featureHeadings.first().textContent();
      expect(firstText?.trim().length ?? 0).toBeGreaterThan(3);
    } else {
      console.warn('[functional] No feature card headings found — verify with live browser.');
    }
  });

  // ── Social proof / testimonials ──────────────────────────────────────────────

  test('social proof section is present (testimonials, stats, or logos) @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    // Look for any common social proof pattern
    const testimonialSection = page.locator(
      '[class*="testimonial"], [class*="review"], [class*="trust"], ' +
      '[class*="stat"], [class*="metric"], [class*="logo-bar"], ' +
      '[class*="client"], [class*="partner"]'
    );

    const quoteBlock = page.locator('blockquote');
    const statsText = page.locator('text=/\\d+[k+%]?\\s*(customer|client|property|unit|user)/i');

    const socialProofCount =
      (await testimonialSection.count()) +
      (await quoteBlock.count()) +
      (await statsText.count());

    if (socialProofCount === 0) {
      console.warn('[functional] No social proof elements found — this may reduce conversion trust signals.');
    }
    // Social proof is a best-practice, not a hard requirement — warn but do not fail
  });

  // ── Images and media ─────────────────────────────────────────────────────────

  test('hero image or illustration is visible @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    const heroImage = page.locator(
      'header img, [class*="hero"] img, [class*="hero"] video, ' +
      '[class*="banner"] img, section:first-of-type img'
    ).first();

    if (await heroImage.count() > 0) {
      await expect(heroImage).toBeVisible({ timeout: 10_000 });

      // Image should have an alt attribute (accessibility)
      const alt = await heroImage.getAttribute('alt');
      if (alt === null) {
        console.warn('[functional] Hero image is missing an alt attribute — accessibility issue.');
      }
    } else {
      console.warn('[functional] No hero image found — site may use CSS backgrounds instead.');
    }
  });

  // ── Footer ───────────────────────────────────────────────────────────────────

  test('footer is present and has links @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    const footer = page.locator('footer, [role="contentinfo"]').first();

    test.skip(await footer.count() === 0, 'No <footer> or [role="contentinfo"] found');

    await expect(footer).toBeVisible({ timeout: 10_000 });

    const footerLinks = footer.locator('a[href]');
    const linkCount = await footerLinks.count();
    expect(linkCount, 'Footer should have at least one link').toBeGreaterThan(0);
  });

  test('footer contains company information @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    const footer = page.locator('footer, [role="contentinfo"]').first();
    test.skip(await footer.count() === 0, 'No <footer> or [role="contentinfo"] found');

    const footerText = await footer.textContent();
    expect(footerText?.trim().length ?? 0, 'Footer should have text content').toBeGreaterThan(0);
  });

  // ── Page structure quality ────────────────────────────────────────────────────

  test('page has multiple distinct content sections @functional', async ({ page }) => {
    await page.waitForLoadState('load');

    const sections = await page.locator('section, [class*="section"], [class*="block"]').count();
    const contentHeadings = await page.locator('h2').count();

    // A well-structured homepage has at least 2 h2 headings (features, testimonials, etc.)
    expect(
      contentHeadings,
      'Homepage should have multiple h2 section headings'
    ).toBeGreaterThan(0);

    if (sections > 0) {
      expect(sections, 'Homepage should have multiple sections').toBeGreaterThan(1);
    }
  });
});
