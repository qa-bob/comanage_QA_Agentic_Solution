---
name: Test request
about: Request new test coverage for a feature or page
title: "[TEST] "
labels: enhancement
assignees: ''
---

## Feature or page to test

<!-- Describe the feature, page, or user flow that needs test coverage. -->

**URL / path:** `https://comanage.com/...`

## Test category

- [ ] `@smoke` — availability / page load
- [ ] `@navigation` — links and menus
- [ ] `@forms` — form field interaction
- [ ] `@functional` — business logic / feature behaviour
- [ ] `@visual` — screenshot regression
- [ ] `@responsive` — layout at different viewports

## Proposed test scenarios

<!-- List the specific scenarios that should be covered. -->

1.
2.
3.

## Why this coverage is needed

<!-- What risk does missing coverage create? E.g., high-traffic page, recent site change, known bug regression. -->

## Acceptance criteria

- [ ] Test(s) added under `tests/<category>/`
- [ ] Page object updated or created in `src/pages/` if new selectors needed
- [ ] All tests tagged correctly
- [ ] `npm run typecheck` passes
- [ ] Tests pass against the live site
