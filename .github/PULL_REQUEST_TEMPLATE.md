## Summary

<!-- What does this PR change? One or two sentences. -->

## Type of change

- [ ] New test(s)
- [ ] Updated test(s) or page object
- [ ] Bug fix (test was failing for the wrong reason)
- [ ] Visual baseline update
- [ ] CI / tooling change
- [ ] Documentation

## Test coverage

<!-- Which tag(s) does this PR affect? -->

- [ ] `@smoke`
- [ ] `@navigation`
- [ ] `@forms`
- [ ] `@functional`
- [ ] `@visual`
- [ ] `@responsive`

## Checklist

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] All new tests are tagged with at least one test category tag
- [ ] No hardcoded URLs in test bodies (using `siteConfig.url` or Playwright `baseURL`)
- [ ] No form submissions in tests
- [ ] Page object classes do not contain `expect()` calls
- [ ] Visual baseline snapshots updated (if visual tests changed)
- [ ] Smoke tests still pass on the PR branch

## Notes for reviewers

<!-- Anything the reviewer should pay special attention to, or known limitations. -->
