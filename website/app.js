/* =====================================================================
   Rolo — a simple, fluid job board (vanilla JS, localStorage)
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const hue = s => { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const initials = n => (n || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const ic = {
    pin:'<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
    remote:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  };
  const svg = (p, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const tile = (co) => `<span class="logo-tile" style="--h:${hue(co)}">${esc(initials(co))}</span>`;

  /* ---------------- data ---------------- */
  const JOBS = [
    { id:'1', title:'Senior Frontend Engineer', co:'Northwind', loc:'San Francisco, CA', type:'Full-time', remote:'Hybrid', salary:'$160k–$200k', posted:'2d', cat:'Engineering',
      tags:['React','TypeScript','Design Systems'],
      about:'We build tools that help teams ship faster. Join a small, senior frontend team that owns the product end-to-end.',
      resp:['Lead features across our web app from idea to ship','Raise the bar on performance, accessibility and craft','Mentor engineers and shape our design system'],
      req:['5+ years building production web apps','Deep React + TypeScript experience','An eye for detail and smooth UX'] },
    { id:'2', title:'Product Designer', co:'Lumen', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$120k–$155k', posted:'4h', cat:'Design',
      tags:['Figma','Prototyping','0→1'],
      about:'Lumen is reimagining personal finance. We need a designer who can move from messy problem to polished product.',
      resp:['Own design for a core product area','Run research and turn insight into flows','Prototype, test, iterate quickly'],
      req:['4+ years in product design','Strong portfolio of shipped work','Comfort with ambiguity'] },
    { id:'3', title:'Data Scientist', co:'Atlas', loc:'Austin, TX', type:'Full-time', remote:'On-site', salary:'$140k–$180k', posted:'1w', cat:'Data',
      tags:['Python','ML','SQL'],
      about:'Use data to drive decisions across the company. You will work close to product and leadership.',
      resp:['Build models that ship to production','Design experiments and read results honestly','Communicate findings simply'],
      req:['3+ years applied DS/ML','Fluent in Python + SQL','Clear communicator'] },
    { id:'4', title:'Backend Engineer (Go)', co:'Vela', loc:'New York, NY', type:'Full-time', remote:'Hybrid', salary:'$150k–$190k', posted:'3d', cat:'Engineering',
      tags:['Go','Postgres','Distributed Systems'],
      about:'Scale the systems behind a fast-growing marketplace. Reliability and clean APIs matter here.',
      resp:['Design and own backend services','Improve reliability and latency','Collaborate on API design'],
      req:['4+ years backend experience','Strong with Go or a similar language','Solid data modeling'] },
    { id:'5', title:'Marketing Manager', co:'Brightside', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$95k–$120k', posted:'5d', cat:'Marketing',
      tags:['Growth','Content','SEO'],
      about:'Own the story. Grow our audience through content, lifecycle and a bit of everything.',
      resp:['Plan and run marketing campaigns','Own content + SEO strategy','Report on what works'],
      req:['4+ years in B2B/B2C marketing','Great writer','Data-driven'] },
    { id:'6', title:'iOS Engineer', co:'Cadence', loc:'Seattle, WA', type:'Full-time', remote:'Hybrid', salary:'$145k–$185k', posted:'6h', cat:'Engineering',
      tags:['Swift','SwiftUI'],
      about:'Craft a beautiful native app used by millions. We sweat the details.',
      resp:['Build delightful iOS features','Improve app performance','Partner closely with design'],
      req:['3+ years iOS','Strong Swift / SwiftUI','Care about polish'] },
    { id:'7', title:'UX Researcher', co:'Northwind', loc:'San Francisco, CA', type:'Contract', remote:'Hybrid', salary:'$70–$95 /hr', posted:'1d', cat:'Design',
      tags:['Research','Interviews'],
      about:'Help teams build the right thing through rigorous, fast research.',
      resp:['Plan and run studies','Synthesize insights into action','Evangelize the user'],
      req:['3+ years UX research','Mixed methods','Storyteller'] },
    { id:'8', title:'DevOps Engineer', co:'Vela', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$150k–$195k', posted:'2w', cat:'Engineering',
      tags:['Kubernetes','AWS','Terraform'],
      about:'Own the platform that lets engineers ship safely and fast.',
      resp:['Run and improve our cloud infra','Automate everything','Champion reliability'],
      req:['4+ years DevOps/SRE','K8s + AWS','IaC with Terraform'] },
    { id:'9', title:'Customer Success Lead', co:'Lumen', loc:'Chicago, IL', type:'Full-time', remote:'On-site', salary:'$90k–$115k', posted:'4d', cat:'Sales',
      tags:['SaaS','Onboarding'],
      about:'Make customers wildly successful and turn them into champions.',
      resp:['Own key accounts end-to-end','Drive renewals and expansion','Be the voice of the customer'],
      req:['4+ years CS in SaaS','Empathetic + organized','Comfortable with data'] },
    { id:'10', title:'Junior Frontend Developer', co:'Brightside', loc:'Remote', type:'Full-time', remote:'Remote', salary:'$75k–$95k', posted:'8h', cat:'Engineering',
      tags:['JavaScript','CSS','React'],
      about:'Start your career on a supportive team that cares about mentorship.',
      resp:['Build UI features with guidance','Learn our stack and ship weekly','Write clean, tested code'],
      req:['Some experience or strong projects','Solid JS + CSS fundamentals','Eager to learn'] },
    { id:'11', title:'Product Manager', co:'Cadence', loc:'Seattle, WA', type:'Full-time', remote:'Hybrid', salary:'$150k–$185k', posted:'3d', cat:'Product',
      tags:['Strategy','Roadmap'],
      about:'Own a product line and the outcomes it drives.',
      resp:['Set strategy and roadmap','Ship with design + eng','Measure impact'],
      req:['4+ years PM','Shipped meaningful products','Strong communicator'] },
    { id:'12', title:'Account Executive', co:'Atlas', loc:'New York, NY', type:'Full-time', remote:'On-site', salary:'$80k base + comm', posted:'1w', cat:'Sales',
      tags:['B2B','Closing'],
      about:'Sell a product people actually love. Warm pipeline, strong support.',
      resp:['Run full sales cycle','Hit and beat quota','Partner with CS on handoff'],
      req:['2+ years closing B2B','Track record of quota','Hungry'] },
    { id:'13', title:'Brand Designer', co:'Brightside', loc:'Remote', type:'Part-time', remote:'Remote', salary:'$55–$80 /hr', posted:'2d', cat:'Design',
      tags:['Branding','Illustration'],
      about:'Shape how the world sees us — identity, web, and campaigns.',
      resp:['Evolve our brand system','Design across web + social','Keep quality high'],
      req:['3+ years brand/visual design','Beautiful portfolio','Self-directed'] },
    { id:'14', title:'Machine Learning Engineer', co:'Lumen', loc:'San Francisco, CA', type:'Full-time', remote:'Hybrid', salary:'$170k–$220k', posted:'5h', cat:'Data',
      tags:['PyTorch','MLOps','LLMs'],
      about:'Take models from notebook to production at scale.',
      resp:['Build + deploy ML systems','Own data and eval pipelines','Ship responsibly'],
      req:['4+ years ML engineering','Strong Python + PyTorch','Production mindset'] },
  ];

  const FILTERS = ['Remote', 'Full-time', 'Part-time', 'Contract', 'Engineering', 'Design', 'Data', 'Product', 'Marketing', 'Sales'];

  /* ---------------- state ---------------- */
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('rolo_saved')) || {}; } catch {}
  let applied = {}; try { applied = JSON.parse(localStorage.getItem('rolo_applied')) || {}; } catch {}
  const persist = () => { localStorage.setItem('rolo_saved', JSON.stringify(saved)); localStorage.setItem('rolo_applied', JSON.stringify(applied)); };

  const state = { q: '', loc: '', filters: new Set(), savedOnly: false, selected: JOBS[0].id };

  /* ---------------- toast ---------------- */
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2300); }

  /* ---------------- filtering ---------------- */
  function results() {
    const q = state.q.toLowerCase().trim(), loc = state.loc.toLowerCase().trim();
    return JOBS.filter(j => {
      if (state.savedOnly && !saved[j.id]) return false;
      if (q && !(`${j.title} ${j.co} ${j.tags.join(' ')} ${j.cat}`.toLowerCase().includes(q))) return false;
      if (loc && !(`${j.loc} ${j.remote}`.toLowerCase().includes(loc))) return false;
      for (const f of state.filters) {
        if (f === 'Remote') { if (j.remote !== 'Remote') return false; }
        else if (['Full-time','Part-time','Contract'].includes(f)) { if (j.type !== f) return false; }
        else if (j.cat !== f) return false;
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  function renderChips() {
    $('#chips').innerHTML = FILTERS.map(f => `<button class="chip ${state.filters.has(f)?'on':''}" data-filter="${f}">${f}</button>`).join('');
  }
  function savedCount() { return Object.values(saved).filter(Boolean).length; }

  function render() {
    const list = results();
    $('#savedCount').textContent = savedCount();
    $('#savedToggle').classList.toggle('active', state.savedOnly);
    $('#resultCount').textContent = `${list.length} job${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
      $('#list').innerHTML = `<div class="no-results">No jobs match your search.<br>Try clearing filters.</div>`;
    } else {
      if (!list.find(j => j.id === state.selected)) state.selected = list[0].id;
      $('#list').innerHTML = list.map((j, i) => cardHTML(j, i)).join('');
    }
    renderDetail();
  }

  function cardHTML(j, i) {
    return `<article class="jcard ${j.id===state.selected?'active':''}" data-job="${j.id}" style="animation-delay:${Math.min(i*40,320)}ms">
      <button class="save ${saved[j.id]?'on':''}" data-save="${j.id}" title="Save">${svg(ic.bookmark,20)}</button>
      <div class="jcard-top">${tile(j.co)}
        <div class="jc-main"><h3>${esc(j.title)}</h3><div class="co">${esc(j.co)}</div></div>
      </div>
      <div class="meta">
        <span>${svg(j.remote==='Remote'?ic.remote:ic.pin,14)} ${esc(j.loc)}</span>
        <span>${svg(ic.cash,14)} ${esc(j.salary)}</span>
      </div>
      <div class="tags"><span class="tag muted">${esc(j.type)}</span><span class="tag muted">${esc(j.remote)}</span>${applied[j.id]?'<span class="tag">Applied ✓</span>':''}</div>
      <span class="posted">${esc(j.posted)} ago</span>
    </article>`;
  }

  function renderDetail() {
    const det = $('#detail');
    const j = JOBS.find(x => x.id === state.selected);
    if (!j || !results().length) {
      det.classList.remove('show');
      det.innerHTML = `<div class="det-empty"><div class="big">🔍</div><b>Select a job</b><p>Pick a role on the left to see the details.</p></div>`;
      return;
    }
    det.innerHTML = `<div class="detail-card">
      <div class="det-hero">
        <button class="det-back" data-back>${svg(ic.back,18)} Back</button>
        ${tile(j.co)}
        <h1>${esc(j.title)}</h1>
        <div class="co"><b>${esc(j.co)}</b> · ${esc(j.loc)}</div>
        <div class="det-actions">
          <button class="btn btn-primary apply" data-apply="${j.id}" ${applied[j.id]?'disabled':''}>${applied[j.id]?'Applied ✓':'Apply now'}</button>
          <button class="btn btn-ghost det-save ${saved[j.id]?'on':''}" data-save="${j.id}" title="Save">${svg(ic.bookmark,20)}</button>
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

  function select(id) { state.selected = id; render(); }

  /* ---------------- apply modal ---------------- */
  function openApply(id) {
    const j = JOBS.find(x => x.id === id); if (!j) return;
    const m = $('#modal');
    m.innerHTML = `<div class="modal">
      <div class="modal-head"><div><h3>Apply — ${esc(j.title)}</h3><p>${esc(j.co)} · ${esc(j.loc)}</p></div>
        <button class="modal-x" data-close>${svg(ic.x,22)}</button></div>
      <form id="applyForm" class="modal-body">
        <div class="frow"><label>Full name</label><input id="ap-name" autocomplete="name" required></div>
        <div class="frow"><label>Email</label><input id="ap-email" type="email" autocomplete="email" required></div>
        <div class="frow"><label>Link (LinkedIn, portfolio, or résumé)</label><input id="ap-link" placeholder="https://…"></div>
        <div class="frow"><label>Why you? (optional)</label><textarea id="ap-note" placeholder="A short note to the hiring team…"></textarea></div>
        <div class="err" id="ap-err"></div>
        <div class="modal-foot"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">Submit application</button></div>
      </form>
    </div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#ap-name') && $('#ap-name').focus(), 60);
  }
  function closeModal() { const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); m.innerHTML = ''; }
  function showApplied(id) {
    const j = JOBS.find(x => x.id === id);
    $('#modal').innerHTML = `<div class="modal"><div class="applied-ok">
      <div class="check">${svg(ic.check,36)}</div>
      <h3>Application sent!</h3>
      <p>Your application for <b>${esc(j.title)}</b> at <b>${esc(j.co)}</b> is in. We'll email you if there's a match.</p>
      <div class="modal-foot" style="justify-content:center;padding-top:18px"><button class="btn btn-primary" data-close>Done</button></div>
    </div></div>`;
  }

  /* ---------------- events ---------------- */
  $('#chips') && renderChips();

  document.addEventListener('click', e => {
    const save = e.target.closest('[data-save]');
    if (save) { e.stopPropagation(); const id = save.dataset.save; saved[id] = !saved[id]; persist(); render(); toast(saved[id] ? 'Saved' : 'Removed from saved'); return; }
    const apply = e.target.closest('[data-apply]'); if (apply) { openApply(apply.dataset.apply); return; }
    const chip = e.target.closest('[data-filter]'); if (chip) { const f = chip.dataset.filter; state.filters.has(f) ? state.filters.delete(f) : state.filters.add(f); renderChips(); render(); return; }
    const card = e.target.closest('[data-job]'); if (card) { select(card.dataset.job); return; }
    if (e.target.closest('[data-back]')) { $('#detail').classList.remove('show'); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.id === 'modal') closeModal();
    if (e.target.closest('#savedToggle')) { state.savedOnly = !state.savedOnly; render(); }
    if (e.target.closest('#searchBtn')) { state.q = $('#q').value; state.loc = $('#loc').value; render(); }
  });

  document.addEventListener('submit', e => {
    if (e.target.id !== 'applyForm') return;
    e.preventDefault();
    const name = $('#ap-name').value.trim(), email = $('#ap-email').value.trim();
    if (!name) { $('#ap-err').textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#ap-err').textContent = 'Please enter a valid email.'; return; }
    const id = JOBS.find(j => j.title && $('.modal-head h3').textContent.includes(j.title))?.id || state.selected;
    applied[id] = true; persist();
    showApplied(id); render();
  });

  // live search as you type
  const onType = () => { state.q = $('#q').value; state.loc = $('#loc').value; render(); };
  $('#q').addEventListener('input', debounce(onType, 160));
  $('#loc').addEventListener('input', debounce(onType, 160));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ---------------- boot ---------------- */
  render();
})();
