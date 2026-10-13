/* =========================================================
   Rayan Albakistani — Portfolio Interactivity (Assignment 2)

   Carried over from Assignment 1:
     1) Dark / light theme toggle (persisted in localStorage)
     2) Mobile nav toggle

   New in Assignment 2:
     3) Dynamic greeting — changes with time of day and remembers the
        visitor's name (localStorage)
     4) Projects: filter tabs + live search + expand/collapse details,
        with a results count and an empty state
     5) Live GitHub feed — public API fetch with loading skeletons,
        a friendly error + retry, and an empty state
     6) Contact form — per-field inline validation, character counter,
        "sending" state and an animated confirmation
     7) Scroll reveal animations, active nav link, back-to-top button
   ========================================================= */

const STORAGE_KEYS = {
  theme: 'theme',
  visitorName: 'visitorName',
  projectFilter: 'projectFilter',
};

const GITHUB_USER = 'RayanAlba1';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initGreeting();
  initProjects();
  initGitHubFeed();
  initContactForm();
  initScrollEffects();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- helpers ---------- */

// localStorage can throw (private mode, blocked storage) — never let that break the page.
function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- 1) Theme toggle ---------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const root = document.documentElement;

  const saved = storageGet(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggleBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storageSet(STORAGE_KEYS.theme, next);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      icon.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      icon.textContent = '🌙';
    }
  }
}

/* ---------- 2) Mobile nav ---------- */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 3) Dynamic greeting + remembered visitor name ---------- */
function initGreeting() {
  const greeting = document.getElementById('greeting');
  const form = document.getElementById('visitorForm');
  const input = document.getElementById('visitorName');
  const forgetBtn = document.getElementById('visitorForget');
  const status = document.getElementById('visitorStatus');

  function timeOfDay() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function render() {
    const name = storageGet(STORAGE_KEYS.visitorName);
    if (name) {
      greeting.textContent = `${timeOfDay()}, ${name} 👋 — welcome back. My name is`;
      input.value = name;
      forgetBtn.hidden = false;
    } else {
      greeting.textContent = `${timeOfDay()} 👋 — my name is`;
      forgetBtn.hidden = true;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim().replace(/\s+/g, ' ');

    if (!name) {
      status.textContent = 'Type a name first so I know what to call you.';
      status.style.color = '#e0575b';
      input.focus();
      return;
    }
    if (name.length > 30) {
      status.textContent = 'That name is a bit long — 30 characters max.';
      status.style.color = '#e0575b';
      return;
    }

    storageSet(STORAGE_KEYS.visitorName, name);
    status.style.color = '';
    status.textContent = `Saved. I'll greet you as ${name} next time you visit.`;
    render();
  });

  forgetBtn.addEventListener('click', () => {
    storageRemove(STORAGE_KEYS.visitorName);
    input.value = '';
    status.style.color = '';
    status.textContent = 'Done — I forgot your name.';
    render();
  });

  render();
}

/* ---------- 4) Projects: filter tabs + live search + expand/collapse ---------- */
function initProjects() {
  const tabs = Array.from(document.querySelectorAll('.filter-tab'));
  const search = document.getElementById('projectSearch');
  const cards = Array.from(document.querySelectorAll('#projectsGrid .project-card'));
  const count = document.getElementById('resultsCount');
  const empty = document.getElementById('projectsEmpty');
  const clearBtn = document.getElementById('clearFilters');

  let activeFilter = storageGet(STORAGE_KEYS.projectFilter) || 'all';
  if (!tabs.some((t) => t.dataset.filter === activeFilter)) activeFilter = 'all';

  function setActiveTab(filter) {
    activeFilter = filter;
    tabs.forEach((tab) => {
      const on = tab.dataset.filter === filter;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
    });
    storageSet(STORAGE_KEYS.projectFilter, filter);
  }

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const categories = card.dataset.category.split(' ');
      const haystack = `${card.querySelector('h3').textContent} ${card.dataset.keywords} ${card.textContent}`.toLowerCase();

      const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
      const matchesQuery = query === '' || haystack.includes(query);
      const show = matchesFilter && matchesQuery;

      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    empty.hidden = visible !== 0;

    if (visible === cards.length && query === '') {
      count.textContent = `Showing all ${cards.length} projects`;
    } else {
      const label = visible === 1 ? 'project' : 'projects';
      const parts = [];
      if (activeFilter !== 'all') parts.push(`type “${activeFilter}”`);
      if (query) parts.push(`search “${query}”`);
      count.textContent = `${visible} ${label} match ${parts.join(' and ')}`;
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveTab(tab.dataset.filter);
      applyFilters();
    });
  });

  // Live search: filters as the visitor types (no submit needed)
  search.addEventListener('input', applyFilters);

  clearBtn.addEventListener('click', () => {
    search.value = '';
    setActiveTab('all');
    applyFilters();
    search.focus();
  });

  // Expand / collapse per card
  document.querySelectorAll('.toggle-details').forEach((btn) => {
    btn.addEventListener('click', () => {
      const details = btn.closest('.project-body').querySelector('.project-details');
      const isOpen = !details.hidden;
      details.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.textContent = isOpen ? 'Read more ↓' : 'Show less ↑';
    });
  });

  setActiveTab(activeFilter);
  applyFilters();
}

/* ---------- 5) Live GitHub feed (public API) ---------- */
function initGitHubFeed() {
  const list = document.getElementById('ghList');
  const status = document.getElementById('ghStatus');
  const meta = document.getElementById('ghMeta');
  const refreshBtn = document.getElementById('ghRefresh');

  const endpoint = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`;

  function showSkeletons() {
    list.innerHTML = Array.from({ length: 3 }, () => `
      <li class="gh-item skeleton" aria-hidden="true">
        <div class="skeleton-line w60"></div>
        <div class="skeleton-line w90"></div>
        <div class="skeleton-line w40"></div>
      </li>`).join('');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderRepos(repos) {
    if (!repos.length) {
      list.innerHTML = '';
      status.className = 'gh-status';
      status.textContent = 'No public repositories yet — check back soon.';
      return;
    }

    list.innerHTML = repos.map((repo, i) => `
      <li class="gh-item" style="animation-delay:${i * 60}ms">
        <h3><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a></h3>
        <p>${escapeHtml(repo.description || 'No description yet.')}</p>
        <div class="gh-foot">
          ${repo.language ? `<span class="gh-lang">${escapeHtml(repo.language)}</span>` : ''}
          <span>★ ${repo.stargazers_count}</span>
          <span>Updated ${formatDate(repo.updated_at)}</span>
        </div>
      </li>`).join('');

    status.className = 'gh-status';
    status.textContent = '';
    meta.textContent = `${repos.length} repositories · fetched ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }

  async function load() {
    refreshBtn.disabled = true;
    status.className = 'gh-status is-loading';
    status.innerHTML = '<span class="spinner" aria-hidden="true"></span> Loading repositories…';
    meta.textContent = '';
    showSkeletons();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 403) {
        throw new Error('GitHub is rate-limiting requests from this network right now. Try again in a few minutes.');
      }
      if (!response.ok) {
        throw new Error(`GitHub responded with status ${response.status}.`);
      }

      const repos = await response.json();
      renderRepos(repos);
    } catch (error) {
      list.innerHTML = '';
      status.className = 'gh-status is-error';
      const reason = error.name === 'AbortError'
        ? 'The request took too long.'
        : (error.message || 'Something went wrong.');
      status.innerHTML = `Couldn't load repositories. ${escapeHtml(reason)} <button class="btn btn-outline btn-small" id="ghRetry">Try again</button>`;
      document.getElementById('ghRetry').addEventListener('click', load);
    } finally {
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener('click', load);
  load();
}

/* ---------- 6) Contact form: inline validation + feedback ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const sendBtn = document.getElementById('sendBtn');
  const message = document.getElementById('message');
  const charCount = document.getElementById('charCount');

  const fields = {
    name: { input: form.name, error: document.getElementById('nameError') },
    email: { input: form.email, error: document.getElementById('emailError') },
    message: { input: form.message, error: document.getElementById('messageError') },
  };

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateField(key) {
    const { input, error } = fields[key];
    const value = input.value.trim();
    let msg = '';

    if (key === 'name' && value.length < 2) msg = 'Please enter your name (at least 2 characters).';
    if (key === 'email' && !value) msg = 'Please enter your email address.';
    else if (key === 'email' && !isValidEmail(value)) msg = 'That email address doesn’t look right — check for a typo.';
    if (key === 'message' && value.length < 10) msg = 'Tell me a little more — at least 10 characters.';

    error.textContent = msg;
    input.classList.toggle('is-invalid', Boolean(msg));
    return !msg;
  }

  // Validate as the visitor leaves each field, and clear errors while typing
  Object.keys(fields).forEach((key) => {
    const { input } = fields[key];
    input.addEventListener('blur', () => validateField(key));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateField(key);
    });
  });

  message.addEventListener('input', () => {
    charCount.textContent = `${message.value.length} / 500`;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const results = Object.keys(fields).map(validateField);
    if (results.includes(false)) {
      status.className = 'form-status is-error';
      status.textContent = 'Please fix the highlighted fields and try again.';
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // There is no backend yet (planned for a later assignment), so we simulate
    // a short "sending" state and then confirm client-side.
    const firstName = form.name.value.trim().split(' ')[0];
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    setTimeout(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send message';
      status.className = 'form-status is-success';
      status.textContent = `Thanks, ${firstName}! Your message has been noted — I'll get back to you soon.`;
      form.reset();
      charCount.textContent = '0 / 500';
    }, 700);
  });
}

/* ---------- 7) Scroll effects: reveal, active nav link, back-to-top ---------- */
function initScrollEffects() {
  const revealEls = document.querySelectorAll('.reveal');
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = Array.from(navLinks).map((a) => document.querySelector(a.getAttribute('href')));
  const toTop = document.getElementById('toTop');

  // Fade/slide elements in the first time they enter the viewport
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));

    // Safety net: if something never intersects (e.g. print preview, an
    // unusual browser), make sure nothing stays invisible for long.
    setTimeout(() => revealEls.forEach((el) => el.classList.add('is-visible')), 3000);

    // Highlight the nav link of the section currently on screen
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => s && navObserver.observe(s));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  window.addEventListener('scroll', () => {
    toTop.hidden = window.scrollY < 500;
  }, { passive: true });

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
