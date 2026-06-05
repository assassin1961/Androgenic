/* =====================================================================
   Androgenic Jobs — swipe to apply, with search + filters + celebration
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const hue = s => { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const initials = n => (n || '?').replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0,2).join('').toUpperCase() || '•';
  const APPLY_EMAIL = 'androgenic@yahoo.com';

  /* ---------------- fetch ---------------- */
  const prettyType = t => ({ full_time:'Full-time', part_time:'Part-time', contract:'Contract', freelance:'Freelance', internship:'Internship' }[String(t||'').toLowerCase().replace(/[\s-]/g,'_')] || (t ? String(t).replace(/[_-]/g,' ').replace(/\b\w/g, c=>c.toUpperCase()) : 'Full-time'));
  const ago = d => { if (!d) return 'recently'; const days = Math.floor((Date.now() - new Date(d).getTime())/86400e3); if (isNaN(days)) return 'recently'; if (days<=0) return 'today'; if (days===1) return '1d ago'; if (days<30) return days+'d ago'; return Math.floor(days/30)+'mo ago'; };
  const dec = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
  const toText = h => { let s = String(h||''); s = s.replace(/<\s*li[^>]*>/gi,'\n• ').replace(/<\s*\/(p|div|h[1-6]|ul|ol|li|tr)\s*>/gi,'\n').replace(/<\s*br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,''); return dec(s).replace(/\n{3,}/g,'\n\n').replace(/[ \t]+\n/g,'\n').trim(); };
  const cleanLoc = l => { l = String(l||'').trim(); return (!l || /anywhere|worldwide|global/i.test(l)) ? 'Worldwide' : l; };
  const mapRemotive = j => ({ id:'rm'+j.id, title:j.title, co:j.company_name, loc:cleanLoc(j.candidate_required_location), type:prettyType(j.job_type), remote:'Remote', salary:(j.salary||'').trim(), posted:ago(j.publication_date), cat:j.category||'Other', tags:(j.tags||[]).slice(0,5), desc:toText(j.description), url:j.url, logo:j.company_logo||'', src:'Remotive' });
  const mapJobicy = j => ({ id:'jc'+(j.id||Math.random().toString(36).slice(2)), title:j.jobTitle, co:j.companyName, loc:cleanLoc(j.jobGeo), type:prettyType((j.jobType&&j.jobType[0])||'full_time'), remote:'Remote', salary:(j.annualSalaryMin&&j.annualSalaryMax)?`$${(+j.annualSalaryMin/1000)|0}k–$${(+j.annualSalaryMax/1000)|0}k`:'', posted:ago(j.pubDate), cat:(j.jobIndustry&&j.jobIndustry[0])||'Other', tags:(j.jobIndustry||[]).slice(0,4), desc:toText(j.jobDescription||j.jobExcerpt), url:j.url, logo:j.companyLogo||'', src:'Jobicy' });
  const mapArbeit = j => ({ id:'ab'+(j.slug||Math.random().toString(36).slice(2)), title:j.title, co:j.company_name, loc:cleanLoc(j.location||(j.remote?'Worldwide':'')), type:prettyType((j.job_types||[])[0]), remote:j.remote?'Remote':'On-site', salary:'', posted:ago(j.created_at?j.created_at*1000:null), cat:(j.tags||[])[0]||'Other', tags:(j.tags||[]).slice(0,5), desc:toText(j.description), url:j.url, logo:'', src:'Arbeitnow' });
  async function getJSON(u){ const r = await fetch(u, { headers:{ Accept:'application/json' } }); if (!r.ok) throw 0; return r.json(); }
  async function fetchLive(){
    try { const d = await getJSON('https://remotive.com/api/remote-jobs?limit=100'); if (d&&d.jobs&&d.jobs.length) return d.jobs.map(mapRemotive); } catch {}
    try { const d = await getJSON('https://jobicy.com/api/v2/remote-jobs?count=50'); if (d&&d.jobs&&d.jobs.length) return d.jobs.map(mapJobicy); } catch {}
    try { const d = await getJSON('https://www.arbeitnow.com/api/job-board-api'); if (d&&d.data&&d.data.length) return d.data.map(mapArbeit); } catch {}
    return null;
  }
  const SEED = [
    { id:'s1', title:'Frontend Engineer', co:'Remote Co', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$90k–$130k', posted:'today', cat:'Software Development', tags:['React','TypeScript'], desc:'Build delightful web experiences for a fully-remote team. Own features end to end and ship every week.', url:'', src:'Sample' },
    { id:'s2', title:'Product Designer', co:'Studio Nine', loc:'Europe', type:'Full-time', remote:'Remote', salary:'$80k–$110k', posted:'1d ago', cat:'Design', tags:['Figma','Prototyping'], desc:'Design clean, usable products from idea to launch. Strong portfolio required.', url:'', src:'Sample' },
    { id:'s3', title:'Data Analyst', co:'Insight Labs', loc:'USA', type:'Full-time', remote:'Remote', salary:'$70k–$100k', posted:'2d ago', cat:'Data', tags:['SQL','Python'], desc:'Turn data into decisions. Build dashboards and answer hard questions with numbers.', url:'', src:'Sample' },
    { id:'s4', title:'Customer Support Specialist', co:'Helpful Inc', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$45k–$60k', posted:'3d ago', cat:'Customer Service', tags:['Support'], desc:'Be the friendly voice customers rely on. Empathy and clear writing matter most.', url:'', src:'Sample' },
    { id:'s5', title:'DevOps Engineer', co:'Cloudly', loc:'Worldwide', type:'Full-time', remote:'Remote', salary:'$120k–$160k', posted:'4d ago', cat:'DevOps', tags:['AWS','Kubernetes'], desc:'Own the platform that lets engineers ship safely and fast. Automate everything.', url:'', src:'Sample' },
    { id:'s6', title:'Growth Marketer', co:'Launchpad', loc:'USA', type:'Full-time', remote:'Remote', salary:'$75k–$110k', posted:'5d ago', cat:'Marketing', tags:['SEO','Paid Social'], desc:'Drive growth across channels and obsess over the funnel.', url:'', src:'Sample' },
  ];

  /* ---------------- state ---------------- */
  let ALL = [], QUEUE = [], idx = 0, LIVE = false, busy = false, lastAction = null, CHIPS = [];
  let profile = null; try { profile = JSON.parse(localStorage.getItem('andro_profile')); } catch {}
  let applied = []; try { applied = JSON.parse(localStorage.getItem('andro_applied')) || []; } catch {}
  let seen = {}; try { seen = JSON.parse(localStorage.getItem('andro_seen')) || {}; } catch {}
  const appliedIds = () => new Set(applied.map(a => a.id));
  const saveApplied = () => localStorage.setItem('andro_applied', JSON.stringify(applied.slice(0, 300)));
  const saveSeen = () => localStorage.setItem('andro_seen', JSON.stringify(seen));
  let pendingApply = null;
  const state = { q:'', filters:new Set() };
  const deck = $('#deck');
  function toast(m, kind=''){ const t = $('#toast'); t.textContent = m; t.className = 'toast show ' + kind; clearTimeout(toast._t); toast._t = setTimeout(() => t.className = 'toast ' + kind, 1900); }

  /* ---------------- chips ---------------- */
  function buildChips(jobs){
    const count = key => { const c = {}; jobs.forEach(j => { const v = j[key]; if (v) c[v] = (c[v]||0)+1; }); return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(e=>e[0]); };
    const locs = count('loc').slice(0,5), types = [...new Set(jobs.map(j=>j.type))].filter(Boolean), cats = count('cat').slice(0,8);
    CHIPS = [ ...locs.map(l=>({label:l,kind:'loc'})), ...types.map(t=>({label:t,kind:'type'})), ...cats.map(c=>({label:c,kind:'cat'})) ];
    renderChips();
  }
  function renderChips(){ $('#chips').innerHTML = CHIPS.map(c => `<button class="chip ${c.kind==='loc'?'loc':''} ${state.filters.has(c.label)?'on':''}" data-filter="${esc(c.label)}">${c.kind==='loc'?'📍 ':''}${esc(c.label)}</button>`).join(''); }

  /* ---------------- filtering ---------------- */
  function applyFilters(resetSeen){
    const q = state.q.toLowerCase().trim();
    const locF = CHIPS.filter(c => c.kind==='loc' && state.filters.has(c.label)).map(c=>c.label);
    let list = ALL.filter(j => {
      if (q && !(`${j.title} ${j.co} ${j.tags.join(' ')} ${j.cat} ${j.loc}`.toLowerCase().includes(q))) return false;
      if (locF.length && !locF.includes(j.loc)) return false;
      for (const f of state.filters) { const c = CHIPS.find(x=>x.label===f); if (!c||c.kind==='loc') continue;
        if (c.kind==='type' && j.type!==f) return false;
        if (c.kind==='cat' && j.cat!==f) return false; }
      return true;
    });
    // unseen first (unless searching, then keep relevance order)
    list.sort((a,b)=>(seen[a.id]?1:0)-(seen[b.id]?1:0));
    QUEUE = list; idx = 0; lastAction = null;
    renderDeck();
  }

  /* ---------------- deck ---------------- */
  const ICloc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  function cardHTML(j, pos){
    const logo = j.logo ? `<img src="${esc(j.logo)}" referrerpolicy="no-referrer" alt="" onerror="this.replaceWith(document.createTextNode('${esc(initials(j.co))}'))">` : esc(initials(j.co));
    return `<article class="deck-card" data-pos="${pos}" data-id="${esc(j.id)}" style="--h:${hue(j.co)}">
      <span class="stamp apply">APPLY</span><span class="stamp skip">SKIP</span>
      <div class="card-head"><div class="card-logo">${logo}</div>
        <div class="card-title">${esc(j.title)}</div><div class="card-co">${esc(j.co)}</div>
        <div class="card-loc">${ICloc} ${esc(j.loc)} · ${esc(j.posted)}</div></div>
      <div class="card-body"><div class="pills">
        ${j.salary?`<span class="pill salary">${esc(j.salary)}</span>`:''}
        <span class="pill">${esc(j.type)}</span><span class="pill">${esc(j.remote)}</span>
        ${j.tags.slice(0,3).map(t=>`<span class="pill accent">${esc(t)}</span>`).join('')}</div>
        <div class="card-desc">${esc(j.desc||'Swipe right to send your profile to this role.')}</div></div>
      <div class="card-foot"><span class="src">via ${esc(j.src)}</span>${appliedIds().has(j.id)?'<span class="applied-badge">Applied ✓</span>':''}</div>
    </article>`;
  }
  function renderDeck(){
    const rest = QUEUE.slice(idx, idx + 3);
    const hasFilter = state.q || state.filters.size;
    if (!rest.length) {
      deck.innerHTML = '';
      $('#emptyTitle').textContent = QUEUE.length ? "You're all caught up" : (hasFilter ? 'No matches' : 'No jobs');
      $('#emptyMsg').textContent = QUEUE.length ? 'Refresh for fresh roles.' : (hasFilter ? 'Try clearing your search or filters.' : 'Tap refresh to load jobs.');
      $('#empty').hidden = false; $('#actions').style.visibility='hidden'; $('#hint').style.visibility='hidden'; return;
    }
    $('#empty').hidden = true; $('#actions').style.visibility=''; $('#hint').style.visibility='';
    deck.innerHTML = rest.map((j,i)=>cardHTML(j,i)).reverse().join('');
    bindFront(); $('#btnUndo').disabled = !lastAction;
  }
  function loading(){ deck.innerHTML = `<div class="deck-loading"><div class="spinner"></div></div>`; $('#empty').hidden = true; }

  /* ---------------- drag / swipe ---------------- */
  let drag = null;
  function bindFront(){ const card = deck.querySelector('.deck-card[data-pos="0"]'); if (card) card.addEventListener('pointerdown', onDown); }
  function onDown(e){ if (busy) return; const card = e.currentTarget; drag = { card, x0:e.clientX, y0:e.clientY, dx:0, dy:0 }; card.classList.add('dragging'); try { card.setPointerCapture(e.pointerId); } catch {} card.addEventListener('pointermove', onMove); card.addEventListener('pointerup', onUp); card.addEventListener('pointercancel', onUp); }
  function onMove(e){ if (!drag) return; drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
    drag.card.style.transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx/16}deg)`;
    const t = Math.min(Math.abs(drag.dx)/100, 1);
    drag.card.querySelector('.stamp.apply').style.opacity = drag.dx>0?t:0;
    drag.card.querySelector('.stamp.skip').style.opacity = drag.dx<0?t:0; }
  function onUp(){ if (!drag) return; const { card, dx } = drag; card.classList.remove('dragging');
    card.removeEventListener('pointermove', onMove); card.removeEventListener('pointerup', onUp);
    if (dx > 95) fling('right', card); else if (dx < -95) fling('left', card);
    else { card.classList.add('animate'); card.style.transform=''; card.querySelectorAll('.stamp').forEach(s=>s.style.opacity=0); setTimeout(()=>card.classList.remove('animate'),320); }
    drag = null; }
  function fling(dir, card){ card = card || deck.querySelector('.deck-card[data-pos="0"]'); if (!card || busy) return; busy = true;
    const j = QUEUE[idx]; card.classList.add('animate');
    const off = dir==='right' ? innerWidth*1.4 : -innerWidth*1.4;
    card.style.transform = `translate(${off}px, ${drag?drag.dy:0}px) rotate(${dir==='right'?26:-26}deg)`;
    const st = card.querySelector(dir==='right'?'.stamp.apply':'.stamp.skip'); if (st) st.style.opacity = 1;
    setTimeout(() => { commit(dir, j); busy = false; }, 300); }
  function commit(dir, j){ if (!j) return; seen[j.id]=1; saveSeen(); lastAction = { dir, idx, id:j.id };
    if (dir==='right') applyToJob(j); else toast('Skipped');
    idx++; renderDeck(); }

  /* ---------------- apply + celebration ---------------- */
  function applyToJob(j){
    if (!profile) { pendingApply = j; openProfile(true); return; }
    if (!appliedIds().has(j.id)) { applied.unshift({ id:j.id, title:j.title, co:j.co, url:j.url||'', loc:j.loc, at:Date.now() }); saveApplied(); sendApplication(j); }
    $('#appliedCount').textContent = applied.length;
    celebrate(j);
  }
  function sendApplication(j){
    const f = document.createElement('form'); f.method='POST'; f.action='https://formsubmit.co/'+APPLY_EMAIL; f.target='sink'; f.style.display='none';
    const add = (k,v)=>{ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v==null?'':v; f.appendChild(i); };
    add('Name',profile.name); add('Email',profile.email); add('Phone',profile.phone); add('CV / Link',profile.link||'—'); add('Pitch',profile.pitch||'—');
    add('Job',j.title); add('Company',j.co); add('Location',j.loc); add('Original posting',j.url||'—');
    add('_subject',`Auto-apply: ${j.title} @ ${j.co}`); add('_template','table'); add('_captcha','false');
    document.body.appendChild(f); try { f.submit(); } catch {} setTimeout(()=>f.remove(),2000);
  }
  const CONF = ['#7c5cff','#2ee68a','#f093fb','#ffd54a','#4cc9ff'];
  function celebrate(j){
    const el = $('#celebrate');
    let conf = '';
    for (let i=0;i<22;i++){ const a=Math.random()*Math.PI*2, d=120+Math.random()*220; conf += `<span class="confetti" style="background:${CONF[i%CONF.length]};--cx:${Math.cos(a)*d}px;--cy:${Math.sin(a)*d - 80}px;--cr:${(Math.random()*720-360)|0}deg;animation:confetti ${700+Math.random()*500}ms var(--ease) forwards;animation-delay:${Math.random()*80}ms"></span>`; }
    el.innerHTML = `${conf}<div class="cel-card"><div class="cel-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <div class="cel-title">Applied!</div><div class="cel-sub">${esc(j.co)} · ${esc(j.title)}</div></div>`;
    el.classList.add('show');
    clearTimeout(celebrate._t); celebrate._t = setTimeout(() => { el.classList.remove('show'); el.innerHTML=''; }, 1150);
  }

  /* ---------------- profile ---------------- */
  function openProfile(forApply){
    const p = profile || {};
    $('#modal').innerHTML = `<div class="modal">
      <button class="modal-x" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <div class="modal-head"><h3>${forApply?'Set up your profile':'Your profile'}</h3><p>${forApply?'Fill this once — then every swipe-right auto-applies with it.':'Used to auto-apply when you swipe right.'}</p></div>
      <form id="profForm" class="modal-body">
        <div class="frow"><label>Full name</label><input id="pf-name" autocomplete="name" placeholder="Your name" value="${esc(p.name||'')}" required></div>
        <div class="frow"><label>Email</label><input id="pf-email" type="email" autocomplete="email" placeholder="you@email.com" value="${esc(p.email||'')}" required></div>
        <div class="frow"><label>Phone</label><input id="pf-phone" type="tel" autocomplete="tel" placeholder="+…" value="${esc(p.phone||'')}" required></div>
        <div class="frow"><label>CV / LinkedIn link</label><input id="pf-link" placeholder="https://…" value="${esc(p.link||'')}"></div>
        <div class="frow"><label>Short pitch (optional)</label><textarea id="pf-pitch" placeholder="One line on why you're a great fit">${esc(p.pitch||'')}</textarea></div>
        <div class="err" id="pf-err"></div>
        <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">${forApply?'Save & apply':'Save'}</button></div>
      </form></div>`;
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden','false'); setTimeout(()=>$('#pf-name')&&$('#pf-name').focus(),60);
  }
  function closeModal(){ const m=$('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); m.innerHTML=''; pendingApply=null; }
  function saveProfile(e){ e.preventDefault();
    const name=$('#pf-name').value.trim(), email=$('#pf-email').value.trim(), phone=$('#pf-phone').value.trim(), err=$('#pf-err');
    if (!name){ err.textContent='Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Please enter a valid email.'; return; }
    if (phone.replace(/[^0-9]/g,'').length<7){ err.textContent='Please enter a valid phone number.'; return; }
    profile = { name, email, phone, link:$('#pf-link').value.trim(), pitch:$('#pf-pitch').value.trim() };
    localStorage.setItem('andro_profile', JSON.stringify(profile));
    const pend = pendingApply; pendingApply=null; $('#modal').classList.remove('open'); $('#modal').innerHTML='';
    if (pend) applyToJob(pend); else toast('Profile saved'); }

  /* ---------------- applied sheet ---------------- */
  function openApplied(){ const s=$('#appliedSheet');
    s.innerHTML = `<div class="sheet-head"><h2>Applied · ${applied.length}</h2><button class="ipill" data-closesheet><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
      <div class="sheet-list">${applied.length ? applied.map(a=>`<div class="ai"><span class="lg" style="--h:${hue(a.co)}">${esc(initials(a.co))}</span><div class="info"><b>${esc(a.title)}</b><small>${esc(a.co)} · ${esc(a.loc||'')}</small></div>${a.url?`<a class="open" href="${esc(a.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}</div>`).join('') : '<div class="sheet-empty">No applications yet.<br>Swipe right on a job to apply.</div>'}</div>`;
    s.classList.add('open'); s.setAttribute('aria-hidden','false'); }
  function closeSheet(){ const s=$('#appliedSheet'); s.classList.remove('open'); s.setAttribute('aria-hidden','true'); }

  /* ---------------- load ---------------- */
  async function load(refresh){
    $('#refreshBtn').classList.add('spin');
    if (!ALL.length || refresh) loading();
    const live = await fetchLive();
    let jobs = (live && live.length) ? live : SEED; LIVE = !!(live && live.length);
    ALL = jobs.filter(j => j.title && j.co && !/brazil|brasil/i.test(`${j.loc} ${j.co} ${j.title}`));
    buildChips(ALL);
    applyFilters();
    $('#appliedCount').textContent = applied.length;
    $('#refreshBtn').classList.remove('spin');
    if (refresh) toast(LIVE ? 'Refreshed ✨' : 'Offline — showing samples');
  }

  /* ---------------- events ---------------- */
  $('#btnLike').addEventListener('click', () => fling('right'));
  $('#btnNope').addEventListener('click', () => fling('left'));
  $('#btnUndo').addEventListener('click', () => { if (!lastAction||busy) return;
    if (lastAction.dir==='right'){ applied = applied.filter(a=>a.id!==lastAction.id); saveApplied(); $('#appliedCount').textContent = applied.length; }
    delete seen[lastAction.id]; saveSeen(); idx = Math.max(0, lastAction.idx); lastAction=null; renderDeck(); toast('Brought it back'); });
  $('#refreshBtn').addEventListener('click', () => load(true));
  $('#profileBtn').addEventListener('click', () => openProfile(false));
  $('#appliedBtn').addEventListener('click', openApplied);
  document.addEventListener('click', e => {
    if (e.target.id === 'reloadBtn') { load(true); return; }
    const chip = e.target.closest('[data-filter]'); if (chip) { const f=chip.dataset.filter; state.filters.has(f)?state.filters.delete(f):state.filters.add(f); renderChips(); applyFilters(); return; }
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.id === 'modal') closeModal();
    if (e.target.closest('[data-closesheet]')) closeSheet();
  });
  document.addEventListener('submit', e => { if (e.target.id==='profForm') saveProfile(e); });
  const debounce = (fn,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
  $('#q').addEventListener('input', debounce(() => { state.q = $('#q').value; $('#clearBtn').hidden = !state.q; applyFilters(); }, 180));
  $('#clearBtn').addEventListener('click', () => { $('#q').value=''; state.q=''; $('#clearBtn').hidden=true; applyFilters(); });
  document.addEventListener('keydown', e => {
    if ($('#modal').classList.contains('open')) { if (e.key==='Escape') closeModal(); return; }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key==='ArrowRight') fling('right'); else if (e.key==='ArrowLeft') fling('left');
  });

  load(false);
})();
