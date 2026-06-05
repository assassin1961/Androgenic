/* =====================================================================
   Androgenic Jobs — UAE & Pakistan job board (dark) + Easy Apply
   Curated current-style roles. Easy Apply emails applications to
   androgenic@yahoo.com via FormSubmit. Save persists in localStorage.
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
  const tile = co => `<span class="logo-tile" style="--h:${hue(co)}">${esc(initials(co))}</span>`;
  const flag = c => c === 'UAE' ? '🇦🇪' : '🇵🇰';

  /* ---------------- curated listings (UAE & Pakistan) ---------------- */
  const J = (o) => o;
  const JOBS = [
    /* ---------- UAE ---------- */
    J({ id:'ae1', title:'Software Engineer', co:'Careem', country:'UAE', city:'Dubai', type:'Full-time', remote:'On-site', salary:'AED 22,000–30,000 / mo', posted:'2d', cat:'Engineering', tags:['Node.js','React','AWS'],
      about:'Join the team building the everything app for the region. Ship features used by millions across the Middle East.', resp:['Build and own backend & frontend features','Write clean, well-tested code','Collaborate with product & design'], req:['3+ years software engineering','Strong JavaScript / Node.js','Experience with cloud (AWS/GCP)'] }),
    J({ id:'ae2', title:'Senior Accountant', co:'Emirates NBD', country:'UAE', city:'Dubai', type:'Full-time', remote:'On-site', salary:'AED 15,000–20,000 / mo', posted:'4d', cat:'Finance', tags:['IFRS','Reconciliation','Excel'],
      about:'Own month-end close and reporting for a leading regional bank.', resp:['Prepare financial statements','Lead reconciliations and audits','Ensure IFRS compliance'], req:['Qualified accountant (ACCA/CA/CPA)','4+ years in finance','Strong Excel'] }),
    J({ id:'ae3', title:'Digital Marketing Manager', co:'noon', country:'UAE', city:'Dubai', type:'Full-time', remote:'Hybrid', salary:'AED 18,000–25,000 / mo', posted:'1d', cat:'Marketing', tags:['Performance','SEO','Paid Social'],
      about:'Drive growth for the region’s leading marketplace through performance and lifecycle marketing.', resp:['Own paid acquisition channels','Optimize for ROAS and growth','Report on KPIs weekly'], req:['5+ years digital marketing','Hands-on with Meta/Google Ads','Analytical mindset'] }),
    J({ id:'ae4', title:'Sales Executive', co:'e& (Etisalat)', country:'UAE', city:'Abu Dhabi', type:'Full-time', remote:'On-site', salary:'AED 8,000–12,000 + comm', posted:'3d', cat:'Sales', tags:['B2B','CRM','Telecom'],
      about:'Sell enterprise connectivity and cloud solutions to UAE businesses.', resp:['Manage a B2B sales pipeline','Hit monthly quota','Maintain CRM hygiene'], req:['2+ years B2B sales','UAE market knowledge','Excellent communication'] }),
    J({ id:'ae5', title:'Cabin Crew', co:'Emirates', country:'UAE', city:'Dubai', type:'Full-time', remote:'On-site', salary:'AED 10,000+ tax-free', posted:'6h', cat:'Hospitality', tags:['Customer Service','Aviation'],
      about:'Deliver world-class service at 40,000 feet and travel the world.', resp:['Ensure passenger safety & comfort','Deliver premium in-flight service','Represent the brand globally'], req:['Fluent English','Arm reach 212cm on tiptoes','Customer-service mindset'] }),
    J({ id:'ae6', title:'Registered Nurse', co:'Cleveland Clinic Abu Dhabi', country:'UAE', city:'Abu Dhabi', type:'Full-time', remote:'On-site', salary:'AED 12,000–16,000 / mo', posted:'5d', cat:'Healthcare', tags:['BLS','Patient Care'],
      about:'Provide exceptional patient care at a leading specialty hospital.', resp:['Deliver direct patient care','Administer treatment plans','Maintain accurate records'], req:['BSc Nursing','DOH/DHA license (or eligible)','2+ years experience'] }),
    J({ id:'ae7', title:'Data Analyst', co:'Talabat', country:'UAE', city:'Dubai', type:'Full-time', remote:'Hybrid', salary:'AED 16,000–22,000 / mo', posted:'2d', cat:'Data', tags:['SQL','Python','Dashboards'],
      about:'Turn data into decisions for the region’s top food-delivery platform.', resp:['Build dashboards & reports','Run analyses for product teams','Tell stories with data'], req:['2+ years analytics','Strong SQL','Comfort with Python/BI tools'] }),
    J({ id:'ae8', title:'Civil Engineer', co:'ALEC', country:'UAE', city:'Dubai', type:'Full-time', remote:'On-site', salary:'AED 14,000–20,000 / mo', posted:'1w', cat:'Engineering', tags:['AutoCAD','Site','Construction'],
      about:'Deliver landmark construction projects across the UAE.', resp:['Manage site execution','Coordinate with contractors','Ensure quality & safety'], req:['BSc Civil Engineering','4+ years on large projects','Knowledge of UAE codes'] }),
    J({ id:'ae9', title:'HR Officer', co:'Majid Al Futtaim', country:'UAE', city:'Dubai', type:'Full-time', remote:'On-site', salary:'AED 10,000–14,000 / mo', posted:'3d', cat:'Human Resources', tags:['Recruitment','Onboarding'],
      about:'Support people operations for a leading regional retail & leisure group.', resp:['Manage recruitment cycles','Run onboarding','Support employee relations'], req:['3+ years HR','UAE labour law knowledge','Great people skills'] }),

    /* ---------- Pakistan ---------- */
    J({ id:'pk1', title:'Software Engineer', co:'Systems Limited', country:'Pakistan', city:'Lahore', type:'Full-time', remote:'Hybrid', salary:'PKR 200,000–350,000 / mo', posted:'1d', cat:'Engineering', tags:['.NET','React','SQL'],
      about:'Build enterprise software for global clients at Pakistan’s top IT company.', resp:['Develop full-stack features','Write maintainable code','Work in agile teams'], req:['2+ years development','Strong .NET or JavaScript','CS degree preferred'] }),
    J({ id:'pk2', title:'Frontend Developer', co:'Daraz', country:'Pakistan', city:'Karachi', type:'Full-time', remote:'Hybrid', salary:'PKR 180,000–300,000 / mo', posted:'8h', cat:'Engineering', tags:['React','TypeScript','CSS'],
      about:'Craft the shopping experience for millions of customers across South Asia.', resp:['Build responsive UI','Optimize performance','Partner with design'], req:['2+ years frontend','Strong React + TS','Eye for detail'] }),
    J({ id:'pk3', title:'Customer Support Representative', co:'Jazz', country:'Pakistan', city:'Islamabad', type:'Full-time', remote:'On-site', salary:'PKR 60,000–90,000 / mo', posted:'2d', cat:'Customer Service', tags:['Communication','CRM'],
      about:'Be the voice of Pakistan’s largest mobile operator.', resp:['Resolve customer queries','Maintain high CSAT','Log tickets accurately'], req:['Excellent Urdu & English','Customer-first attitude','Shift flexibility'] }),
    J({ id:'pk4', title:'Accountant', co:'Engro', country:'Pakistan', city:'Karachi', type:'Full-time', remote:'On-site', salary:'PKR 120,000–180,000 / mo', posted:'4d', cat:'Finance', tags:['Accounting','Tax','ERP'],
      about:'Manage accounting operations for one of Pakistan’s largest conglomerates.', resp:['Maintain ledgers','Support reporting & tax','Assist with audits'], req:['B.Com / ACCA (part-qualified)','2+ years experience','ERP familiarity'] }),
    J({ id:'pk5', title:'Digital Marketing Executive', co:'Bazaar', country:'Pakistan', city:'Karachi', type:'Full-time', remote:'Hybrid', salary:'PKR 90,000–140,000 / mo', posted:'1d', cat:'Marketing', tags:['Meta Ads','SEO','Content'],
      about:'Grow a fast-scaling Pakistani tech startup through performance marketing.', resp:['Run social & search campaigns','Create content','Track funnel metrics'], req:['1+ years digital marketing','Hands-on with Meta Ads','Creative + analytical'] }),
    J({ id:'pk6', title:'QA Automation Engineer', co:'NetSol Technologies', country:'Pakistan', city:'Lahore', type:'Full-time', remote:'Hybrid', salary:'PKR 150,000–250,000 / mo', posted:'5d', cat:'Engineering', tags:['Selenium','Automation','Testing'],
      about:'Ensure quality for enterprise finance software used worldwide.', resp:['Build automated test suites','Find & track defects','Improve QA processes'], req:['2+ years QA','Selenium / automation','Strong attention to detail'] }),
    J({ id:'pk7', title:'Sales Officer', co:'HBL', country:'Pakistan', city:'Multiple cities', type:'Full-time', remote:'On-site', salary:'PKR 50,000–80,000 + incentives', posted:'3d', cat:'Sales', tags:['Banking','Targets'],
      about:'Drive deposits and product sales for Pakistan’s largest bank.', resp:['Acquire new customers','Meet sales targets','Build client relationships'], req:['Bachelor’s degree','Sales drive','Good communication'] }),
    J({ id:'pk8', title:'Graphic Designer', co:'Easypaisa (Telenor Microfinance Bank)', country:'Pakistan', city:'Islamabad', type:'Full-time', remote:'Hybrid', salary:'PKR 100,000–160,000 / mo', posted:'2d', cat:'Design', tags:['Figma','Adobe','Branding'],
      about:'Design delightful experiences for Pakistan’s leading digital wallet.', resp:['Create marketing & product assets','Maintain brand consistency','Collaborate with marketing'], req:['2+ years design','Strong portfolio','Figma + Adobe Suite'] }),
    J({ id:'pk9', title:'Project Manager', co:'Careem Pakistan', country:'Pakistan', city:'Lahore', type:'Full-time', remote:'Hybrid', salary:'PKR 250,000–400,000 / mo', posted:'6d', cat:'Product', tags:['Agile','Stakeholders'],
      about:'Lead cross-functional delivery for the region’s super app.', resp:['Plan and run projects','Coordinate stakeholders','Remove blockers'], req:['4+ years PM','Agile experience','Strong communication'] }),
  ];

  // external "view original" search link (real job-search pages)
  function sourceUrl(j){
    const role = encodeURIComponent(j.title);
    return j.country === 'UAE'
      ? `https://www.bayt.com/en/uae/jobs/?text=${role}`
      : `https://www.rozee.pk/job/jsearch/q/${encodeURIComponent(j.title + ' ' + j.city)}`;
  }
  const sourceName = j => j.country === 'UAE' ? 'Bayt' : 'Rozee.pk';

  /* ---------------- chips ---------------- */
  const COUNTRIES = ['UAE', 'Pakistan'];
  const CATS = [...new Set(JOBS.map(j => j.cat))];
  const TYPES = ['Full-time', 'Part-time', 'Contract'];
  function chipList(){
    return [
      ...COUNTRIES.map(c => ({ label: c, kind: 'country', flag: flag(c) })),
      ...TYPES.filter(t => JOBS.some(j => j.type === t)).map(t => ({ label: t, kind: 'type' })),
      ...CATS.map(c => ({ label: c, kind: 'cat' })),
    ];
  }
  let CHIPS = chipList();

  /* ---------------- state ---------------- */
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('andro_saved')) || {}; } catch {}
  let applied = {}; try { applied = JSON.parse(localStorage.getItem('andro_applied')) || {}; } catch {}
  const persist = () => { localStorage.setItem('andro_saved', JSON.stringify(saved)); localStorage.setItem('andro_applied', JSON.stringify(applied)); };
  const state = { q: '', loc: '', filters: new Set(), savedOnly: false, selected: JOBS[0].id };

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------------- filter ---------------- */
  function results(){
    const q = state.q.toLowerCase().trim(), loc = state.loc.toLowerCase().trim();
    return JOBS.filter(j => {
      if (state.savedOnly && !saved[j.id]) return false;
      if (q && !(`${j.title} ${j.co} ${j.tags.join(' ')} ${j.cat}`.toLowerCase().includes(q))) return false;
      if (loc && !(`${j.city} ${j.country}`.toLowerCase().includes(loc))) return false;
      const countryFilters = [...state.filters].filter(f => COUNTRIES.includes(f));
      if (countryFilters.length && !countryFilters.includes(j.country)) return false;
      for (const f of state.filters) {
        if (COUNTRIES.includes(f)) continue;
        const c = CHIPS.find(x => x.label === f); if (!c) continue;
        if (c.kind === 'type' && j.type !== f) return false;
        if (c.kind === 'cat' && j.cat !== f) return false;
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  function renderChips(){ $('#chips').innerHTML = CHIPS.map(c => `<button class="chip ${c.kind} ${state.filters.has(c.label)?'on':''}" data-filter="${esc(c.label)}">${c.flag?c.flag+' ':''}${esc(c.label)}</button>`).join(''); }
  const savedCount = () => Object.values(saved).filter(Boolean).length;

  function render(){
    const list = results();
    $('#savedCount').textContent = savedCount();
    $('#savedToggle').classList.toggle('active', state.savedOnly);
    $('#resultCount').textContent = `${list.length} job${list.length === 1 ? '' : 's'}`;
    if (!list.length) { $('#list').innerHTML = `<div class="no-results">No jobs match your search.<br>Try clearing filters.</div>`; }
    else { if (!list.find(j => j.id === state.selected)) state.selected = list[0].id; $('#list').innerHTML = list.map((j, i) => cardHTML(j, i)).join(''); }
    renderDetail();
  }
  function cardHTML(j, i){
    return `<article class="jcard ${j.id===state.selected?'active':''}" data-job="${j.id}" style="animation-delay:${Math.min(i*35,300)}ms">
      <button class="save ${saved[j.id]?'on':''}" data-save="${j.id}" title="Save">${svg(ic.bookmark,20)}</button>
      <div class="jcard-top">${tile(j.co)}
        <div class="jc-main"><h3>${esc(j.title)}</h3><div class="co">${esc(j.co)}<span class="flag">${flag(j.country)}</span></div></div></div>
      <div class="meta">
        <span>${svg(ic.pin,14)} ${esc(j.city)}, ${esc(j.country)}</span>
        <span>${svg(ic.cash,14)} ${esc(j.salary)}</span>
      </div>
      <div class="tags"><span class="tag muted">${esc(j.type)}</span><span class="tag muted">${esc(j.remote)}</span>${applied[j.id]?'<span class="tag ok">Applied ✓</span>':'<span class="tag">⚡ Easy apply</span>'}</div>
      <span class="posted">${esc(j.posted)} ago</span>
    </article>`;
  }
  function renderDetail(){
    const det = $('#detail');
    const j = JOBS.find(x => x.id === state.selected);
    if (!j || !results().length) { det.classList.remove('show'); det.innerHTML = `<div class="det-empty"><div class="big">🔍</div><b>Select a job</b><p>Pick a role to see details and apply.</p></div>`; return; }
    det.innerHTML = `<div class="detail-card">
      <div class="det-hero">
        <button class="det-back" data-back>${svg(ic.back,18)} Back</button>
        ${tile(j.co)}
        <h1>${esc(j.title)}</h1>
        <div class="co"><b>${esc(j.co)}</b> · ${esc(j.city)}, ${esc(j.country)} ${flag(j.country)}</div>
        <div class="det-actions">
          <button class="btn btn-primary apply" data-apply="${j.id}" ${applied[j.id]?'disabled':''}>${applied[j.id]?'Applied ✓':`${svg(ic.bolt,16)} Easy apply`}</button>
          <button class="btn btn-ghost det-save ${saved[j.id]?'on':''}" data-save="${j.id}" title="Save">${svg(ic.bookmark,20)}</button>
          <a class="det-link" href="${sourceUrl(j)}" target="_blank" rel="noopener">View on ${sourceName(j)} ${svg(ic.ext,15)}</a>
        </div>
      </div>
      <div class="det-meta">
        <div class="m"><small>Salary</small><b>${esc(j.salary)}</b></div>
        <div class="m"><small>Type</small><b>${esc(j.type)}</b></div>
        <div class="m"><small>Workplace</small><b>${esc(j.remote)}</b></div>
        <div class="m"><small>Posted</small><b>${esc(j.posted)} ago</b></div>
      </div>
      <div class="det-body">
        <h4>About the role</h4><p>${esc(j.about)}</p>
        <h4>What you'll do</h4><ul>${j.resp.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>
        <h4>What we're looking for</h4><ul>${j.req.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>
        <h4>Skills</h4><div class="det-tags">${j.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </div>`;
    if (window.matchMedia('(max-width:900px)').matches) det.classList.add('show');
  }
  const select = id => { state.selected = id; render(); };

  /* ---------------- easy apply ---------------- */
  function openApply(j){
    const m = $('#modal');
    m.innerHTML = `<div class="modal">
      <div class="modal-head"><div><h3>Easy apply — ${esc(j.title)}</h3><p>${esc(j.co)} · ${esc(j.city)}, ${esc(j.country)}</p></div><button class="modal-x" data-close>${svg(ic.x,22)}</button></div>
      <form id="applyForm" class="modal-body" data-id="${j.id}">
        <div class="easy-note">${svg(ic.bolt,15)} One-tap apply — your details go straight to the recruiter.</div>
        <div class="frow"><label>Full name</label><input id="ap-name" autocomplete="name" placeholder="Your name" required></div>
        <div class="frow two">
          <div><label>Email</label><input id="ap-email" type="email" autocomplete="email" placeholder="you@email.com" required></div>
          <div><label>Phone</label><input id="ap-phone" type="tel" autocomplete="tel" placeholder="+971 / +92 …" required></div>
        </div>
        <div class="frow"><label>CV / LinkedIn link (optional)</label><input id="ap-link" placeholder="https://…"></div>
        <div class="err" id="ap-err"></div>
        <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary" id="ap-submit">${svg(ic.bolt,16)} Submit application</button></div>
      </form></div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); setTimeout(() => $('#ap-name') && $('#ap-name').focus(), 60);
  }
  function closeModal(){ const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); m.innerHTML = ''; }
  function successScreen(j){
    $('#modal').innerHTML = `<div class="modal"><div class="applied-ok"><div class="check">${svg(ic.check,36)}</div>
      <h3>Application sent!</h3><p>Your application for <b>${esc(j.title)}</b> at <b>${esc(j.co)}</b> has been submitted. Good luck! 🤞</p>
      <div class="modal-foot" style="justify-content:center;padding-top:18px"><button class="btn btn-primary" data-close>Done</button></div></div></div>`;
  }

  async function submitApply(e){
    e.preventDefault();
    const id = e.target.dataset.id, j = JOBS.find(x => x.id === id);
    const name = $('#ap-name').value.trim(), email = $('#ap-email').value.trim(), phone = $('#ap-phone').value.trim(), link = $('#ap-link').value.trim();
    const err = $('#ap-err');
    if (!name) { err.textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email.'; return; }
    if (phone.replace(/[^0-9]/g, '').length < 7) { err.textContent = 'Please enter a valid phone number.'; return; }
    const btn = $('#ap-submit'); btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + APPLY_EMAIL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ Name: name, Email: email, Phone: phone, Link: link || '—', Job: j.title, Company: j.co, Location: `${j.city}, ${j.country}`, _subject: `New application: ${j.title} @ ${j.co}`, _template: 'table', _captcha: 'false' })
      });
      if (!res.ok) throw new Error('send failed');
      applied[id] = true; persist(); successScreen(j); render();
    } catch (ex) {
      err.textContent = 'Could not send right now. Please try again, or email ' + APPLY_EMAIL + '.';
      btn.disabled = false; btn.innerHTML = svg(ic.bolt,16) + ' Submit application';
    }
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', e => {
    const save = e.target.closest('[data-save]'); if (save) { e.stopPropagation(); const id = save.dataset.save; saved[id] = !saved[id]; persist(); render(); toast(saved[id] ? 'Saved' : 'Removed from saved'); return; }
    const apply = e.target.closest('[data-apply]'); if (apply) { const j = JOBS.find(x => x.id === apply.dataset.apply); if (j) openApply(j); return; }
    const chip = e.target.closest('[data-filter]'); if (chip) { const f = chip.dataset.filter; state.filters.has(f) ? state.filters.delete(f) : state.filters.add(f); renderChips(); render(); return; }
    const card = e.target.closest('[data-job]'); if (card) { select(card.dataset.job); return; }
    if (e.target.closest('[data-back]')) { $('#detail').classList.remove('show'); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.id === 'modal') { closeModal(); return; }
    if (e.target.closest('#savedToggle')) { state.savedOnly = !state.savedOnly; render(); }
    if (e.target.closest('#searchBtn')) { state.q = $('#q').value; state.loc = $('#loc').value; render(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'applyForm') submitApply(e); });
  const onType = () => { state.q = $('#q').value; state.loc = $('#loc').value; render(); };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  $('#q').addEventListener('input', debounce(onType, 150));
  $('#loc').addEventListener('input', debounce(onType, 150));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------------- boot ---------------- */
  renderChips();
  render();
})();
