/* =====================================================================
   ANDROGENIC — interactions
   Vanilla JS. Scroll reveals, counters, score rings, parallax,
   magnetic buttons, nav, pricing toggle, cursor glow.
   ===================================================================== */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Year ---- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Preloader ---- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader')?.classList.add('done'), 600);
  });
  // Safety: never trap the user behind the preloader
  setTimeout(() => $('#preloader')?.classList.add('done'), 2600);

  /* ---- Nav scroll state + progress bar ---- */
  const nav = $('#nav');
  const progress = $('.scroll-progress span');
  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const burger = $('#navBurger');
  const menu = $('#mobileMenu');
  const toggleMenu = (open) => {
    burger?.classList.toggle('open', open);
    menu?.classList.toggle('open', open);
  };
  burger?.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---- Reveal on scroll ---- */
  const revealEls = $$('[data-reveal], .reveal-device');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
    runCounters(); runRings();
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---- Animated counters ---- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const fmt = (n) => {
      if (target >= 1000 && decimals === 0) return Math.round(n).toLocaleString();
      return n.toFixed(decimals);
    };
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target) + suffix;
    };
    requestAnimationFrame(tick);
  }
  function runCounters() {
    $$('.count[data-count]').forEach(el => { if (!el.dataset.done) { el.dataset.done = '1'; animateCount(el); } });
  }

  /* ---- Score rings ---- */
  const RING_CIRC = 327; // 2πr with r=52
  function fillRing(wrap) {
    const pct = Math.max(0, Math.min(100, parseFloat(wrap.dataset.ring || '0')));
    const fg = $('.ring-fg', wrap);
    if (fg) fg.style.strokeDashoffset = String(RING_CIRC * (1 - pct / 100));
  }
  function runRings() { $$('[data-ring]').forEach(fillRing); }

  // Trigger counters/rings when their section enters view
  if (!reduce && 'IntersectionObserver' in window) {
    const fxObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        $$('.count[data-count]', e.target).forEach(el => { if (!el.dataset.done) { el.dataset.done = '1'; animateCount(el); } });
        $$('[data-ring]', e.target).forEach(fillRing);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    $$('.hero, .stats, .app-showcase').forEach(s => fxObs.observe(s));
  }

  /* ---- Magnetic buttons ---- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---- Card spotlight + tilt ---- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.feature').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- Cursor glow ---- */
  const glow = $('.cursor-glow');
  if (glow && !reduce && matchMedia('(hover:hover)').matches) {
    let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    addEventListener('mousemove', (e) => { gx = e.clientX; gy = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---- Hero phone parallax on mouse ---- */
  const phone = $('#heroPhone');
  if (phone && !reduce && matchMedia('(hover:hover)').matches) {
    const hero = $('.hero');
    hero?.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform =
        `rotateY(${-14 + dx * 10}deg) rotateX(${6 - dy * 8}deg) translateY(-4px)`;
    });
    hero?.addEventListener('mouseleave', () => { phone.style.transform = ''; });
  }

  /* ---- Pricing toggle ---- */
  const toggle = $('.price-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      $$('button', toggle).forEach(b => b.classList.toggle('active', b === btn));
      const plan = btn.dataset.plan; // yearly | monthly
      $$('[data-yearly]').forEach(el => {
        el.textContent = plan === 'yearly' ? el.dataset.yearly : el.dataset.monthly;
      });
    });
  }
})();
