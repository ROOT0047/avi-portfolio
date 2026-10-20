(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const year = document.getElementById('current-year');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const projectCards = [...document.querySelectorAll('.project-card')];

  if (year) year.textContent = new Date().getFullYear();

  // Respect a saved preference when present. The page remains functional without storage.
  try {
    const savedTheme = localStorage.getItem('avi-portfolio-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
  } catch (_) { /* Storage may be unavailable in some browser contexts. */ }

  function updateThemeButton() {
    if (!themeToggle) return;
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
  updateThemeButton();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('avi-portfolio-theme', root.dataset.theme); } catch (_) { /* Optional preference only. */ }
    updateThemeButton();
  });

  function closeMenu() {
    nav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open') ?? false;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
      });
    });
  });

  // Reveal elements after their first intersection; show all if the API is unavailable.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Keep the active navigation indicator aligned with the section in view.
  if ('IntersectionObserver' in window) {
    const targets = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .1, .25, .5] });
    targets.forEach(target => sectionObserver.observe(target));
  }
})();
