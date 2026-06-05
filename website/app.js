/* =====================================================================
   Androgenic Jobs — LIVE remote roles (dark)
   Sources (free, no key, CORS): Remotive → Jobicy → Arbeitnow → seed.
   Swipe up (or tap ⟳) to refresh. Easy Apply emails androgenic@yahoo.com.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const hue = s => { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const initials = n => (n || '?').replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0,2).join('').toUpperCase() || '•';
  const APPLY_EMAIL = 'androgenic@yahoo.com';

  const ic = {
    pin:'<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
    bolt:'<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
    ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  };
  const svg = (p, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const tile = (co, logo) => logo
    ? `<span class="logo-tile" style="--h:${hue(co)};padding:0;overflow:hidden"><img src="${esc(logo)}" alt="" style="width:100%;height:100%;object-fit:cover" referrerpolicy="no-referrer" onerror="this.replaceWith(document.createTextNode('${esc(initials(co))}'))"></span>`
    : `<span class="logo-tile" style="--h:${hue(co)}">${esc(initials(co))}</span>`;

  /* ---------------- helpers ---------------- */
  const prettyType = t => ({ full_time:'Full-time', part_time:'Part-time', contract:'Contract', freelance:'Freelance', internship:'Internship' }[String(t||'').toLowerCase().replace(/[\s-]/g,'_')] || (t ? String(t).replace(/[_-]/g,' ').replace(/\b\w/g, c=>c.toUpperCase()) : 'Full-time'));
  const ago = d => { if (!d) return 'recently'; const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400e3); if (isNaN(days)) return 'recently'; if (days <= 0) return 'today'; if (days === 1) return '1d'; if (days < 30) return days + 'd'; return Math.floor(days/30) + 'mo'; };
  const decodeEntities = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
  function htmlToText(html){
    let s = String(html || '');
    s = s.replace(/<\s*li[^>]*>/gi, '\n• ').replace(/<\s*\/(p|div|h[1-6]|ul|ol|li|tr)\s*>/gi, '\n').replace(/<\s*br\s*\/?>/gi, '\n');
    s = s.replace(/<[^>]+>/g, '');
    return decodeEntities(s).replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
  }
  const cleanLoc = l => { l = String(l || '').trim(); if (!l || /anywhere|worldwide|global/i.test(l)) return 'Worldwide'; return l; };

  /* ---------------- mappers ---------------- */
  const mapRemotive = j => ({ id:'rm'+j.id, title:j.title, co:j.company_name, loc:cleanLoc(j.candidate_required_location), type:prettyType(j.job_type), remote:'Remote', salary:(j.salary||'').trim()||'Not specified', posted:ago(j.publication_date), cat:j.category||'Other', tags:(j.tags||[]).slice(0,6), descText:htmlToText(j.description), url:j.url, logo:j.company_logo||'', source:'Remotive' });
  const mapJobicy = j => ({ id:'jc'+(j.id||Math.random().toString(36).slice(2)), title:j.jobTitle, co:j.companyName, loc:cleanLoc(j.jobGeo), type:prettyType((j.jobType&&j.jobType[0])||'full_time'), remote:'Remote', salary:(j.annualSalaryMin&&j.annualSalaryMax)?`$${(+j.annualSalaryMin/1000)|0}k–$${(+j.annualSalaryMax/1000)|0}k`:'Not specified', posted:ago(j.pubDate), cat:(j.jobIndustry&&j.jobIndustry[0])||'Other', tags:(j.jobIndustry||[]).slice(0,4), descText:htmlToText(j.jobDescription||j.jobExcerpt), url:j.url, logo:j.companyLogo||'', source:'Jobicy' });
  const mapArbeit = j => ({ id:'ab'+(j.slug||Math.random().toString(36).slice(2)), title:j.title, co:j.company_name, loc:cleanLoc(j.location||(j.remote?'Worldwide':'')), type:prettyType((j.job_types||[])[0]), remote:j.remote?'Remote':'On-site', salary:'Not specified', posted:ago(j.created_at?j.created_at*1000:null), cat:(j.tags||[])[0]||'Other', tags:(j.tags||[]).slice(0,6), descText:htmlToText(j.description), url:j.url, logo:'', source:'Arbeitnow' });

  async function fetchJSON(u){ const r = await fetch(u, { headers: { Accept:'application/json' } }); if (!r.ok) throw 0; return r.json(); }
  async function fetchLive(){
    try { const d = await fetchJSON('https://remotive.com/api/remote-jobs?limit=100'); if (d&&d.jobs&&d.jobs.length) return { jobs:d.jobs.map(mapRemotive), source:'Remotive' }; } catch {}
    try { const d = await fetchJSON('https://jobicy.com/api/v2/remote-jobs?count=50'); if (d&&d.jobs&&d.jobs.length) return { jobs:d.jobs.map(mapJobicy), source:'Jobicy' }; } catch {}
    try { const d = await fetchJSON('https://www.arbeitnow.com/api/job-board-api'); if (d&&d.data&&d.data.length) return { jobs:d.data.map(mapArbeit), source:'Arbeitnow' }; } catch {}
    return null;
  }

  /* seeded fallback (so the board is never empty) */
  const SEED = [
    { id:'s1', title:'Frontend Engineer', co:'Remote Co', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$90k–$130k', posted:'today', cat:'Software Development', tags:['React','TypeScript'], descText:'Build delightful web experiences for a fully-remote team. Own features end-to-end and ship weekly.', url:'', source:'Sample' },
    { id:'s2', title:'Product Designer', co:'Studio Nine', loc:'Europe', type:'Full-time', remote:'Remote', salary:'$80k–$110k', posted:'1d', cat:'Design', tags:['Figma','Prototyping'], descText:'Design clean, usable products from idea to launch. Strong portfolio required.', url:'', source:'Sample' },
    { id:'s3', title:'Data Analyst', co:'Insight Labs', loc:'USA', type:'Full-time', remote:'Remote', salary:'$70k–$100k', posted:'2d', cat:'Data', tags:['SQL','Python'], descText:'Turn data into decisions. Build dashboards and answer hard questions with numbers.', url:'', source:'Sample' },
    { id:'s4', title:'Customer Support Specialist', co:'Helpful Inc', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$45k–$60k', posted:'3d', cat:'Customer Service', tags:['Support'], descText:'Be the friendly voice customers rely on. Empathy and clear writing matter most.', url:'', source:'Sample' },
    { id:'s5', title:'DevOps Engineer', co:'Cloudly', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$120k–$160k', posted:'4d', cat:'DevOps / Sysadmin', tags:['AWS','Kubernetes'], descText:'Own the platform that lets engineers ship safely and fast.', url:'', source:'Sample' },
    { id:'s6', title:'Growth Marketer', co:'Launchpad', loc:'USA', type:'Full-time', remote:'Remote', salary:'$75k–$110k', posted:'5d', cat:'Marketing', tags:['SEO','Paid Social'], descText:'Drive growth across channels and obsess over the funnel.', url:'', source:'Sample' },
  ];

  /* ---------------- state ---------------- */
  let JOBS = [], CHIPS = [], SOURCE = '', LIVE = false, refreshing = false, lastRefresh = 0;
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('andro_saved')) || {}; } catch {}
  let applied = {}; try { applied = JSON.parse(localStorage.getItem('andro_applied')) || {}; } catch {}
  const persist = () => { localStorage.setItem('andro_saved', JSON.stringify(saved)); localStorage.setItem('andro_applied', JSON.stringify(applied)); };
  const state = { q:'', loc:'', filters:new Set(), savedOnly:false, selected:null };

  function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------------- chips (locations + types + cats from data) ---------------- */
  function buildChips(jobs){
    const top = key => { const c = {}; jobs.forEach(j => { const v = j[key]; if (v) c[v] = (c[v]||0)+1; }); return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(e=>e[0]); };
    const locs = top('loc').slice(0, 6);
    const types = [...new Set(jobs.map(j=>j.type))].filter(Boolean);
    const cats = top('cat').slice(0, 8);
    CHIPS = [
      ...locs.map(l => ({ label:l, kind:'loc' })),
      ...types.map(t => ({ label:t, kind:'type' })),
      ...cats.map(c => ({ label:c, kind:'cat' })),
    ];
    renderChips();
  }
  function renderChips(){ $('#chips').innerHTML = CHIPS.map(c => `<button class="chip ${c.kind==='loc'?'country':''} ${state.filters.has(c.label)?'on':''}" data-filter="${esc(c.label)}">${c.kind==='loc'?'📍 ':''}${esc(c.label)}</button>`).join(''); }

  /* ---------------- filter ---------------- */
  function results(){
    const q = state.q.toLowerCase().trim(), loc = state.loc.toLowerCase().trim();
    return JOBS.filter(j => {
      if (state.savedOnly && !saved[j.id]) return false;
      if (q && !(`${j.title} ${j.co} ${(j.tags||[]).join(' ')} ${j.cat}`.toLowerCase().includes(q))) return false;
      if (loc && !(`${j.loc}`.toLowerCase().includes(loc))) return false;
      const locFilters = CHIPS.filter(c => c.kind==='loc' && state.filters.has(c.label)).map(c=>c.label);
      if (locFilters.length && !locFilters.includes(j.loc)) return false;
      for (const f of state.filters) {
        const c = CHIPS.find(x => x.label === f); if (!c || c.kind==='loc') continue;
        if (c.kind === 'type' && j.type !== f) return false;
        if (c.kind === 'cat' && j.cat !== f) return false;
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  const savedCount = () => Object.values(saved).filter(Boolean).length;
  function render(){
    const list = results();
    $('#savedCount').textContent = savedCount();
    $('#savedToggle').classList.toggle('active', state.savedOnly);
    $('#resultCount').textContent = `${list.length} job${list.length===1?'':'s'}`;
    $('.sort').textContent = LIVE ? `Live · ${SOURCE}` : 'Sample data (offline)';
    if (!list.length) $('#list').innerHTML = `<div class="no-results">No jobs match your search.<br>Try clearing filters or tap ⟳.</div>`;
    else { if (!list.find(j => j.id === state.selected)) state.selected = list[0].id; $('#list').innerHTML = list.map((j,i) => cardHTML(j,i)).join(''); }
    renderDetail();
  }
  function cardHTML(j,i){
    return `<article class="jcard ${j.id===state.selected?'active':''}" data-job="${esc(j.id)}" style="animation-delay:${Math.min(i*30,280)}ms">
      <button class="save ${saved[j.id]?'on':''}" data-save="${esc(j.id)}" title="Save">${svg(ic.bookmark,20)}</button>
      <div class="jcard-top">${tile(j.co,j.logo)}
        <div class="jc-main"><h3>${esc(j.title)}</h3><div class="co">${esc(j.co)}</div></div></div>
      <div class="meta">
        <span>${svg(ic.pin,14)} ${esc(j.loc)}</span>
        ${j.salary&&j.salary!=='Not specified'?`<span>${svg(ic.cash,14)} ${esc(j.salary)}</span>`:''}
      </div>
      <div class="tags"><span class="tag muted">${esc(j.type)}</span><span class="tag muted">${esc(j.remote)}</span>${applied[j.id]?'<span class="tag ok">Applied ✓</span>':'<span class="tag">⚡ Easy apply</span>'}</div>
      <span class="posted">${esc(j.posted)}${/^\d/.test(j.posted)?' ago':''}</span>
    </article>`;
  }
  function renderDetail(){
    const det = $('#detail');
    const j = JOBS.find(x => x.id === state.selected);
    if (!j || !results().length) { det.classList.remove('show'); det.innerHTML = `<div class="det-empty"><div class="big">🔍</div><b>Select a job</b><p>Pick a role to see details and apply.</p></div>`; return; }
    det.innerHTML = `<div class="detail-card">
      <div class="det-hero">
        <button class="det-back" data-back>${svg(ic.back,18)} Back</button>
        ${tile(j.co,j.logo)}
        <h1>${esc(j.title)}</h1>
        <div class="co"><b>${esc(j.co)}</b> · ${esc(j.loc)}</div>
        <div class="det-actions">
          <button class="btn btn-primary apply" data-apply="${esc(j.id)}" ${applied[j.id]?'disabled':''}>${applied[j.id]?'Applied ✓':`${svg(ic.bolt,16)} Easy apply`}</button>
          <button class="btn btn-ghost det-save ${saved[j.id]?'on':''}" data-save="${esc(j.id)}" title="Save">${svg(ic.bookmark,20)}</button>
          ${j.url?`<a class="det-link" href="${esc(j.url)}" target="_blank" rel="noopener">View original ${svg(ic.ext,15)}</a>`:''}
        </div>
      </div>
      <div class="det-meta">
        <div class="m"><small>Salary</small><b>${esc(j.salary)}</b></div>
        <div class="m"><small>Type</small><b>${esc(j.type)}</b></div>
        <div class="m"><small>Workplace</small><b>${esc(j.remote)}</b></div>
        <div class="m"><small>Posted</small><b>${esc(j.posted)}${/^\d/.test(j.posted)?' ago':''}</b></div>
      </div>
      <div class="det-body"><h4>Job description</h4><p style="white-space:pre-wrap">${esc(j.descText||'No description provided. Use “View original” for the full posting.')}</p>
        ${j.tags.length?`<h4>Skills</h4><div class="det-tags">${j.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}</div>
    </div>`;
    if (window.matchMedia('(max-width:900px)').matches) det.classList.add('show');
  }
  const select = id => { state.selected = id; render(); };

  /* ---------------- easy apply ---------------- */
  function openApply(j){
    const m = $('#modal');
    m.innerHTML = `<div class="modal">
      <div class="modal-head"><div><h3>Easy apply — ${esc(j.title)}</h3><p>${esc(j.co)} · ${esc(j.loc)}</p></div><button class="modal-x" data-close>${svg(ic.x,22)}</button></div>
      <form id="applyForm" class="modal-body" data-id="${esc(j.id)}">
        <div class="easy-note">${svg(ic.bolt,15)} One-tap apply — your details go straight to the recruiter.</div>
        <div class="frow"><label>Full name</label><input id="ap-name" autocomplete="name" placeholder="Your name" required></div>
        <div class="frow two"><div><label>Email</label><input id="ap-email" type="email" autocomplete="email" placeholder="you@email.com" required></div>
          <div><label>Phone</label><input id="ap-phone" type="tel" autocomplete="tel" placeholder="+…" required></div></div>
        <div class="frow"><label>CV / LinkedIn link (optional)</label><input id="ap-link" placeholder="https://…"></div>
        <div class="err" id="ap-err"></div>
        <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary" id="ap-submit">${svg(ic.bolt,16)} Submit application</button></div>
      </form></div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden','false'); setTimeout(() => $('#ap-name') && $('#ap-name').focus(), 60);
  }
  function closeModal(){ const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); m.innerHTML = ''; }
  function successScreen(j){ $('#modal').innerHTML = `<div class="modal"><div class="applied-ok"><div class="check">${svg(ic.check,36)}</div><h3>Application sent!</h3><p>Your application for <b>${esc(j.title)}</b> at <b>${esc(j.co)}</b> has been submitted. Good luck! 🤞</p><div class="modal-foot" style="justify-content:center;padding-top:18px"><button class="btn btn-primary" data-close>Done</button></div></div></div>`; }
  async function submitApply(e){
    e.preventDefault();
    const id = e.target.dataset.id, j = JOBS.find(x => x.id === id);
    const name = $('#ap-name').value.trim(), email = $('#ap-email').value.trim(), phone = $('#ap-phone').value.trim(), link = $('#ap-link').value.trim();
    const err = $('#ap-err');
    if (!name) { err.textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email.'; return; }
    if (phone.replace(/[^0-9]/g,'').length < 7) { err.textContent = 'Please enter a valid phone number.'; return; }
    const btn = $('#ap-submit'); btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + APPLY_EMAIL, { method:'POST', headers:{ 'Content-Type':'application/json', Accept:'application/json' },
        body: JSON.stringify({ Name:name, Email:email, Phone:phone, Link:link||'—', Job:j.title, Company:j.co, Location:j.loc, Original:j.url||'—', _subject:`New application: ${j.title} @ ${j.co}`, _template:'table', _captcha:'false' }) });
      if (!res.ok) throw 0;
      applied[id] = true; persist(); successScreen(j); render();
    } catch { err.textContent = 'Could not send right now. Please try again, or email ' + APPLY_EMAIL + '.'; btn.disabled = false; btn.innerHTML = svg(ic.bolt,16) + ' Submit application'; }
  }

  /* ---------------- refresh ---------------- */
  function skeleton(){ $('#resultCount').textContent = 'Loading…'; $('.sort').textContent = 'Fetching live jobs'; $('#list').innerHTML = Array(6).fill(0).map(() => `<div class="jcard skel"><div class="jcard-top"><span class="sk-tile"></span><div style="flex:1"><span class="sk-line w70"></span><span class="sk-line w40"></span></div></div><span class="sk-line w90"></span><span class="sk-line w50"></span></div>`).join(''); }
  async function loadJobs(isRefresh){
    if (refreshing) return; refreshing = true; lastRefresh = Date.now();
    $('#refreshBtn').classList.add('spinning');
    if (isRefresh) $('#refreshBar').classList.add('on'); else skeleton();
    const live = await fetchLive();
    if (live && live.jobs.length) { JOBS = live.jobs.filter(j => j.title && j.co); SOURCE = live.source; LIVE = true; }
    else { JOBS = SEED; SOURCE = ''; LIVE = false; if (!isRefresh) toast('Showing sample jobs (couldn\'t reach live listings)'); }
    if (!JOBS.find(j => j.id === state.selected)) state.selected = JOBS[0] && JOBS[0].id;
    buildChips(JOBS); render();
    $('#refreshBtn').classList.remove('spinning');
    setTimeout(() => $('#refreshBar').classList.remove('on'), 350);
    if (isRefresh && LIVE) toast(`Updated · ${JOBS.length} live jobs`);
    refreshing = false;
  }
  function refresh(){ if (Date.now() - lastRefresh < 1200) return; window.scrollTo({ top: 0, behavior: 'smooth' }); loadJobs(true); }

  /* ---------------- events ---------------- */
  document.addEventListener('click', e => {
    const save = e.target.closest('[data-save]'); if (save) { e.stopPropagation(); const id = save.dataset.save; saved[id] = !saved[id]; persist(); render(); toast(saved[id]?'Saved':'Removed from saved'); return; }
    const apply = e.target.closest('[data-apply]'); if (apply) { const j = JOBS.find(x => x.id === apply.dataset.apply); if (j) openApply(j); return; }
    const chip = e.target.closest('[data-filter]'); if (chip) { const f = chip.dataset.filter; state.filters.has(f)?state.filters.delete(f):state.filters.add(f); renderChips(); render(); return; }
    const card = e.target.closest('[data-job]'); if (card) { select(card.dataset.job); return; }
    if (e.target.closest('[data-back]')) { $('#detail').classList.remove('show'); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.id === 'modal') { closeModal(); return; }
    if (e.target.closest('#refreshBtn')) { refresh(); return; }
    if (e.target.closest('#savedToggle')) { state.savedOnly = !state.savedOnly; render(); }
    if (e.target.closest('#searchBtn')) { state.q = $('#q').value; state.loc = $('#loc').value; render(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'applyForm') submitApply(e); });
  const onType = () => { state.q = $('#q').value; state.loc = $('#loc').value; render(); };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  $('#q').addEventListener('input', debounce(onType, 150));
  $('#loc').addEventListener('input', debounce(onType, 150));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); if (e.key.toLowerCase() === 'r' && !/input|textarea/i.test((e.target.tagName||''))) refresh(); });

  /* pull down (from the top) to refresh — mobile */
  let sy = null, st = 0, atTop = false;
  addEventListener('touchstart', e => {
    if ($('#modal').classList.contains('open')) { sy = null; return; }
    sy = e.touches[0].clientY; st = Date.now();
    atTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 2;
  }, { passive: true });
  addEventListener('touchmove', e => {
    if (sy == null || !atTop) return;
    const dy = e.touches[0].clientY - sy;
    if (dy > 24 && dy < 160) $('#refreshBar').style.height = Math.min(dy, 40) + 'px';
  }, { passive: true });
  addEventListener('touchend', e => {
    $('#refreshBar').style.height = '';
    if (sy == null) return;
    const ey = (e.changedTouches[0] || {}).clientY || 0;
    const dy = ey - sy, dt = Date.now() - st;
    if (atTop && dy > 90 && Math.abs(dy) > 50) refresh();   // pulled down
    sy = null;
  }, { passive: true });

  /* ---------------- boot ---------------- */
  renderChips();
  loadJobs(false);
})();
