---
name: Bug report
about: A test is failing, flaky, or producing incorrect results
title: "[BUG] "
labels: bug
assignees: ''
---

## Failing test

<!-- Paste the full test name, e.g.: "Site Availability @smoke > no critical JavaScript errors on load" -->

**Test file:** `tests/<category>/<file>.spec.ts`
**Test name:**

## Failure type

- [ ] Test fails consistently
- [ ] Test is flaky (intermittent failures)
- [ ] Test passes but is asserting the wrong thing
- [ ] Test is slow (> 30s)

## Error output

```
<!-- Paste the Playwright error output here -->
```

## Steps to reproduce

1. Run `npm run test:...`
2. See failure

## Expected behavior

<!-- What should the test do? -->

## Actual behavior

<!-- What is the test actually doing? -->

## Environment

- OS:
- Browser: <!-- chromium-desktop / mobile-chrome / tablet -->
- Node.js version: `node --version`
- Playwright version: `npx playwright --version`

## Additional context

<!-- Screenshots, trace files, or any other context -->
