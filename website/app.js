/* =====================================================================
   Rolo — a fluid job board with LIVE listings
   Sources: Remotive API (primary) → Arbeitnow API (fallback) → seeded sample.
   Apply opens the real posting. Save/applied persist in localStorage.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const hue = s => { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const initials = n => (n || '?').replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '•';

  const ic = {
    pin:'<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
    remote:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  };
  const svg = (p, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const tile = (co, logo) => logo
    ? `<span class="logo-tile" style="--h:${hue(co)};padding:0;overflow:hidden"><img src="${esc(logo)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.replaceWith(document.createTextNode('${esc(initials(co))}'))"></span>`
    : `<span class="logo-tile" style="--h:${hue(co)}">${esc(initials(co))}</span>`;

  /* ---------------- seeded fallback ---------------- */
  const SEED = [
    { id:'s1', title:'Senior Frontend Engineer', co:'Northwind', loc:'San Francisco, CA', type:'Full-time', remote:'Hybrid', salary:'$160k–$200k', posted:'2d', cat:'Software Development', tags:['React','TypeScript'], url:'', source:'seed',
      about:'We build tools that help teams ship faster. Join a small, senior frontend team that owns the product end-to-end.', resp:['Lead features from idea to ship','Raise the bar on performance & craft','Mentor engineers'], req:['5+ years building web apps','Deep React + TypeScript','Eye for detail'] },
    { id:'s2', title:'Product Designer', co:'Lumen', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$120k–$155k', posted:'4h', cat:'Design', tags:['Figma','0→1'], url:'', source:'seed',
      about:'Lumen is reimagining personal finance. Move from messy problem to polished product.', resp:['Own a core product area','Run research','Prototype & iterate'], req:['4+ years product design','Strong portfolio','Comfort with ambiguity'] },
    { id:'s3', title:'Data Scientist', co:'Atlas', loc:'Austin, TX', type:'Full-time', remote:'On-site', salary:'$140k–$180k', posted:'1w', cat:'Data', tags:['Python','ML'], url:'', source:'seed',
      about:'Use data to drive decisions across the company.', resp:['Ship models to production','Design experiments','Communicate simply'], req:['3+ years applied DS','Python + SQL','Clear communicator'] },
    { id:'s4', title:'Backend Engineer (Go)', co:'Vela', loc:'New York, NY', type:'Full-time', remote:'Hybrid', salary:'$150k–$190k', posted:'3d', cat:'Software Development', tags:['Go','Postgres'], url:'', source:'seed',
      about:'Scale the systems behind a fast-growing marketplace.', resp:['Own backend services','Improve reliability','Design clean APIs'], req:['4+ years backend','Strong in Go','Solid data modeling'] },
    { id:'s5', title:'Marketing Manager', co:'Brightside', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$95k–$120k', posted:'5d', cat:'Marketing', tags:['Growth','SEO'], url:'', source:'seed',
      about:'Own the story. Grow our audience through content and lifecycle.', resp:['Run campaigns','Own content + SEO','Report on results'], req:['4+ years marketing','Great writer','Data-driven'] },
    { id:'s6', title:'Customer Success Lead', co:'Lumen', loc:'Chicago, IL', type:'Full-time', remote:'On-site', salary:'$90k–$115k', posted:'4d', cat:'Customer Service', tags:['SaaS'], url:'', source:'seed',
      about:'Make customers wildly successful.', resp:['Own key accounts','Drive renewals','Voice of the customer'], req:['4+ years CS in SaaS','Empathetic','Organized'] },
  ];

  /* ---------------- state ---------------- */
  let JOBS = [];
  let CHIPS = [];
  let LIVE = false;
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('rolo_saved')) || {}; } catch {}
  let applied = {}; try { applied = JSON.parse(localStorage.getItem('rolo_applied')) || {}; } catch {}
  const persist = () => { localStorage.setItem('rolo_saved', JSON.stringify(saved)); localStorage.setItem('rolo_applied', JSON.stringify(applied)); };
  const state = { q: '', loc: '', filters: new Set(), savedOnly: false, selected: null };

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2300); }

  /* ---------------- fetch live jobs ---------------- */
  const prettyType = t => ({ full_time:'Full-time', part_time:'Part-time', contract:'Contract', freelance:'Freelance', internship:'Internship' }[(t||'').toLowerCase()] || (t ? t.replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase()) : 'Full-time'));
  const ago = d => { if (!d) return 'recently'; const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400e3); if (isNaN(days)) return 'recently'; if (days <= 0) return 'today'; if (days === 1) return '1d'; if (days < 30) return days + 'd'; return Math.floor(days/30) + 'mo'; };
  function decodeEntities(s){ const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }
  function htmlToText(html){
    let s = String(html || '');
    s = s.replace(/<\s*li[^>]*>/gi, '\n• ').replace(/<\s*\/(p|div|h[1-6]|ul|ol|li|tr)\s*>/gi, '\n').replace(/<\s*br\s*\/?>/gi, '\n');
    s = s.replace(/<[^>]+>/g, '');
    s = decodeEntities(s).replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
    return s;
  }

  function mapRemotive(j){
    return { id: 'rm' + j.id, title: j.title, co: j.company_name, loc: j.candidate_required_location || 'Remote',
      type: prettyType(j.job_type), remote: 'Remote', salary: j.salary && j.salary.trim() ? j.salary : 'Not specified',
      posted: ago(j.publication_date), cat: j.category || 'Other', tags: (j.tags || []).slice(0, 6),
      descText: htmlToText(j.description), url: j.url, logo: j.company_logo || j.company_logo_url || '', source: 'remotive' };
  }
  function mapArbeit(j){
    return { id: 'ab' + (j.slug || Math.random().toString(36).slice(2)), title: j.title, co: j.company_name, loc: j.location || (j.remote ? 'Remote' : '—'),
      type: prettyType((j.job_types || [])[0]), remote: j.remote ? 'Remote' : 'On-site', salary: 'Not specified',
      posted: ago(j.created_at ? j.created_at * 1000 : null), cat: (j.tags || [])[0] || 'Other', tags: (j.tags || []).slice(0, 6),
      descText: htmlToText(j.description), url: j.url, logo: '', source: 'arbeitnow' };
  }

  async function fetchLive(){
    try {
      const r = await fetch('https://remotive.com/api/remote-jobs?limit=80', { headers: { Accept: 'application/json' } });
      if (r.ok) { const d = await r.json(); if (d && d.jobs && d.jobs.length) return d.jobs.map(mapRemotive); }
    } catch (e) { /* ignore */ }
    try {
      const r = await fetch('https://www.arbeitnow.com/api/job-board-api', { headers: { Accept: 'application/json' } });
      if (r.ok) { const d = await r.json(); if (d && d.data && d.data.length) return d.data.map(mapArbeit); }
    } catch (e) { /* ignore */ }
    return null;
  }

  /* ---------------- chips ---------------- */
  function buildChips(jobs){
    const types = [...new Set(jobs.map(j => j.type).filter(Boolean))].slice(0, 4);
    const counts = {}; jobs.forEach(j => { if (j.cat) counts[j.cat] = (counts[j.cat] || 0) + 1; });
    const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
    const anyNonRemote = jobs.some(j => j.remote !== 'Remote');
    CHIPS = [
      ...(anyNonRemote ? [{ label: 'Remote', kind: 'remote' }] : []),
      ...types.map(t => ({ label: t, kind: 'type' })),
      ...cats.map(c => ({ label: c, kind: 'cat' })),
    ];
    renderChips();
  }
  function renderChips(){ $('#chips').innerHTML = CHIPS.map(c => `<button class="chip ${state.filters.has(c.label)?'on':''}" data-filter="${esc(c.label)}">${esc(c.label)}</button>`).join(''); }

  /* ---------------- filter ---------------- */
  function results(){
    const q = state.q.toLowerCase().trim(), loc = state.loc.toLowerCase().trim();
    return JOBS.filter(j => {
      if (state.savedOnly && !saved[j.id]) return false;
      if (q && !(`${j.title} ${j.co} ${(j.tags||[]).join(' ')} ${j.cat}`.toLowerCase().includes(q))) return false;
      if (loc && !(`${j.loc} ${j.remote}`.toLowerCase().includes(loc))) return false;
      for (const f of state.filters) {
        const c = CHIPS.find(x => x.label === f); if (!c) continue;
        if (c.kind === 'remote') { if (j.remote !== 'Remote') return false; }
        else if (c.kind === 'type') { if (j.type !== f) return false; }
        else if (c.kind === 'cat') { if (j.cat !== f) return false; }
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  function savedCount(){ return Object.values(saved).filter(Boolean).length; }
  function render(){
    const list = results();
    $('#savedCount').textContent = savedCount();
    $('#savedToggle').classList.toggle('active', state.savedOnly);
    $('#resultCount').textContent = `${list.length} job${list.length === 1 ? '' : 's'}`;
    $('.sort').textContent = LIVE ? 'Live listings' : 'Sample data (offline)';
    if (!list.length) { $('#list').innerHTML = `<div class="no-results">No jobs match your search.<br>Try clearing filters.</div>`; }
    else { if (!list.find(j => j.id === state.selected)) state.selected = list[0].id; $('#list').innerHTML = list.map((j, i) => cardHTML(j, i)).join(''); }
    renderDetail();
  }
  function cardHTML(j, i){
    return `<article class="jcard ${j.id===state.selected?'active':''}" data-job="${esc(j.id)}" style="animation-delay:${Math.min(i*35,300)}ms">
      <button class="save ${saved[j.id]?'on':''}" data-save="${esc(j.id)}" title="Save">${svg(ic.bookmark,20)}</button>
      <div class="jcard-top">${tile(j.co, j.logo)}
        <div class="jc-main"><h3>${esc(j.title)}</h3><div class="co">${esc(j.co)}</div></div></div>
      <div class="meta">
        <span>${svg(j.remote==='Remote'?ic.remote:ic.pin,14)} ${esc(j.loc)}</span>
        ${j.salary && j.salary!=='Not specified' ? `<span>${svg(ic.cash,14)} ${esc(j.salary)}</span>` : ''}
      </div>
      <div class="tags"><span class="tag muted">${esc(j.type)}</span><span class="tag muted">${esc(j.remote)}</span>${applied[j.id]?'<span class="tag">Applied ✓</span>':''}</div>
      <span class="posted">${esc(j.posted)}${/^\d/.test(j.posted)?' ago':''}</span>
    </article>`;
  }
  function renderDetail(){
    const det = $('#detail');
    const j = JOBS.find(x => x.id === state.selected);
    if (!j || !results().length) { det.classList.remove('show'); det.innerHTML = `<div class="det-empty"><div class="big">🔍</div><b>Select a job</b><p>Pick a role on the left to see details.</p></div>`; return; }
    const body = j.source === 'seed'
      ? `<h4>About the role</h4><p>${esc(j.about)}</p><h4>What you'll do</h4><ul>${j.resp.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><h4>What we're looking for</h4><ul>${j.req.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>${j.tags.length?`<h4>Skills</h4><div class="det-tags">${j.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}`
      : `${j.tags.length?`<div class="det-tags" style="margin-bottom:14px">${j.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}<h4>Job description</h4><p style="white-space:pre-wrap">${esc(j.descText || 'No description provided. Open the full posting to learn more.')}</p>`;
    const applyLabel = applied[j.id] ? 'Applied ✓' : (j.url ? 'Apply now' : 'Apply');
    det.innerHTML = `<div class="detail-card">
      <div class="det-hero">
        <button class="det-back" data-back>${svg(ic.back,18)} Back</button>
        ${tile(j.co, j.logo)}
        <h1>${esc(j.title)}</h1>
        <div class="co"><b>${esc(j.co)}</b> · ${esc(j.loc)}</div>
        <div class="det-actions">
          <button class="btn btn-primary apply" data-apply="${esc(j.id)}" ${applied[j.id]?'disabled':''}>${applyLabel} ${j.url && !applied[j.id]?svg(ic.ext,15):''}</button>
          <button class="btn btn-ghost det-save ${saved[j.id]?'on':''}" data-save="${esc(j.id)}" title="Save">${svg(ic.bookmark,20)}</button>
        </div>
      </div>
      <div class="det-meta">
        <div class="m"><small>Salary</small><b>${esc(j.salary)}</b></div>
        <div class="m"><small>Type</small><b>${esc(j.type)}</b></div>
        <div class="m"><small>Workplace</small><b>${esc(j.remote)}</b></div>
        <div class="m"><small>Posted</small><b>${esc(j.posted)}${/^\d/.test(j.posted)?' ago':''}</b></div>
      </div>
      <div class="det-body">${body}</div>
    </div>`;
    if (window.matchMedia('(max-width:900px)').matches) det.classList.add('show');
  }
  function select(id){ state.selected = id; render(); }

  /* ---------------- apply ---------------- */
  function doApply(id){
    const j = JOBS.find(x => x.id === id); if (!j) return;
    if (j.url) { window.open(j.url, '_blank', 'noopener'); applied[id] = true; persist(); render(); toast('Opening application…'); }
    else { openApply(j); }
  }
  function openApply(j){
    const m = $('#modal');
    m.innerHTML = `<div class="modal"><div class="modal-head"><div><h3>Apply — ${esc(j.title)}</h3><p>${esc(j.co)} · ${esc(j.loc)}</p></div><button class="modal-x" data-close>${svg(ic.x,22)}</button></div>
      <form id="applyForm" class="modal-body" data-id="${esc(j.id)}">
        <div class="frow"><label>Full name</label><input id="ap-name" autocomplete="name" required></div>
        <div class="frow"><label>Email</label><input id="ap-email" type="email" autocomplete="email" required></div>
        <div class="frow"><label>Link (portfolio or résumé)</label><input id="ap-link" placeholder="https://…"></div>
        <div class="err" id="ap-err"></div>
        <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">Submit application</button></div>
      </form></div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); setTimeout(() => $('#ap-name') && $('#ap-name').focus(), 60);
  }
  function closeModal(){ const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); m.innerHTML = ''; }

  /* ---------------- events ---------------- */
  document.addEventListener('click', e => {
    const save = e.target.closest('[data-save]'); if (save) { e.stopPropagation(); const id = save.dataset.save; saved[id] = !saved[id]; persist(); render(); toast(saved[id] ? 'Saved' : 'Removed from saved'); return; }
    const apply = e.target.closest('[data-apply]'); if (apply) { doApply(apply.dataset.apply); return; }
    const chip = e.target.closest('[data-filter]'); if (chip) { const f = chip.dataset.filter; state.filters.has(f) ? state.filters.delete(f) : state.filters.add(f); renderChips(); render(); return; }
    const card = e.target.closest('[data-job]'); if (card) { select(card.dataset.job); return; }
    if (e.target.closest('[data-back]')) { $('#detail').classList.remove('show'); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.id === 'modal') { closeModal(); return; }
    if (e.target.closest('#savedToggle')) { state.savedOnly = !state.savedOnly; render(); }
    if (e.target.closest('#searchBtn')) { state.q = $('#q').value; state.loc = $('#loc').value; render(); }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'applyForm') return; e.preventDefault();
    const id = e.target.dataset.id;
    const name = $('#ap-name').value.trim(), email = $('#ap-email').value.trim();
    if (!name) { $('#ap-err').textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#ap-err').textContent = 'Please enter a valid email.'; return; }
    applied[id] = true; persist();
    const j = JOBS.find(x => x.id === id);
    $('#modal').innerHTML = `<div class="modal"><div class="applied-ok"><div class="check">${svg(ic.check,36)}</div><h3>Application sent!</h3><p>Your application for <b>${esc(j.title)}</b> at <b>${esc(j.co)}</b> is in.</p><div class="modal-foot" style="justify-content:center;padding-top:18px"><button class="btn btn-primary" data-close>Done</button></div></div></div>`;
    render();
  });
  const onType = () => { state.q = $('#q').value; state.loc = $('#loc').value; render(); };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  $('#q').addEventListener('input', debounce(onType, 160));
  $('#loc').addEventListener('input', debounce(onType, 160));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------------- boot ---------------- */
  function skeleton(){ $('#resultCount').textContent = 'Loading…'; $('.sort').textContent = 'Fetching live jobs'; $('#list').innerHTML = Array(6).fill(0).map(() => `<div class="jcard skel"><div class="jcard-top"><span class="sk-tile"></span><div style="flex:1"><span class="sk-line w70"></span><span class="sk-line w40"></span></div></div><span class="sk-line w90"></span><span class="sk-line w50"></span></div>`).join(''); }
  (async function boot(){
    skeleton();
    const live = await fetchLive();
    if (live && live.length) { JOBS = live.filter(j => j.title && j.co); LIVE = true; }
    else { JOBS = SEED; LIVE = false; toast('Showing sample jobs (couldn\'t reach live listings)'); }
    state.selected = JOBS[0] && JOBS[0].id;
    buildChips(JOBS);
    render();
  })();
})();
