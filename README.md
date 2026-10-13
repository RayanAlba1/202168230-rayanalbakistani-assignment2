# Rayan Albakistani — Personal Portfolio (Assignment 2: Interactive Features)

The second iteration of my professional portfolio website, built for **SWE 363 –
Web Engineering & Development**, Assignment 2: *Interactive Features*.

It starts from my Assignment 1 portfolio
([`202168230-rayan-albakistani-assignment1`](https://github.com/RayanAlba1/202168230-rayan-albakistani-assignment1))
and makes the site interactive: content that reacts to the visitor, live data from
a public API, saved preferences, inline validation, and motion that helps rather
than distracts.

## Live demo

> Add the GitHub Pages link here once deployed, e.g.
> `https://rayanalba1.github.io/202168230-rayanalbakistani-assignment2/`

## What's new since Assignment 1

| Requirement | What I built | Where |
|---|---|---|
| **Dynamic content** | Project **filter tabs** (All / Product / Data / Web / Engineering), a **live search** box that filters as you type, **Read more / Show less** on every project card, a results counter and an empty state with a "Clear filters" action. A **time-of-day greeting** in the hero. | `index.html` → `#projects`, `js/script.js` → `initProjects()`, `initGreeting()` |
| **Data handling** | (1) **Public API**: the "Live from GitHub" section fetches my most recently updated public repositories from `api.github.com` and renders them. (2) **localStorage**: remembers the theme, the visitor's name (personal greeting on the next visit) and the last project filter. (3) **Validated form**: the contact form validates each field and shows a confirmation. | `js/script.js` → `initGitHubFeed()`, `initGreeting()`, `initContactForm()` |
| **Animation & transitions** | Fade/slide-in reveal as sections scroll into view, hover lift on cards and buttons, smooth expand of project details, shimmer skeletons while loading, an animated success message and a "shake" on form errors. Respects `prefers-reduced-motion`. | `css/styles.css` → "Assignment 2 additions" |
| **Error handling & feedback** | Inline, per-field error messages; "Sending…" state on the submit button; loading indicator + skeletons; friendly API error with a **Try again** button (covers network failure, time-out and GitHub rate limits); "No projects found" empty state; `aria-live` regions so screen readers hear status changes. | `js/script.js`, `index.html` |
| **AI enhancement** | Claude used for scaffolding, debugging and documentation — see `docs/ai-usage-report.md`. | `docs/` |

Everything from Assignment 1 still works: responsive layout, dark/light theme
toggle, mobile menu, and the same navy/teal visual identity.

## Project structure

```
assignment-2/
├── README.md
├── index.html
├── css/
│   └── styles.css              # Assignment 1 styles + "Assignment 2 additions" block
├── js/
│   └── script.js               # 7 small init functions, one per feature
├── assets/
│   └── images/
│       ├── avatar.svg
│       ├── project1.svg … project4.svg   # placeholder thumbnails
├── docs/
│   ├── ai-usage-report.md
│   └── technical-documentation.md
└── .gitignore
```

## Running it locally

No build step, no dependencies — plain HTML, CSS and JavaScript.

1. Clone the repository:
   ```bash
   git clone https://github.com/RayanAlba1/202168230-rayanalbakistani-assignment2.git
   cd 202168230-rayanalbakistani-assignment2
   ```
2. Serve the folder (recommended — `fetch()` and `localStorage` behave best over
   `http://` rather than `file://`):
   ```bash
   python3 -m http.server 8080
   # or
   npx serve .
   ```
3. Open `http://localhost:8080` in your browser.

Opening `index.html` directly also works in current browsers; only the GitHub
section needs an internet connection (it shows a clear error and a retry button
when offline).

### Trying the features

- **Projects**: click a filter tab, then type in the search box (e.g. `react`,
  `pos`, `python`). Type nonsense to see the empty state; click **Clear filters**.
- **Read more**: expands each project card without leaving the page.
- **Greeting**: type your first name under the hero and press **Save**, then
  reload the page — it greets you by name. **Forget me** clears it.
- **GitHub feed**: loads automatically; press **Refresh** to fetch again.
  Disconnect from the internet and refresh to see the error state.
- **Contact form**: submit it empty, then with a bad email, then correctly — each
  state gives a specific message.
- **Theme**: the moon/sun button; your choice is remembered.

## Deploying (optional)

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**,
branch `main`, folder `/ (root)`. The site is then live at
`https://<username>.github.io/<repo-name>/`.

## AI usage

I used **Claude** (Anthropic) to plan the feature set against the rubric, draft
the new JavaScript and CSS, debug two issues, and draft the documentation. I
reviewed, tested and edited everything myself. The full breakdown — tools, what
each was used for, what I changed, and what I learned — is in
[`docs/ai-usage-report.md`](docs/ai-usage-report.md).

## Tech stack

- HTML5, CSS3 (custom properties, Grid, Flexbox, keyframe animations, media queries)
- Vanilla JavaScript (ES2020+): `fetch` with `AbortController`, `IntersectionObserver`, `localStorage`
- GitHub REST API (public, unauthenticated)
- Google Fonts: Sora (headings) + Inter (body)

## Browser support

Tested in current Chrome, Edge, Firefox and Safari on desktop, and in a
390 px mobile viewport. Features degrade gracefully: if `IntersectionObserver`
is unavailable the content is shown without animation; if `localStorage` is
blocked the site still works, it just doesn't remember preferences.
