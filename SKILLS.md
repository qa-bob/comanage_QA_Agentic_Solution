# SKILLS.md — Claude Code Slash Commands

Reference for all slash commands (skills) available in this repository. Invoke any command inside a Claude Code session by typing its name.

---

## Available Commands

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

Crawls the live coManage website and produces an updated `site.config.json`. Run this whenever the site is redesigned or new pages are added.

**Usage:**
```
/analyze-site
/analyze-site https://comanage.com
```

**What it does:**
1. Navigates to the URL in `site.config.json` (or a provided URL)
2. Extracts: page title, meta description, nav links, forms, h1/h2 headings, CTAs
3. Detects: HTTPS, responsive viewport meta, contact form presence, auth gates
4. Writes an updated `site.config.json` to disk
5. Reports any site issues found (missing meta, broken links, no h1)

**Output:** Updated `site.config.json` + issues checklist

---

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

Analyzes the site and generates a complete Playwright test suite from scratch — page objects, fixtures, and all test categories. Use on initial setup or after a major site redesign.

**Usage:**
```
/generate-full-suite
```

**What it does:**
1. Runs `/analyze-site` to ensure `site.config.json` is current
2. Creates or updates page object classes in `src/pages/`
3. Generates `tests/smoke/`, `tests/navigation/`, `tests/forms/`, `tests/functional/`, `tests/visual/`, `tests/responsive/`
4. Runs `npx tsc --noEmit` to verify TypeScript compiles
5. Reports what was created and what needs manual review

**Output:** New/updated files across `src/pages/` and `tests/`

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

Executes the `@smoke` test suite and returns a human-readable report.

**Usage:**
```
/run-smoke
```

**What it does:**
1. Runs `npx playwright test --grep @smoke`
2. Parses the results JSON
3. Reports: pass/fail counts, duration, any failures with error details
4. Flags regressions compared to the last run (if results are cached)

**Output:** Pass/fail summary with actionable failure details

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

Regenerates visual regression baseline screenshots. Run after intentional UI changes that cause visual test failures.

**Usage:**
```
/update-baseline
```

**What it does:**
1. Runs `npx playwright test --grep @visual --update-snapshots`
2. Reports which snapshots were updated vs unchanged
3. Reminds you to review the diffs before committing

**Output:** List of updated snapshot files

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

Generates a formatted summary of the most recent test run from `test-results/results.json`.

**Usage:**
```
/generate-report
```

**What it does:**
1. Reads `test-results/results.json`
2. Summarises: total tests, passes, failures, skips, flakes, duration
3. Lists failing tests with their error messages
4. Highlights any new failures compared to expected (if a baseline exists)

**Output:** Formatted markdown report in the console

---

## Writing a New Skill

Skills live in `.claude/commands/<command-name>.md`. Each file describes a repeatable workflow for Claude Code to follow.

### Skill file template

```markdown
# /<command-name>

One-sentence description of what this command does.

## Usage

/<command-name> [optional-argument]

## What this command does

1. Step one — what Claude does first
2. Step two — ...
3. Step three — ...

## Output format

Describe what the agent returns: files created, console output, etc.

## Edge cases

Describe any special handling for unusual inputs or site configurations.
```

### Rules for skills in this repo

- One file per command in `.claude/commands/`
- File name matches the slash command: `/analyze-site` → `analyze-site.md`
- Every skill must respect the repo's contributor rules (no form submission, no hardcoded URLs, etc.)
- Skills that generate code must run `npx tsc --noEmit` as a final step
- Update this `SKILLS.md` when adding a new skill

---

## Sub-Agents

Sub-agents differ from skills: they are specialized AI assistants that Claude delegates tasks to, each with their own context window, tool access, and system prompt.

| Agent | File | Invoked by |
|-------|------|------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | `/analyze-site`, onboarding |
| `test-generator` | `.claude/agents/test-generator.md` | `/generate-full-suite`, targeted generation |

See `AGENTS.md` for detailed agent specifications.
