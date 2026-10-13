# Technical Documentation — Assignment 2

## Overview

Single-page static portfolio with four in-page sections (About, Projects,
GitHub, Contact) and a sticky header. No backend, no build tooling, no
framework: semantic HTML, hand-written CSS, and vanilla JavaScript. The only
network dependency at runtime is the public GitHub REST API (and Google Fonts).

## Architecture

```
index.html         page structure & content — all project cards are real HTML
                   (readable without JavaScript); JS only shows/hides them
css/styles.css     Assignment 1 styles unchanged, followed by an
                   "Assignment 2 additions" block (toolbar, pills, GitHub cards,
                   skeletons, form feedback, reveal + keyframe animations,
                   reduced-motion rules, responsive tweaks)
js/script.js       seven independent init functions called on DOMContentLoaded
assets/images/     SVG placeholders (avatar + four project thumbnails)
docs/              this file + the AI usage report
```

### `js/script.js` — module map

| Function | Responsibility | Storage / network |
|---|---|---|
| `initThemeToggle()` | Dark/light theme, `data-theme` on `<html>` | `localStorage["theme"]` |
| `initMobileNav()` | Hamburger menu, closes on link click | — |
| `initGreeting()` | Time-of-day greeting; save / forget the visitor's name | `localStorage["visitorName"]` |
| `initProjects()` | Filter tabs, live search, results counter, empty state, Read more / Show less | `localStorage["projectFilter"]` |
| `initGitHubFeed()` | Fetch + render repositories; loading, error, empty states; refresh/retry | `GET https://api.github.com/users/RayanAlba1/repos?sort=updated&per_page=6` |
| `initContactForm()` | Per-field validation, character counter, sending state, confirmation | — (no backend yet) |
| `initScrollEffects()` | Reveal-on-scroll, active nav link, back-to-top button | — |

Three tiny helpers sit above them: `storageGet / storageSet / storageRemove`
(wrap `localStorage` in `try/catch`) and `escapeHtml` (used before inserting
any API text into the DOM).

## Feature details

### Dynamic content — projects

- Each `<article class="project-card">` carries `data-category="…"` (space
  separated, a card can belong to several types) and `data-keywords="…"`.
- `applyFilters()` computes `matchesFilter && matchesQuery` per card and toggles
  the `is-hidden` class (`display: none`). The visible count drives the
  results sentence and the empty state (`#projectsEmpty`, with a Clear-filters
  button that resets both the tab and the search box).
- The search is case-insensitive and matches against the title, the keyword
  list and the card text, on every `input` event — no submit button.
- "Read more" toggles the `hidden` attribute on `.project-details` and flips
  `aria-expanded` and the button label; the open state animates with the
  `expand` keyframe.
- The active filter is saved so the visitor's last choice is restored on reload.

### Dynamic content — greeting

`initGreeting()` picks "Good morning / afternoon / evening / night" from the
visitor's local clock and, if a name is saved, renders
"Good evening, Rayan 👋 — welcome back". The small form validates (non-empty,
≤ 30 characters), saves to `localStorage`, re-renders immediately and shows a
status line; "Forget me" removes the key.

### Data handling — GitHub API

1. `load()` disables the Refresh button, shows a spinner line and three
   shimmer skeleton cards.
2. `fetch()` runs with an `AbortController` that aborts after 8 s.
3. Responses are checked explicitly: `403` → rate-limit message; any other
   non-OK status → "GitHub responded with status N"; abort → "The request took
   too long"; network failure → the browser's error text. Every failure
   renders a red status line with a **Try again** button that calls `load()`.
4. On success, repositories are rendered as cards (name → link, description or
   "No description yet.", language, stars, last update). Zero repositories
   renders an explicit empty message. All API strings pass through
   `escapeHtml()` before insertion.
5. The toolbar shows the count and the fetch time; **Refresh** re-runs `load()`.

### Data handling — contact form

- `validateField(key)` holds the rules: name ≥ 2 characters; email present and
  matching a simple regex; message ≥ 10 characters (hard max 500 via
  `maxlength`, with a live `n / 500` counter).
- Validation runs on `blur`, and on `input` only once a field is already marked
  `is-invalid`, so errors clear as the visitor fixes them.
- On submit, all fields are validated; the first invalid one receives focus and
  the status line shakes. On success the button shows "Sending…" and is
  disabled for 700 ms, then an animated confirmation appears and the form
  resets. There is intentionally no network request — a backend is planned
  for a later assignment.

### Animation and transitions

| Effect | Implementation |
|---|---|
| Reveal on scroll | `.reveal` starts at `opacity: 0; translateY(18px)`; `IntersectionObserver` adds `.is-visible` the first time an element is ≥ 12 % visible. A 3 s fallback reveals everything that never intersected (print, unusual browsers). |
| Hover | Cards lift and deepen their shadow; tabs and buttons lift 1–2 px; GitHub cards change border colour. |
| Expand details | `expand` keyframe (fade + 6 px slide). |
| Loading | `spin` keyframe on the spinner; `shimmer` gradient on skeleton lines. |
| Feedback | `popIn` on success messages, `shake` on error messages. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables the reveal transition, the keyframe animations and smooth scrolling while keeping all content visible. |

### Error handling and user feedback

Every status element is an `aria-live="polite"` region, so screen readers
announce changes: the greeting, `#resultsCount`, `#visitorStatus`,
`#ghStatus`, each `.field-error`, and `#formStatus`. Messages always say what
happened and what to do next ("…check for a typo", "Try again", "Clear filters").

## Responsive design

Breakpoints carried over from Assignment 1 (`≤ 860px`, `≤ 700px`, `≤ 480px`)
plus two additions: the GitHub grid goes 3 → 2 → 1 columns at 860 px / 600 px,
and the search box stretches to full width on small screens. Verified at a
390 × 844 viewport with no horizontal overflow.

## Compatibility and performance

- Uses only widely supported APIs: `fetch`, `AbortController`,
  `IntersectionObserver`, `localStorage`, CSS custom properties and keyframes.
  `IntersectionObserver` and `localStorage` have explicit fallbacks.
- One request to the GitHub API per load (max 6 items); no libraries; no
  images beyond small inline SVGs; CSS transitions use `transform` and
  `opacity` only, so animations stay on the compositor.
- `fetch` responses are never trusted raw: text is escaped before rendering.

## Known limitations / next steps

- The contact form does not send anything yet (backend planned).
- Project thumbnails are placeholders; replace the SVGs under `assets/images/`.
- The GitHub feed is limited by the unauthenticated API rate limit (60
  requests/hour per IP); the UI explains this when it happens.
