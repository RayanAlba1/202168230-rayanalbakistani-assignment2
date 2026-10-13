# AI Usage Report — Assignment 2 (Interactive Features)

## Tools used

| Tool | How I used it |
|---|---|
| **Claude (Anthropic)** | Main assistant: planning the feature set against the rubric, generating the first draft of the new JavaScript and CSS, debugging, reviewing my code for accessibility, and drafting the three documentation files. |
| **Claude — browser testing (Playwright)** | I had it write and run a small automated test script that opened the page in a headless browser, clicked through every feature (filters, search, expand/collapse, saved name, form validation, theme, API failure, mobile viewport) and reported what it saw, so I could confirm each state really works instead of assuming. |

## What AI was used for, step by step

1. **Planning against the rubric.** I pasted the assignment's five requirement
   areas and asked for a feature plan that would satisfy each one with the
   smallest set of changes to my Assignment 1 site. The plan it proposed
   (filter tabs + live search, a GitHub API feed, saved visitor name, inline
   form validation, scroll-reveal animations) is what I built, after I removed
   one idea I didn't want (a "typing effect" in the hero — decorative, not useful).

2. **Code generation.** It produced the first versions of:
   - `initProjects()` — filtering, live search, results counter, empty state,
     expand/collapse;
   - `initGitHubFeed()` — `fetch` with a time-out, skeleton loaders, error +
     retry, empty state;
   - `initGreeting()` — time-of-day greeting with a name saved in `localStorage`;
   - the rewritten `initContactForm()` — per-field validation and the
     "Sending…" state;
   - the "Assignment 2 additions" block in `css/styles.css` (tabs, pills,
     skeleton shimmer, reveal, keyframes, reduced-motion rules).

3. **Debugging.** Two real problems it helped me find and fix:
   - **Invisible content in a full-page capture.** Sections below the fold use
     a scroll-reveal animation (opacity 0 until they enter the viewport). In a
     full-page screenshot and in print preview they stayed invisible. We added
     a 3-second safety fallback that marks every `.reveal` element visible, so
     nothing can stay hidden on an unusual browser or when printing.
   - **Wrong placeholder captions.** I had reused `project2.svg` for the
     Arabati card, so the thumbnail said "Senior Design capstone". The AI's
     screenshot review caught it; I created `project3.svg` and `project4.svg`.

4. **Accessibility review.** I asked it to check the markup; it suggested
   `role="tablist"` / `aria-selected` on the filter tabs, `aria-expanded` on
   the Read-more buttons, `aria-live` on every status area (results counter,
   GitHub status, form status, greeting), and a `prefers-reduced-motion` rule.
   I applied all of these.

5. **Documentation.** First drafts of `README.md`, this report, and
   `docs/technical-documentation.md`, which I edited for accuracy against the
   final code (file names, function names, behaviour).

## What I changed or decided myself

- **Scope**: chose the GitHub API over a random "fun facts" API because it is
  actually about me and will stay useful as the portfolio grows. Chose to keep
  the project cards in plain HTML (not generated from a JS array) so the content
  is visible without JavaScript and easy for me to edit.
- **Content**: wrote the project descriptions, statuses and tags myself (Optimal X,
  Arabati, Senior Design, operations analytics) — the AI drafts were generic.
- **Validation rules**: set the thresholds (name ≥ 2 characters, message ≥ 10
  characters, 500-character limit with a live counter) and wrote the error
  messages so they say what to do next, not just "invalid".
- **Error handling**: added the specific GitHub rate-limit (HTTP 403) message
  and the 8-second time-out after reading how the unauthenticated API behaves.
- **Removed**: the AI first wrapped the GitHub list in a `<table>`; I changed
  it to a responsive card grid that collapses to one column on phones.
- **Kept the Assignment 1 identity**: same colours, fonts and layout — the
  assignment is about interactivity, not a redesign.

## What I learned

- How `IntersectionObserver` replaces scroll-event hacks for both "reveal on
  scroll" and "which section is active" — one observer, no layout thrashing.
- The difference between validating on `blur` (first time) and on `input`
  (only once a field is already marked invalid), which stops the form from
  shouting at the visitor while they are still typing.
- Why `fetch` needs an `AbortController` time-out and explicit checks for
  `response.ok` and status 403: a public API can be slow, down, or
  rate-limited, and each case deserves its own message.
- `localStorage` can throw (private mode, blocked storage), so every read and
  write is wrapped in a small helper with `try/catch` and the page never depends
  on it.
- Animations need an off switch: `@media (prefers-reduced-motion: reduce)` keeps
  the content visible and removes the motion.

## Responsible use

I read every generated line before keeping it, ran the site myself in Chrome
(desktop and mobile emulation) with the console open, and used the automated
browser test only to confirm behaviour I had already understood. Nothing was
submitted unmodified or unverified; the sections above list exactly what was
AI-assisted and what I changed, as required by the course's academic-integrity
policy.
