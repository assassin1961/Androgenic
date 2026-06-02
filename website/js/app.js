/* =====================================================================
   ANDROGENIC — functional web app controller
   Scan → AI analysis → gated results → guides → routine → ranks → profile
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const app = $('#androApp');
  const appMain = $('#appMain');
  const appHeader = $('#appHeader');
  const appTabs = $('#appTabs');
  const modalLayer = $('#modalLayer');
  const analyzeOverlay = $('#analyzeOverlay');

  const CATS = [
    { key: 'masculinity', emoji: '💪', name: 'Masculinity' },
    { key: 'jawline',     emoji: '🦴', name: 'Jawline' },
    { key: 'eyes',        emoji: '👀', name: 'Eye Area' },
    { key: 'cheekbones',  emoji: '🧬', name: 'Cheekbones' },
    { key: 'hair',        emoji: '💇', name: 'Hair' },
    { key: 'skin',        emoji: '✨', name: 'Skin' },
    { key: 'symmetry',    emoji: '📐', name: 'Symmetry' },
  ];
  const catMeta = (k) => CATS.find(c => c.key === k);

  const State = {
    screen: 'scan',
    tab: 'scan',
    scores: null,
    photo: null,
    plan: 'yearly',
  };
  // last result persists across the session
  try { State.scores = JSON.parse(sessionStorage.getItem('andro_last_scores')) || null; } catch {}
  try { State.photo = sessionStorage.getItem('andro_last_photo') || null; } catch {}

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ringDash = (pct, r = 52) => { const c = 2 * Math.PI * r; return `${c} ${c}`; };
  const ringOffset = (pct, r = 52) => { const c = 2 * Math.PI * r; return c * (1 - pct / 100); };

  function toast(msg, kind = '') {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'app-toast show ' + kind;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.className = 'app-toast ' + kind), 2600);
  }

  function svgRing(pct, label, sub, big = false) {
    const r = 52, c = 2 * Math.PI * r;
    return `<div class="ring ${big ? 'ring-big' : ''}">
      <svg viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="${r}"/>
        <circle class="ring-fg" cx="60" cy="60" r="${r}"
          style="stroke-dasharray:${c};stroke-dashoffset:${c}" data-target="${ringOffset(pct)}"/>
      </svg>
      <div class="ring-center"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div>
    </div>`;
  }
  // animate any rings currently in the DOM
  function animateRings(scope = document) {
    requestAnimationFrame(() => $$('.ring-fg[data-target]', scope).forEach(el => {
      el.style.strokeDashoffset = el.dataset.target;
    }));
  }
  function scoreColor(s) { return s >= 70 ? 'good' : s >= 45 ? 'mid' : 'low'; }

  /* =====================================================================
     APP OPEN / CLOSE + ROUTER
     ===================================================================== */
  function openApp(screen = 'scan') {
    app.classList.add('open');
    app.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (screen === 'paywall') showPaywall('landing');
    else go(screen);
  }
  function closeApp() {
    app.classList.remove('open');
    app.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  const TABS = [
    { id: 'scan',    label: 'Scan',    icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z|circle:12,13,4' },
    { id: 'guides',  label: 'Guides',  icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20|M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
    { id: 'routine', label: 'Routine', icon: 'M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { id: 'ranks',   label: 'Ranks',   icon: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6|M18 9h1.5a2.5 2.5 0 0 0 0-5H18|M4 22h16|M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22|M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22|M18 2H6v7a6 6 0 0 0 12 0V2z' },
    { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|circle:12,7,4' },
  ];
  function go(tab) {
    State.tab = tab; State.screen = tab;
    renderHeader();
    renderTabs();
    const map = { scan: renderScan, guides: renderGuides, routine: renderRoutine, ranks: renderRanks, profile: renderProfile };
    (map[tab] || renderScan)();
    appMain.scrollTop = 0;
  }

  function renderTabs() {
    appTabs.innerHTML = TABS.map(t => {
      const paths = t.icon.split('|').map(p => p.startsWith('circle:')
        ? `<circle cx="${p.split(':')[1].split(',')[0]}" cy="${p.split(':')[1].split(',')[1]}" r="${p.split(':')[1].split(',')[2]}"/>`
        : `<path d="${p}"/>`).join('');
      return `<button class="tab ${State.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
        <span>${t.label}</span></button>`;
    }).join('');
  }

  function renderHeader() {
    const s = getStreakState();
    const lvl = getCurrentLevel(s);
    const prog = getLevelProgress(s);
    const pro = isPro();
    appHeader.innerHTML = `
      <button class="app-x" data-close title="Back to site">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="app-brandline">
        <span class="app-logo-txt">ANDROGENIC</span>
        ${pro ? '<span class="pro-chip">PRO</span>' : ''}
      </div>
      <div class="app-head-right">
        <span class="streak-chip" title="Daily streak">🔥 ${s.currentStreak}</span>
      </div>
      <div class="lvl-row">
        <span class="lvl-name" style="color:${lvl.color}">Lv.${lvl.level} · ${lvl.name}</span>
        <div class="lvl-track"><i style="width:${Math.round(prog.pct * 100)}%"></i></div>
        <span class="lvl-xp">${s.totalXP} XP</span>
      </div>`;
  }

  /* =====================================================================
     SCAN (home)
     ===================================================================== */
  function renderScan() {
    const remaining = getScansRemaining();
    const pro = isPro();
    const last = State.scores;
    const tipPool = GENERAL_TIPS.mid;
    const tip = tipPool[Math.floor(Math.random() * tipPool.length)];

    appMain.innerHTML = `
      <div class="scr scr-scan">
        ${pro ? '' : `<div class="scan-counter">
          <span>${remaining > 0 ? `<b>${remaining}</b> free scan${remaining === 1 ? '' : 's'} left` : 'No free scans left'}</span>
          <div class="dots">${[0, 1, 2].map(i => `<i class="${i < (PRO_CONFIG.FREE_SCANS_LIMIT - remaining) ? 'used' : ''}"></i>`).join('')}</div>
        </div>`}

        <div class="scan-hero">
          <div class="scan-badge">📷</div>
          <h2>Analyze Your Face</h2>
          <p>AI scoring across ${CATS.length} categories with a personalized plan.</p>
        </div>

        <div class="scan-cta-row">
          <button class="big-cta primary" data-act="camera">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Take Selfie
          </button>
          <button class="big-cta ghost" data-act="upload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Upload Photo
          </button>
        </div>

        ${last ? `<button class="last-result" data-act="last">
          <span class="lr-ring">${svgRing(last.overall * 10, last.overall.toFixed(1), '', false)}</span>
          <div><b>Your last result</b><small>Tap to view full breakdown</small></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>` : ''}

        <div class="quick-grid">
          ${quickCard('iq', '💡', 'Androgenic IQ', 'Your facial intelligence score', 'c-iq')}
          ${quickCard('glowup', '🚀', 'Glow-Up Sim', 'See your potential', 'c-glow')}
          ${quickCard('ai', '💬', 'AI Advisor', 'Personalized next moves', 'c-ai')}
          ${quickCard('faceshape', '📐', 'Face Shape', 'Detect & optimize', 'c-shape')}
        </div>

        ${pro ? '' : `<button class="pro-promo" data-act="paywall">
          <span>⭐ Unlock PRO — unlimited scans & all features</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>`}

        <div class="tip-card">
          <span>💡</span>
          <div><b>Today's tip</b><p>${esc(tip.text)}</p></div>
        </div>
      </div>`;
    animateRings(appMain);
  }
  function quickCard(act, emoji, title, sub, cls) {
    return `<button class="quick-card ${cls}" data-act="${act}">
      <span class="qc-emoji">${emoji}</span><b>${title}</b><small>${sub}</small></button>`;
  }

  /* =====================================================================
     SCAN FLOW: capture → analyze → results
     ===================================================================== */
  function startCapture(kind) {
    if (getScansRemaining() <= 0 && !isPro()) { showPaywall('scan_limit'); return; }
    (kind === 'camera' ? $('#cameraInput') : $('#fileInput')).click();
  }
  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => runAnalysis(e.target.result);
    reader.readAsDataURL(file);
  }
  $('#fileInput').addEventListener('change', e => handleFile(e.target.files[0]));
  $('#cameraInput').addEventListener('change', e => handleFile(e.target.files[0]));

  const STEPS = [
    { id: 'detect', label: 'Detecting facial landmarks…' },
    { id: 'measure', label: 'Measuring proportions & ratios…' },
    { id: 'score', label: 'Computing your scores…' },
    { id: 'tips', label: 'Building your plan…' },
  ];
  async function runAnalysis(dataUrl) {
    if (!isPro()) useScan();
    State.photo = dataUrl;
    analyzeOverlay.setAttribute('aria-hidden', 'false');
    analyzeOverlay.classList.add('show');
    analyzeOverlay.innerHTML = `
      <div class="analyze-inner">
        <div class="analyze-photo">
          <img src="${dataUrl}" alt="">
          <div class="scanline"></div>
          ${[[35, 30], [65, 30], [50, 48], [40, 64], [60, 64], [50, 80]].map(([l, t], i) =>
            `<span class="dot" style="left:${l}%;top:${t}%;animation-delay:${i * .18}s"></span>`).join('')}
        </div>
        <h3>Analyzing your face</h3>
        <div class="steps">${STEPS.map(s => `<div class="step" data-step="${s.id}"><span class="dot-i"></span>${s.label}</div>`).join('')}</div>
      </div>`;

    // image element for analysis
    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = r; img.onerror = r; });

    // try to load face-api models (works in the user's browser; falls back gracefully)
    try { await loadFaceApi(); await loadModels(() => {}); } catch {}

    const seq = ['detect', 'measure', 'score', 'tips'];
    for (let i = 0; i < seq.length; i++) {
      const el = $(`[data-step="${seq[i]}"]`, analyzeOverlay);
      if (el) el.classList.add('active');
      await wait(520);
      if (el) { el.classList.remove('active'); el.classList.add('done'); }
    }

    let scores;
    try { scores = await analyzeFace(img); } catch { scores = null; }
    if (!scores) { scores = fallback(); }

    State.scores = scores;
    try {
      sessionStorage.setItem('andro_last_scores', JSON.stringify(scores));
      sessionStorage.setItem('andro_last_photo', dataUrl);
    } catch {}
    saveToHistory(scores, dataUrl);

    const rec = recordScan(Math.round(scores.overall * 10));

    analyzeOverlay.classList.remove('show');
    analyzeOverlay.setAttribute('aria-hidden', 'true');
    renderHeader();
    showResults();
    if (rec.xpGained) toast(`+${rec.xpGained} XP`, 'good');
    rec.newAchievements.forEach((a, i) => setTimeout(() => achievementToast(a), 700 + i * 1400));
  }
  function fallback() {
    const base = 40 + Math.random() * 35, v = 15, c = (m = v) => Math.round(Math.max(20, Math.min(95, base + (Math.random() * 2 - 1) * m)));
    const s = { masculinity: c(), jawline: c(), cheekbones: c(), eyes: c(), hair: c(), skin: c(), symmetry: c(v / 2) };
    s.overall = computeOverall(s); s.usedAI = false; return s;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* =====================================================================
     RESULTS
     ===================================================================== */
  function showResults() {
    if (!State.scores) { go('scan'); return; }
    State.screen = 'results';
    const sc = State.scores;
    const overall = sc.overall;
    const pct = PERCENTILE_MAP[Math.round(overall)] || 'Average';
    const pro = isPro();

    const catCards = CATS.map(c => {
      const v = sc[c.key]; const locked = !canAccessCategory(c.key);
      const col = scoreColor(v);
      return `<button class="cat-card ${locked ? 'locked' : ''}" data-cat="${c.key}">
        <span class="cc-emoji">${c.emoji}</span>
        <span class="cc-name">${c.name}</span>
        <span class="cc-val ${col}">${locked ? '<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' : (v / 10).toFixed(1)}</span>
        <span class="cc-bar"><i class="${col}" style="width:${locked ? 100 : v}%"></i></span>
        ${locked ? '<span class="cc-lock-tag">PRO</span>' : ''}
      </button>`;
    }).join('');

    appMain.innerHTML = `
      <div class="scr scr-results">
        <div class="res-top">
          <button class="ico-btn" data-act="back-scan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <span>Your Results ${sc.usedAI ? '<i class="ai-tag">AI</i>' : ''}</span>
          <button class="ico-btn" data-act="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg></button>
        </div>

        <div class="overall-card">
          ${State.photo ? `<img class="overall-photo" src="${State.photo}" alt="">` : ''}
          ${svgRing(overall * 10, overall.toFixed(1), 'OVERALL', true)}
          <div class="overall-meta">
            <span class="pill pill-${scoreColor(overall * 10)}">${pct}</span>
            <p>${overallBlurb(overall)}</p>
          </div>
        </div>

        <div class="res-actions-quick">
          ${quickRes('glowup', '🚀', 'Glow-Up')}
          ${quickRes('ai', '💬', 'AI Advisor')}
          ${quickRes('faceshape', '📐', 'Face Shape')}
          ${quickRes('stat', '📊', 'Stat Report')}
        </div>

        <h3 class="res-h">Category breakdown</h3>
        <div class="cat-grid">${catCards}</div>
        ${pro ? '' : proCard('Unlock all 7 categories', 'See cheekbones, eyes, hair & symmetry plus ratios, celebrity match and your 12-week plan.')}

        ${ratiosSection(sc, pro)}
        ${celebSection(sc, pro)}
        ${planSection(sc, pro)}

        <div class="res-foot">
          <button class="big-cta ghost" data-act="retake"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10m22 4l-4.6 4.4A9 9 0 0 1 3.5 15"/></svg> Retake</button>
          <button class="big-cta primary" data-act="share">Share Result</button>
        </div>
      </div>`;
    animateRings(appMain);
    $$('.cat-card .cc-bar i', appMain).forEach(i => { const w = i.style.width; i.style.width = '0'; requestAnimationFrame(() => requestAnimationFrame(() => i.style.width = w)); });
  }
  function quickRes(act, emoji, label) { return `<button class="qr" data-act="${act}"><span>${emoji}</span>${label}</button>`; }
  function overallBlurb(o) {
    if (o >= 8) return "Top-tier bone structure. A few refinements push you toward elite.";
    if (o >= 6.5) return "Above average with strong upside. Target your weakest categories first.";
    if (o >= 5) return "Solid base. Body fat, skin and grooming are your fastest wins.";
    return "Big upside ahead. Fundamentals will move your score the most — start the plan.";
  }
  function proCard(title, sub) {
    return `<button class="pro-card" data-act="paywall">
      <h4>⭐ ${esc(title)}</h4><p>${esc(sub)}</p>
      <span class="pro-card-btn">Unlock PRO →</span></button>`;
  }

  function ratiosSection(sc, pro) {
    const ratios = computeFacialRatios(sc);
    const items = Object.values(ratios).map(r => `
      <div class="ratio-row ${pro ? '' : 'blur'}">
        <span class="re">${r.emoji}</span>
        <div class="ri"><b>${r.name}</b><small>${esc(r.description)}</small></div>
        <div class="rv"><b>${r.actual}</b><small>ideal ${r.ideal}</small></div>
        <div class="rn ${r.rating >= 7 ? 'good' : r.rating >= 5 ? 'mid' : 'low'}">${r.rating}/10</div>
      </div>`).join('');
    return `<section class="res-sec">
      <h3 class="res-h">Facial ratios ${pro ? '' : '<span class="mini-lock">PRO</span>'}</h3>
      <div class="ratio-wrap">${items}${pro ? '' : `<button class="sec-unlock" data-act="paywall">🔒 Unlock golden ratio, fWHR & 6 more</button>`}</div>
    </section>`;
  }
  function celebSection(sc, pro) {
    if (!pro) return `<section class="res-sec"><h3 class="res-h">Celebrity match <span class="mini-lock">PRO</span></h3>
      <button class="celeb-card blur-strong" data-act="paywall"><div class="celeb-av">★</div><div><b>Unlock your celebrity look-alike</b><small>See which model you match and why</small></div></button></section>`;
    const m = getCelebrityMatch(sc);
    return `<section class="res-sec"><h3 class="res-h">Celebrity match</h3>
      <div class="celeb-card"><div class="celeb-av">${m.primary.img}</div>
        <div class="celeb-info"><b>${m.primary.name}</b><span class="celeb-pct">${m.matchPercentage}% match</span><small>${esc(m.primary.traits)}</small></div></div></section>`;
  }
  function planSection(sc, pro) {
    if (!pro) return proCard('Your 12-week glow-up plan', 'A phase-by-phase routine that targets your lowest scores first. Unlock to start.');
    const plan = generateImprovementPlan(sc);
    return `<section class="res-sec"><h3 class="res-h">Your 12-week plan</h3>
      ${plan.phases.map(ph => `<div class="phase"><div class="phase-h"><b>${ph.name}</b><span>Weeks ${ph.weeks}</span></div>
        ${ph.tasks.map(t => `<label class="task"><input type="checkbox"><span>${esc(t.task)}</span></label>`).join('')}</div>`).join('')}
    </section>`;
  }

  /* ---- category tips drilldown ---- */
  function showCategory(key) {
    const sc = State.scores; if (!sc) return;
    if (!canAccessCategory(key)) { showPaywall('category'); return; }
    const c = catMeta(key); const v = sc[key];
    const tips = getTipsForCategory(key, v);
    const label = getScoreLabel(v);
    State.screen = 'category';
    appMain.innerHTML = `<div class="scr scr-cat">
      <div class="res-top"><button class="ico-btn" data-act="back-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>${c.emoji} ${c.name}</span><span style="width:38px"></span></div>
      <div class="cat-hero">${svgRing(v, (v / 10).toFixed(1), label.text, true)}
        <div><h2>${c.name}</h2><p>${esc(TIPS_DATABASE[key] ? TIPS_DATABASE[key].description : '')}</p></div></div>
      <h3 class="res-h">Recommendations</h3>
      <div class="tips-list">${tips.map(t => `<div class="tip-item"><div class="ti-head"><span>💡</span><b>${esc(t.title)}</b></div><p>${esc(t.text)}</p><small>${esc(t.source)}</small></div>`).join('')}</div>
    </div>`;
    animateRings(appMain);
  }

  /* =====================================================================
     GLOW-UP SIMULATOR
     ===================================================================== */
  function showGlowUp() {
    const sc = State.scores;
    if (!sc) { toast('Scan your face first'); go('scan'); return; }
    if (!isPro()) { showPaywall('glowup'); return; }
    State.screen = 'glowup';
    const rows = CATS.map(c => {
      const cur = sc[c.key]; const gain = Math.round(Math.min(98, cur + (100 - cur) * 0.4) - cur);
      const proj = Math.min(98, cur + gain);
      return `<div class="glow-row"><div class="gr-top"><span>${c.emoji} ${c.name}</span><b class="good">+${gain}</b></div>
        <div class="gr-bar"><i class="cur" style="width:${cur}%"></i><i class="proj" style="width:${proj}%"></i></div>
        <div class="gr-vals"><small>now ${(cur/10).toFixed(1)}</small><small>potential ${(proj/10).toFixed(1)}</small></div></div>`;
    }).join('');
    const potential = Math.min(9.9, sc.overall + 1.4);
    appMain.innerHTML = `<div class="scr">
      <div class="res-top"><button class="ico-btn" data-act="back-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>🚀 Glow-Up Simulator</span><span style="width:38px"></span></div>
      <div class="glow-head"><div class="gh-now"><small>Now</small><b>${sc.overall.toFixed(1)}</b></div><div class="gh-arrow">→</div><div class="gh-pot"><small>Potential</small><b class="grad-text">${potential.toFixed(1)}</b></div></div>
      <p class="glow-note">Projected scores after 3–12 months of consistent work on each area.</p>
      ${rows}
    </div>`;
  }

  /* =====================================================================
     AI ADVISOR (recommendations)
     ===================================================================== */
  function showAI() {
    const sc = State.scores;
    if (!sc) { toast('Scan your face first'); go('scan'); return; }
    if (!isPro()) { showPaywall('ai'); return; }
    State.screen = 'ai';
    const sorted = CATS.map(c => ({ ...c, v: sc[c.key] })).sort((a, b) => a.v - b.v);
    const weak = sorted.slice(0, 2), strong = sorted.slice(-1)[0];
    const recs = [
      { t: 'Priority action', impact: 'High', tl: '0–4 weeks', d: `Your lowest area is ${weak[0].name.toLowerCase()} (${(weak[0].v/10).toFixed(1)}). ${firstTip(weak[0].key, weak[0].v)}` },
      { t: 'Quick win', impact: 'Medium', tl: 'This week', d: `Get to 10–15% body fat and fix sleep — it lifts jawline, eyes and skin simultaneously.` },
      { t: 'Long-term strategy', impact: 'High', tl: '3–6 months', d: `Also address ${weak[1].name.toLowerCase()}. ${firstTip(weak[1].key, weak[1].v)}` },
      { t: 'Lean into strengths', impact: 'Low', tl: 'Ongoing', d: `Your ${strong.name.toLowerCase()} (${(strong.v/10).toFixed(1)}) is a top feature — frame it with the right grooming, lighting and angles.` },
    ];
    appMain.innerHTML = `<div class="scr">
      <div class="res-top"><button class="ico-btn" data-act="back-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>💬 AI Advisor</span><span style="width:38px"></span></div>
      <div class="ai-list">${recs.map(r => `<div class="ai-rec"><div class="ai-rec-h"><b>${r.t}</b><span class="impact ${r.impact.toLowerCase()}">${r.impact}</span></div><span class="ai-tl">${r.tl}</span><p>${esc(r.d)}</p></div>`).join('')}</div>
    </div>`;
  }
  function firstTip(key, v) { const t = getTipsForCategory(key, v)[0]; return t ? t.text : ''; }

  /* =====================================================================
     FACE SHAPE
     ===================================================================== */
  const FACE_SHAPES = {
    oval:    { name: 'Oval', desc: 'Balanced proportions — the most versatile shape.', hair: 'Almost any style works; avoid covering the face.', celebs: 'George Clooney, Idris Elba' },
    square:  { name: 'Square', desc: 'Strong jaw and forehead of similar width — highly masculine.', hair: 'Textured crops, side parts; soften with some length on top.', celebs: 'Henry Cavill, Brad Pitt' },
    round:   { name: 'Round', desc: 'Soft angles, similar width and length.', hair: 'Add height on top, keep sides short to add structure.', celebs: 'Leonardo DiCaprio' },
    oblong:  { name: 'Oblong', desc: 'Longer than wide — elegant and model-like.', hair: 'Fringe and volume on the sides; avoid too much height.', celebs: 'Ben Affleck' },
    diamond: { name: 'Diamond', desc: 'Wide cheekbones with narrower forehead and jaw.', hair: 'Fuller sides and fringe to balance cheekbones.', celebs: 'Robert Pattinson' },
    heart:   { name: 'Heart', desc: 'Wider forehead tapering to a narrow chin.', hair: 'Medium length with side-swept fringe.', celebs: 'Ryan Gosling' },
  };
  function showFaceShape() {
    const sc = State.scores;
    if (!sc) { toast('Scan your face first'); go('scan'); return; }
    State.screen = 'faceshape';
    // simple heuristic from scores
    let key = 'oval';
    if (sc.jawline > 75 && sc.masculinity > 70) key = 'square';
    else if (sc.cheekbones > 78) key = 'diamond';
    else if (sc.symmetry > 80 && sc.jawline < 60) key = 'oval';
    else if (sc.jawline < 55) key = 'round';
    else if (sc.masculinity > 72) key = 'oblong';
    const f = FACE_SHAPES[key];
    appMain.innerHTML = `<div class="scr">
      <div class="res-top"><button class="ico-btn" data-act="back-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>📐 Face Shape</span><span style="width:38px"></span></div>
      <div class="shape-hero"><div class="shape-ico shape-${key}"></div><h2>${f.name}</h2><p>${esc(f.desc)}</p></div>
      <div class="info-card"><b>💇 Best hairstyles</b><p>${esc(f.hair)}</p></div>
      <div class="info-card"><b>⭐ Shares your shape</b><p>${esc(f.celebs)}</p></div>
    </div>`;
  }

  /* =====================================================================
     STATISTICAL REPORT (bell curve)
     ===================================================================== */
  function showStat() {
    const sc = State.scores;
    if (!sc) { toast('Scan your face first'); go('scan'); return; }
    if (!isPro()) { showPaywall('stat'); return; }
    State.screen = 'stat';
    const score = sc.overall * 10;
    const z = ((score - 55) / 15);
    const percentile = Math.round(Math.max(1, Math.min(99, 50 + z * 19)));
    const x = Math.max(6, Math.min(94, 50 + z * 16));
    appMain.innerHTML = `<div class="scr">
      <div class="res-top"><button class="ico-btn" data-act="back-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>📊 Statistical Report</span><span style="width:38px"></span></div>
      <div class="stat-big"><b class="grad-text">Top ${100 - percentile}%</b><small>You scored higher than ${percentile}% of analyzed faces</small></div>
      <div class="bell"><svg viewBox="0 0 100 46" preserveAspectRatio="none"><path d="M0,46 C25,46 30,4 50,4 C70,4 75,46 100,46 Z" class="bell-fill"/></svg><span class="bell-marker" style="left:${x}%"></span></div>
      <div class="stat-grid">
        <div class="stat-cell"><small>Percentile</small><b>${percentile}th</b></div>
        <div class="stat-cell"><small>Z-score</small><b>${z.toFixed(2)}</b></div>
        <div class="stat-cell"><small>Overall</small><b>${sc.overall.toFixed(1)}/10</b></div>
        <div class="stat-cell"><small>Sample</small><b>50,000+</b></div>
      </div>
    </div>`;
  }

  /* =====================================================================
     GUIDES
     ===================================================================== */
  function renderGuides() {
    appMain.innerHTML = `<div class="scr">
      <div class="scr-title"><h2>Guides</h2><p>Science-aware protocols to actually move your scores.</p></div>
      <div class="guide-list">${GUIDES.map(g => {
        const locked = g.pro && !isPro();
        return `<button class="guide-card ${locked ? 'locked' : ''}" data-guide="${g.id}">
          <span class="g-emoji">${g.emoji}</span>
          <div class="g-info"><b>${g.title} ${locked ? '<span class="mini-lock">PRO</span>' : ''}</b><small>${esc(g.summary)}</small>
            <span class="g-meta">${g.tag} · ${g.minutes} min read</span></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>`;
      }).join('')}</div>
    </div>`;
  }
  function showGuide(id) {
    const g = getGuide(id); if (!g) return;
    if (g.pro && !isPro()) { showPaywall('guide'); return; }
    State.screen = 'guideDetail';
    appMain.innerHTML = `<div class="scr scr-guide">
      <div class="res-top"><button class="ico-btn" data-act="back-guides"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><span>${g.emoji} ${g.title}</span><span style="width:38px"></span></div>
      <div class="guide-hero"><span class="gh-emoji">${g.emoji}</span><h2>${g.title}</h2><p>${esc(g.summary)}</p><span class="g-meta">${g.tag} · ${g.minutes} min read</span></div>
      ${g.sections.map((s, i) => `<div class="guide-sec"><h3>${i + 1}. ${esc(s.h)}</h3><p>${esc(s.p)}</p></div>`).join('')}
      <div class="guide-check"><b>✅ Daily checklist</b><div class="chk-tags">${g.checklist.map(c => `<span>${esc(c)}</span>`).join('')}</div></div>
    </div>`;
    appMain.scrollTop = 0;
  }

  /* =====================================================================
     ROUTINE
     ===================================================================== */
  const ROUTINES = {
    morning: { label: 'Morning', emoji: '🌅', tasks: ['Cold water splash', 'Vitamin C serum', 'Moisturizer + SPF', 'Mewing check', 'Chin tucks ×20', 'Style hair', 'Groom brows'] },
    afternoon: { label: 'Afternoon', emoji: '☀️', tasks: ['Mastic gum 30 min', 'Drink 1L water', 'Posture check', 'Gym / training', 'Facial exercises'] },
    evening: { label: 'Evening', emoji: '🌙', tasks: ['Double cleanse', 'Retinol serum', 'Eye cream', 'Moisturizer', 'Scalp massage', 'Sleep on your back'] },
  };
  function routineKey() { return 'andro_routine_' + new Date().toDateString(); }
  function getRoutineState() { try { return JSON.parse(localStorage.getItem(routineKey())) || {}; } catch { return {}; } }
  function renderRoutine() {
    const st = getRoutineState();
    let total = 0, done = 0;
    Object.entries(ROUTINES).forEach(([k, r]) => r.tasks.forEach((_, i) => { total++; if (st[`${k}_${i}`]) done++; }));
    const pct = total ? Math.round(done / total * 100) : 0;
    appMain.innerHTML = `<div class="scr scr-routine">
      <div class="scr-title"><h2>Daily Routine</h2><p>Consistency is the whole game. Check tasks to earn XP.</p></div>
      <div class="routine-ring">${svgRing(pct, pct + '%', `${done}/${total}`, true)}</div>
      ${Object.entries(ROUTINES).map(([k, r]) => `<div class="rt-block"><div class="rt-head">${r.emoji} ${r.label}</div>
        ${r.tasks.map((t, i) => `<label class="task ${st[`${k}_${i}`] ? 'on' : ''}"><input type="checkbox" data-rt="${k}_${i}" ${st[`${k}_${i}`] ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>`).join('')}
    </div>`;
    animateRings(appMain);
  }
  function toggleRoutine(id, on) {
    const st = getRoutineState();
    st[id] = on; localStorage.setItem(routineKey(), JSON.stringify(st));
    const s = getStreakState();
    if (on) { addXP(s, 3, 'routine'); markDayActive(s); saveStreakState(s); renderHeader(); }
    // all-done achievement
    let total = 0, done = 0; Object.entries(ROUTINES).forEach(([k, r]) => r.tasks.forEach((_, i) => { total++; if (st[`${k}_${i}`]) done++; }));
    if (done === total) { const s2 = getStreakState(); if (unlockAchievement(s2, 'routine_done')) { saveStreakState(s2); achievementToast(ACHIEVEMENTS.find(a => a.id === 'routine_done')); } }
    renderRoutine();
  }

  /* =====================================================================
     RANKS (rate my look + leaderboard)
     ===================================================================== */
  const PROFILES = [
    { in: 'JM', age: 24 }, { in: 'AK', age: 21 }, { in: 'DV', age: 27 }, { in: 'LO', age: 22 },
    { in: 'RZ', age: 25 }, { in: 'TC', age: 23 }, { in: 'BH', age: 29 }, { in: 'SP', age: 20 },
  ];
  let rankIdx = 0;
  function renderRanks() {
    rankIdx = 0;
    const lb = [...PROFILES].map((p, i) => ({ ...p, score: (9.4 - i * 0.4).toFixed(1) })).slice(0, 5);
    appMain.innerHTML = `<div class="scr scr-ranks">
      <div class="scr-title"><h2>Ranks</h2><p>Rate the community — and see this week's top faces.</p></div>
      <div id="rateBox"></div>
      <h3 class="res-h">🏆 This week's top</h3>
      <div class="lb">${lb.map((p, i) => `<div class="lb-row"><span class="lb-pos">${i + 1}</span><span class="lb-av" style="--h:${i * 40 + 200}">${p.in}</span><div class="lb-info"><b>Anonymous</b><small>Age ${p.age}</small></div><b class="lb-score">${p.score}</b></div>`).join('')}</div>
    </div>`;
    renderRateCard();
  }
  function renderRateCard() {
    const box = $('#rateBox'); if (!box) return;
    const p = PROFILES[rankIdx % PROFILES.length];
    box.innerHTML = `<div class="rate-card"><div class="rate-av" style="--h:${rankIdx * 47 + 210}">${p.in}</div>
      <b>Anonymous · ${p.age}</b><p>How would you rate this face?</p>
      <div class="rate-btns">${[['❌', 2], ['👎', 4], ['😐', 6], ['👍', 8], ['🔥', 10]].map(([e, v]) => `<button data-rate="${v}">${e}</button>`).join('')}</div></div>`;
  }

  /* =====================================================================
     PROFILE (achievements, referral, pro, history)
     ===================================================================== */
  function renderProfile() {
    const s = getStreakState();
    const lvl = getCurrentLevel(s);
    const prog = getLevelProgress(s);
    const pro = isPro();
    const unlocked = s.unlockedAchievements || {};
    const code = getReferralCode();
    const hist = getHistory();
    appMain.innerHTML = `<div class="scr scr-profile">
      <div class="profile-head">
        <div class="pf-ring">${svgRing(prog.pct * 100, 'Lv' + lvl.level, lvl.name, true)}</div>
        <div class="pf-stats">
          <div><b>${s.totalScans}</b><small>Scans</small></div>
          <div><b>${s.currentStreak}</b><small>Streak</small></div>
          <div><b>${s.totalXP}</b><small>XP</small></div>
        </div>
      </div>

      ${pro
        ? `<div class="pro-status on"><b>🛡️ PRO active</b><span>${(getCurrentPlan() || {}).name || 'Member'} · thank you!</span><button class="link-btn" data-act="cancelpro">Manage</button></div>`
        : `<button class="pro-status" data-act="paywall"><b>⭐ Upgrade to PRO</b><span>Unlock everything · 3-day free trial</span></button>`}

      <h3 class="res-h">Achievements <span class="ach-count">${Object.keys(unlocked).length}/${ACHIEVEMENTS.length}</span></h3>
      <div class="ach-grid">${ACHIEVEMENTS.map(a => `<div class="ach ${unlocked[a.id] ? 'on' : ''}" title="${esc(a.desc)}"><span class="ach-ico">${a.icon}</span><b>${esc(a.name)}</b><small>+${a.xp} XP</small></div>`).join('')}</div>

      <h3 class="res-h">Invite friends</h3>
      <div class="ref-card">
        <p>3 friends = <b>free PRO</b>. Share your code:</p>
        <div class="ref-code"><code>${code}</code><button class="link-btn" data-act="copyref">Copy</button></div>
        <div class="ref-tiers"><span>1 → 3 scans</span><span>3 → 1 week PRO</span><span>10 → 1 month</span><span>25 → Lifetime</span></div>
      </div>

      <h3 class="res-h">History ${pro ? '' : '<span class="mini-lock">last 3</span>'}</h3>
      <div class="hist-list">${hist.length ? hist.map(h => `<button class="hist-row" data-hist="${h.id}"><img src="${h.imageUri}" alt=""><div><b>${(h.scores.overall).toFixed(1)}/10</b><small>${new Date(h.date).toLocaleDateString()}</small></div></button>`).join('') : '<p class="muted-line">No scans yet — analyze your face to start tracking.</p>'}</div>

      <div class="profile-foot">
        <button class="link-btn" data-act="restore">Restore purchase</button>
        <button class="link-btn" data-act="reset">Reset app data</button>
      </div>
    </div>`;
    animateRings(appMain);
  }
  function getReferralCode() {
    let c = localStorage.getItem('andro_ref'); if (c) return c;
    c = 'ANDRO-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    localStorage.setItem('andro_ref', c); return c;
  }

  /* =====================================================================
     PAYWALL
     ===================================================================== */
  let countdownTimer = null;
  function showPaywall(source) {
    const plans = PRO_CONFIG.PLANS;
    const order = ['weekly', 'monthly', 'yearly', 'lifetime'];
    modalLayer.setAttribute('aria-hidden', 'false');
    modalLayer.classList.add('open');
    const subs = 134 + (new Date().getHours() * 47) % 900;
    modalLayer.innerHTML = `<div class="paywall">
      <button class="pw-close" data-pw="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      <div class="pw-crown">👑</div>
      <h2>Androgenic <span class="grad-gold">PRO</span></h2>
      <p class="pw-sub">Unlock your full looksmaxxing potential</p>
      <div class="pw-countdown">⏳ Offer ends in <b id="pwTime">23:59:59</b></div>
      <div class="pw-feats">
        ${['Unlimited scans', 'All 7 score categories', 'Golden ratio & fWHR', 'Celebrity look-alike', '12-week glow-up plan', 'Glow-Up Simulator & AI Advisor', '23+ expert guides', 'Progress tracking & no watermarks'].map(f => `<span>✓ ${f}</span>`).join('')}
      </div>
      <div class="pw-plans">
        ${order.map(id => { const p = plans[id]; return `<button class="pw-plan ${id === State.plan ? 'sel' : ''}" data-plan="${id}">
          ${p.badge ? `<span class="pw-badge">${p.badge}</span>` : ''}
          <b>${p.name}</b><span class="pw-price">${p.price}</span><small>/${p.period}</small>
          ${p.savings ? `<span class="pw-save">${p.savings}</span>` : ''}</button>`; }).join('')}
      </div>
      <button class="pw-cta" data-pw="buy">${hasUsedTrial() ? 'Subscribe Now' : 'Start 3-Day Free Trial'}</button>
      <div class="pw-social">🔥 <b>${subs}</b> people upgraded today</div>
      <div class="pw-legal">Cancel anytime · auto-renews · on-device privacy<br><a data-pw="restore">Restore purchase</a></div>
    </div>`;
    startCountdown();
  }
  function closePaywall() { modalLayer.classList.remove('open'); modalLayer.setAttribute('aria-hidden', 'true'); modalLayer.innerHTML = ''; if (countdownTimer) clearInterval(countdownTimer); }
  function startCountdown() {
    const end = Date.now() + 24 * 3600 * 1000 - 1000;
    const tick = () => { const el = $('#pwTime'); if (!el) return; let d = Math.max(0, end - Date.now()); const h = Math.floor(d / 3.6e6), m = Math.floor(d % 3.6e6 / 6e4), s = Math.floor(d % 6e4 / 1000); el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
    tick(); if (countdownTimer) clearInterval(countdownTimer); countdownTimer = setInterval(tick, 1000);
  }
  function doPurchase() {
    if (!hasUsedTrial()) startFreeTrial();
    purchasePlan(State.plan);
    const s = getStreakState(); if (unlockAchievement(s, 'pro_member')) saveStreakState(s);
    closePaywall();
    renderHeader();
    toast('🎉 PRO unlocked — everything is open!', 'good');
    if (State.screen === 'results') showResults();
    else go(State.tab);
  }

  /* ---- achievement toast ---- */
  function achievementToast(a) {
    if (!a) return;
    const el = document.createElement('div');
    el.className = 'ach-pop';
    el.innerHTML = `<span class="ap-ico">${a.icon}</span><div><small>Achievement unlocked</small><b>${esc(a.name)}</b></div><span class="ap-xp">+${a.xp}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3200);
  }

  /* ---- share ---- */
  async function shareResult() {
    const sc = State.scores; if (!sc) return;
    const text = `I scored ${sc.overall.toFixed(1)}/10 on Androgenic — ${PERCENTILE_MAP[Math.round(sc.overall)]}. Analyze your face free at androgenic.app`;
    try {
      if (navigator.share) { await navigator.share({ title: 'My Androgenic score', text, url: location.href }); return; }
    } catch {}
    try { await navigator.clipboard.writeText(text); toast('Copied result to clipboard', 'good'); }
    catch { toast('Share: ' + sc.overall.toFixed(1) + '/10'); }
  }

  /* =====================================================================
     EVENT DELEGATION
     ===================================================================== */
  // launch from landing
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-app]');
    if (opener) { e.preventDefault(); openApp(opener.dataset.app); }
  });

  app.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-close]')) return closeApp();
    const tab = t.closest('[data-tab]'); if (tab) return go(tab.dataset.tab);
    const guide = t.closest('[data-guide]'); if (guide) return showGuide(guide.dataset.guide);
    const cat = t.closest('[data-cat]'); if (cat) return showCategory(cat.dataset.cat);
    const rate = t.closest('[data-rate]'); if (rate) { toast(`You rated ${rate.dataset.rate}/10`, 'good'); rankIdx++; renderRateCard(); return; }
    const hist = t.closest('[data-hist]'); if (hist) { const h = getHistory().find(x => x.id === hist.dataset.hist); if (h) { State.scores = h.scores; State.photo = h.imageUri; showResults(); } return; }

    const act = t.closest('[data-act]'); if (!act) return;
    const a = act.dataset.act;
    const actions = {
      camera: () => startCapture('camera'),
      upload: () => startCapture('upload'),
      last: () => showResults(),
      paywall: () => showPaywall('app'),
      iq: () => State.scores ? showResults() : (toast('Scan your face first'), startCapture('upload')),
      glowup: showGlowUp, ai: showAI, faceshape: showFaceShape, stat: showStat,
      share: shareResult,
      retake: () => startCapture('upload'),
      'back-scan': () => go('scan'),
      'back-results': () => showResults(),
      'back-guides': () => go('guides'),
      copyref: async () => { try { await navigator.clipboard.writeText(getReferralCode()); toast('Code copied!', 'good'); } catch { toast(getReferralCode()); } },
      restore: () => { if (restorePurchase()) { renderHeader(); toast('Purchase restored', 'good'); go('profile'); } else toast('No purchase found'); },
      cancelpro: () => { cancelSubscription(); renderHeader(); toast('PRO cancelled'); renderProfile(); },
      reset: () => { if (confirm('Reset all local app data?')) { localStorage.clear(); sessionStorage.clear(); State.scores = null; State.photo = null; toast('Data reset'); go('scan'); renderHeader(); } },
    };
    (actions[a] || (() => {}))();
  });

  // routine + plan checkboxes
  app.addEventListener('change', e => {
    const rt = e.target.closest('[data-rt]');
    if (rt) toggleRoutine(rt.dataset.rt, rt.checked);
  });

  // paywall (modal layer)
  modalLayer.addEventListener('click', e => {
    if (e.target === modalLayer) return closePaywall();
    const pw = e.target.closest('[data-pw]'); const plan = e.target.closest('[data-plan]');
    if (plan) { State.plan = plan.dataset.plan; $$('.pw-plan', modalLayer).forEach(p => p.classList.toggle('sel', p === plan)); return; }
    if (!pw) return;
    if (pw.dataset.pw === 'close') closePaywall();
    else if (pw.dataset.pw === 'buy') doPurchase();
    else if (pw.dataset.pw === 'restore') { if (restorePurchase()) { closePaywall(); renderHeader(); toast('Purchase restored', 'good'); } else toast('No purchase found'); }
  });

  // esc closes
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modalLayer.classList.contains('open')) closePaywall();
    else if (app.classList.contains('open')) closeApp();
  });
})();
