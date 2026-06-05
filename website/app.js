/* =====================================================================
   InLink — a LinkedIn-style professional network (client-side demo)
   Everything persists in localStorage. Single-page app, vanilla JS.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const KEY = 'inlink_v1';

  /* ---------------- icons ---------------- */
  const I = {
    home:'<path d="M23 9l-11-7L1 9v13h7v-7h8v7h7z"/>',
    network:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/><circle cx="18" cy="8" r="3"/><path d="M22 21v-1a4 4 0 0 0-3-3.8"/>',
    jobs:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    like:'<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    comment:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    repost:'<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    send:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
    photo:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    video:'<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 8l-6 4 6 4z"/>',
    event:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    article:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x:'<path d="M18 6L6 18M6 6l12 12"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    dots:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    people:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/>',
  };
  const svg = (p, w = 24) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const av = (name, hue, cls = '') => `<span class="av ${cls}" style="--h:${hue}">${esc(initials(name))}</span>`;
  const initials = n => (n || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hueOf = s => { let h = 0; for (const c of (s||'')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const timeAgo = t => { const d = (Date.now() - t) / 1000; if (d < 60) return 'now'; if (d < 3600) return Math.floor(d/60)+'m'; if (d < 86400) return Math.floor(d/3600)+'h'; return Math.floor(d/86400)+'d'; };

  /* ---------------- state ---------------- */
  let S;
  function seed() {
    return {
      user: { name: 'Alex Carter', headline: 'Product Designer · Building delightful experiences', location: 'San Francisco, CA', about: 'Product designer with 6+ years crafting intuitive, human-centered software. I care about clarity, craft, and shipping.', connections: 312 },
      posts: [
        { id: id(), author: 'Priya Nair', head: 'Engineering Manager at Northwind', hue: hueOf('Priya Nair'), time: Date.now()-3600e3*3, text: "We just shipped a feature our users have been asking for over a year. Proud of the team for sticking with it through the hard parts. Persistence compounds. 🚀", likes: 248, liked: false, comments: [{name:'Marcus Lee', text:'Congrats! Huge milestone 🎉'}], reposts: 18 },
        { id: id(), author: 'Daniel Wu', head: 'Founder & CEO at Lumen', hue: hueOf('Daniel Wu'), time: Date.now()-3600e3*9, text: "Hiring is the highest-leverage thing a founder does. One great hire changes the trajectory of the whole company. Always be recruiting.", likes: 531, liked: false, comments: [], reposts: 42 },
        { id: id(), author: 'Sofia Romano', head: 'Data Scientist · Ex-Atlas', hue: hueOf('Sofia Romano'), time: Date.now()-3600e3*26, text: "Reminder: a simple model you understand beats a complex one you don't. Interpretability is a feature, not a luxury.", likes: 176, liked: true, comments: [{name:'Priya Nair', text:'So true. Ship the boring model first.'}], reposts: 11 },
      ],
      people: [
        { id: id(), name: 'Marcus Lee', head: 'Frontend Engineer at Vela', status: 'none', mutual: 12 },
        { id: id(), name: 'Hannah Kim', head: 'UX Researcher at Northwind', status: 'none', mutual: 8 },
        { id: id(), name: 'Tom Becker', head: 'Recruiter · We are hiring!', status: 'none', mutual: 21 },
        { id: id(), name: 'Aisha Khan', head: 'Product Manager at Lumen', status: 'none', mutual: 5 },
        { id: id(), name: 'Diego Santos', head: 'iOS Developer · Swift', status: 'none', mutual: 17 },
        { id: id(), name: 'Emma Wright', head: 'Brand Designer · Freelance', status: 'none', mutual: 3 },
      ],
      jobs: [
        { id: id(), title: 'Senior Product Designer', company: 'Northwind', loc: 'San Francisco, CA · Hybrid', hue: hueOf('Northwind'), saved: false, applied: false, posted: '2d', meta: 'Actively reviewing applicants' },
        { id: id(), title: 'UX Designer', company: 'Lumen', loc: 'Remote', hue: hueOf('Lumen'), saved: false, applied: false, posted: '4h', meta: 'Be an early applicant' },
        { id: id(), title: 'Design Lead', company: 'Vela', loc: 'New York, NY · On-site', hue: hueOf('Vela'), saved: false, applied: false, posted: '1w', meta: '50+ applicants' },
        { id: id(), title: 'Interaction Designer', company: 'Atlas', loc: 'Austin, TX · Hybrid', hue: hueOf('Atlas'), saved: false, applied: false, posted: '3d', meta: 'Actively reviewing applicants' },
      ],
      threads: [
        { id: id(), name: 'Priya Nair', head: 'Engineering Manager at Northwind', hue: hueOf('Priya Nair'), messages: [{ from:'them', text:'Hey! Loved your latest post on design systems.', t: Date.now()-3600e3*5 }] },
        { id: id(), name: 'Tom Becker', head: 'Recruiter', hue: hueOf('Tom Becker'), messages: [{ from:'them', text:'Hi Alex — are you open to new design roles right now?', t: Date.now()-3600e3*20 }] },
      ],
      notifs: [
        { id: id(), name: 'Sofia Romano', text: '<b>Sofia Romano</b> liked your comment.', t: Date.now()-3600e3*2, read: false },
        { id: id(), name: 'Lumen', text: '<b>Lumen</b> posted a job that matches your profile: UX Designer.', t: Date.now()-3600e3*8, read: false },
        { id: id(), name: 'Marcus Lee', text: '<b>Marcus Lee</b> viewed your profile.', t: Date.now()-3600e3*30, read: true },
      ],
      route: 'home',
    };
  }
  function id() { return Math.random().toString(36).slice(2, 10); }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch {} if (!S || !S.user) S = seed(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

  /* ---------------- toast ---------------- */
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------------- top bar ---------------- */
  const NAV = [
    { id: 'home', label: 'Home', icon: I.home },
    { id: 'network', label: 'Network', icon: I.network },
    { id: 'jobs', label: 'Jobs', icon: I.jobs },
    { id: 'messaging', label: 'Messaging', icon: I.msg },
    { id: 'notifications', label: 'Notifications', icon: I.bell },
  ];
  function renderTop() {
    const unread = S.notifs.filter(n => !n.read).length;
    const msgUnread = 0;
    $('#topbar').innerHTML = `<div class="tb-inner">
      <div class="logo" title="InLink">in</div>
      <label class="search">${svg(I.search,18)}<input id="searchBox" placeholder="Search" /></label>
      <nav class="nav">
        ${NAV.map(n => `<button class="nav-item ${S.route===n.id?'active':''}" data-go="${n.id}">
          ${svg(n.icon,22)}
          ${n.id==='notifications' && unread ? `<span class="badge">${unread}</span>` : ''}
          <span>${n.label}</span></button>`).join('')}
        <button class="nav-item nav-me ${S.route==='profile'?'active':''}" data-go="profile">
          ${av(S.user.name, hueOf(S.user.name))}<span>Me ▾</span></button>
      </nav>
    </div>`;
  }

  /* ---------------- router ---------------- */
  function go(route, params) { S.route = route; S.params = params || {}; save(); render(); window.scrollTo(0,0); }
  function render() {
    renderTop();
    const app = $('#app');
    const map = { home: pageHome, network: pageNetwork, jobs: pageJobs, messaging: pageMessaging, notifications: pageNotifs, profile: pageProfile };
    (map[S.route] || pageHome)(app);
  }

  /* ---------------- left + right rails ---------------- */
  function leftRail() {
    const u = S.user;
    return `<aside class="col-left">
      <div class="card pcard">
        <div class="banner"></div>
        <div class="pc-body">
          ${av(u.name, hueOf(u.name))}
          <h2>${esc(u.name)}</h2>
          <div class="head">${esc(u.headline)}</div>
        </div>
        <div class="stat"><span class="k">Connections</span><b>${u.connections}</b></div>
        <button class="mini-link" data-go="profile">${svg(I.people,18)} View my profile</button>
      </div>
      <div class="card" style="margin-top:8px">
        <button class="mini-link" data-go="jobs">${svg(I.bookmark,18)} My jobs</button>
        <button class="mini-link" data-go="network">${svg(I.network,18)} My network</button>
      </div>
    </aside>`;
  }
  function rightRail() {
    const news = [
      ['Remote work reshapes hiring','3h ago · 4,201 readers'],
      ['Design systems go mainstream','5h ago · 1,884 readers'],
      ['AI skills top 2026 demand','1d ago · 12,003 readers'],
      ['Startups lean into profitability','1d ago · 940 readers'],
    ];
    return `<aside class="col-right">
      <div class="card rail">
        <h3>InLink News</h3>
        <div class="news">${news.map(([t,m]) => `<div class="news-item"><span class="bd"></span><div><b>${t}</b><small>${m}</small></div></div>`).join('')}</div>
      </div>
      <div class="card promo">
        <p>Grow your career faster with Premium.</p>
        <button class="btn btn-outline btn-sm" data-act="premium">Try 1 month free</button>
      </div>
    </aside>`;
  }

  /* ---------------- HOME / FEED ---------------- */
  function pageHome(app) {
    app.className = 'app';
    app.innerHTML = `${leftRail()}
      <section class="col-mid">
        <div class="card">
          <div class="composer">
            ${av(S.user.name, hueOf(S.user.name))}
            <button class="start" data-act="compose">Start a post</button>
          </div>
          <div class="composer-actions">
            <button class="cact photo" data-act="compose">${svg(I.photo,20)} Photo</button>
            <button class="cact video" data-act="compose">${svg(I.video,20)} Video</button>
            <button class="cact event" data-act="compose">${svg(I.event,20)} Event</button>
            <button class="cact article" data-act="compose">${svg(I.article,20)} Article</button>
          </div>
        </div>
        <div class="feed-sep">Recent</div>
        <div id="feed">${S.posts.map(postHTML).join('')}</div>
      </section>
      ${rightRail()}`;
  }
  function postHTML(p) {
    return `<article class="card post" data-post="${p.id}">
      <div class="post-head">
        ${av(p.author, p.hue)}
        <div class="ph-info"><b>${esc(p.author)}</b><small>${esc(p.head)}</small><small>${timeAgo(p.time)} · 🌐</small></div>
        <button class="post-more" data-act="postmore">${svg(I.dots,20)}</button>
      </div>
      <div class="post-body">${esc(p.text)}</div>
      <div class="post-stats">
        <span class="likes">${p.likes ? `<span class="lk">${svg(I.like,10)}</span> ${p.likes}` : ''}</span>
        <span>${p.comments.length ? p.comments.length + ' comments' : ''}${p.reposts ? ' · ' + p.reposts + ' reposts' : ''}</span>
      </div>
      <div class="post-actions">
        <button class="pa ${p.liked?'on':''}" data-act="like">${svg(I.like,20)} Like</button>
        <button class="pa" data-act="comment">${svg(I.comment,20)} Comment</button>
        <button class="pa" data-act="repost">${svg(I.repost,20)} Repost</button>
        <button class="pa" data-act="send">${svg(I.send,20)} Send</button>
      </div>
      <div class="comments" data-comments hidden>
        <div class="cmt-box">${av(S.user.name, hueOf(S.user.name),'')}
          <input placeholder="Add a comment…" data-cinput><button class="btn btn-primary btn-sm" data-act="csend">Post</button></div>
        <div data-clist>${p.comments.map(cmtHTML).join('')}</div>
      </div>
    </article>`;
  }
  function cmtHTML(c) { return `<div class="cmt">${av(c.name, hueOf(c.name))}<div class="bub"><b>${esc(c.name)}</b><p>${esc(c.text)}</p></div></div>`; }
  const findPost = pid => S.posts.find(p => p.id === pid);

  /* ---------------- NETWORK ---------------- */
  function pageNetwork(app) {
    app.className = 'app two';
    app.innerHTML = `${leftRail()}
      <section class="col-mid">
        <div class="card">
          <div class="page-head"><h1>Grow your network</h1><p>People you may know</p></div>
          <div class="people">${S.people.map(personHTML).join('')}</div>
        </div>
      </section>`;
  }
  function personHTML(pr) {
    const btn = pr.status === 'connected'
      ? `<button class="btn btn-ghost btn-sm" data-act="message-person">${svg(I.msg,16)} Message</button>`
      : pr.status === 'pending'
        ? `<button class="btn btn-ghost btn-sm" disabled>Pending</button>`
        : `<button class="btn btn-outline btn-sm" data-act="connect">${svg(I.plus,16)} Connect</button>`;
    return `<div class="person" data-person="${pr.id}">
      <div class="pban"></div>
      ${av(pr.name, hueOf(pr.name))}
      <div class="pn">${esc(pr.name)}</div>
      <div class="ph">${esc(pr.head)}</div>
      <div class="pm">${pr.mutual} mutual connections</div>
      ${btn}
    </div>`;
  }

  /* ---------------- JOBS ---------------- */
  function pageJobs(app) {
    app.className = 'app two';
    app.innerHTML = `${leftRail()}
      <section class="col-mid">
        <div class="card">
          <div class="page-head"><h1>Jobs</h1><p>Recommended for you · based on your profile</p></div>
          ${S.jobs.map(jobHTML).join('')}
        </div>
      </section>`;
  }
  function jobHTML(j) {
    return `<div class="job" data-job="${j.id}">
      ${av(j.company, j.hue, 'sq')}
      <div class="jb">
        <div class="jt">${esc(j.title)}</div>
        <div class="jc">${esc(j.company)}</div>
        <div class="jl">${esc(j.loc)} · ${j.posted} ago</div>
        <div class="jmeta">${esc(j.meta)}</div>
      </div>
      <div class="job-actions">
        <button class="icon-btn" data-act="save" title="Save">${svg(j.saved ? I.check : I.bookmark,20)}</button>
        <button class="btn ${j.applied?'btn-ghost':'btn-primary'} btn-sm" data-act="apply" ${j.applied?'disabled':''}>${j.applied?'Applied':'Apply'}</button>
      </div>
    </div>`;
  }

  /* ---------------- MESSAGING ---------------- */
  function pageMessaging(app) {
    app.className = 'app single';
    const active = S.params.thread || (S.threads[0] && S.threads[0].id);
    const t = S.threads.find(x => x.id === active) || S.threads[0];
    app.innerHTML = `<div class="card" style="overflow:hidden">
      <div class="msg-wrap">
        <div class="threads ${t?'':''}">
          ${S.threads.map(th => `<div class="thread ${th.id===active?'active':''}" data-thread="${th.id}">
            ${av(th.name, th.hue)}
            <div class="tb"><div class="tn">${esc(th.name)}</div><div class="tp">${esc((th.messages.at(-1)||{}).text||'')}</div></div>
          </div>`).join('')}
        </div>
        <div class="chat">${t ? chatHTML(t) : '<div class="empty">No conversations</div>'}</div>
      </div>
    </div>`;
    const body = $('.chat-body'); if (body) body.scrollTop = body.scrollHeight;
  }
  function chatHTML(t) {
    return `<div class="chat-head">${esc(t.name)}<small>${esc(t.head)}</small></div>
      <div class="chat-body">${t.messages.map(m => `<div class="bubble ${m.from}">${esc(m.text)}</div>`).join('')}</div>
      <div class="chat-input"><input placeholder="Write a message…" data-msginput data-thread="${t.id}">
        <button class="btn btn-primary" data-act="sendmsg" data-thread="${t.id}">Send</button></div>`;
  }

  /* ---------------- NOTIFICATIONS ---------------- */
  function pageNotifs(app) {
    app.className = 'app two';
    app.innerHTML = `${leftRail()}
      <section class="col-mid"><div class="card">
        <div class="page-head"><h1>Notifications</h1></div>
        ${S.notifs.length ? S.notifs.map(n => `<div class="notif ${n.read?'':'unread'}" data-notif="${n.id}">
          ${av(n.name, hueOf(n.name))}<p>${n.text}</p><small>${timeAgo(n.t)}</small></div>`).join('') : '<div class="empty">You\'re all caught up</div>'}
      </div></section>`;
    // mark read shortly after viewing
    setTimeout(() => { let ch = false; S.notifs.forEach(n => { if (!n.read) { n.read = true; ch = true; } }); if (ch) { save(); renderTop(); } }, 1200);
  }

  /* ---------------- PROFILE ---------------- */
  function pageProfile(app) {
    const u = S.user;
    app.className = 'app single';
    app.innerHTML = `<div style="max-width:720px;margin:0 auto;width:100%">
      <div class="card">
        <div class="prof-banner"></div>
        <div class="prof-top">
          ${av(u.name, hueOf(u.name))}
          <button class="btn btn-ghost btn-sm prof-edit" data-act="editprofile">${svg(I.edit,16)} Edit</button>
          <h1>${esc(u.name)}</h1>
          <div class="ph">${esc(u.headline)}</div>
          <div class="loc">${esc(u.location)} · <a style="color:var(--blue);font-weight:600">Contact info</a></div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" data-act="compose">Post an update</button>
            <button class="btn btn-outline btn-sm" data-go="network">Grow network</button>
          </div>
        </div>
      </div>
      <div class="card section-card" style="margin-top:8px">
        <div class="sc-h">About</div>
        <div class="about-txt">${esc(u.about)}</div>
      </div>
      <div class="card section-card" style="margin-top:8px">
        <div class="sc-h">Experience</div>
        <div class="exp">${av('Northwind', hueOf('Northwind'),'sq')}<div><div class="et">Product Designer</div><div class="ec">Northwind · Full-time</div><div class="ed">2022 – Present · San Francisco, CA</div></div></div>
        <div class="exp">${av('Atlas', hueOf('Atlas'),'sq')}<div><div class="et">UX Designer</div><div class="ec">Atlas · Full-time</div><div class="ed">2019 – 2022 · Remote</div></div></div>
      </div>
      <div class="card section-card" style="margin-top:8px">
        <div class="sc-h">Activity · ${S.posts.filter(p=>p.author===u.name).length} posts</div>
        <div style="padding:0 4px 8px">${S.posts.filter(p=>p.author===u.name).map(postHTML).join('') || '<div class="empty">You haven\'t posted yet. Share an update!</div>'}</div>
      </div>
    </div>`;
  }

  /* ---------------- modal ---------------- */
  function openModal(html) { const m = $('#modal'); m.innerHTML = `<div class="modal">${html}</div>`; m.classList.add('open'); m.setAttribute('aria-hidden','false'); }
  function closeModal() { const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); m.innerHTML = ''; }

  function composeModal() {
    openModal(`
      <div class="modal-head"><h3>Create a post</h3><button class="modal-x" data-act="closemodal">${svg(I.x,22)}</button></div>
      <div class="modal-body">
        <div class="who">${av(S.user.name, hueOf(S.user.name))}<div><b>${esc(S.user.name)}</b><div style="font-size:12px;color:var(--faint)">Post to anyone</div></div></div>
        <textarea id="composeText" placeholder="What do you want to talk about?"></textarea>
      </div>
      <div class="modal-foot"><button class="btn btn-primary" data-act="publish">Post</button></div>`);
    setTimeout(() => $('#composeText') && $('#composeText').focus(), 50);
  }
  function editProfileModal() {
    const u = S.user;
    openModal(`
      <div class="modal-head"><h3>Edit profile</h3><button class="modal-x" data-act="closemodal">${svg(I.x,22)}</button></div>
      <div class="modal-body">
        <div class="field-row"><label>Name</label><input class="f" id="ep-name" value="${esc(u.name)}"></div>
        <div class="field-row"><label>Headline</label><input class="f" id="ep-head" value="${esc(u.headline)}"></div>
        <div class="field-row"><label>Location</label><input class="f" id="ep-loc" value="${esc(u.location)}"></div>
        <div class="field-row"><label>About</label><textarea id="ep-about">${esc(u.about)}</textarea></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-act="closemodal">Cancel</button><button class="btn btn-primary" data-act="saveprofile">Save</button></div>`);
  }

  /* ---------------- event delegation ---------------- */
  document.addEventListener('click', e => {
    const goEl = e.target.closest('[data-go]');
    if (goEl) { go(goEl.dataset.go); return; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    const postEl = a.closest('[data-post]');
    const p = postEl ? findPost(postEl.dataset.post) : null;

    switch (act) {
      case 'compose': composeModal(); break;
      case 'closemodal': closeModal(); break;
      case 'publish': {
        const txt = $('#composeText').value.trim(); if (!txt) { toast('Write something first'); break; }
        S.posts.unshift({ id: id(), author: S.user.name, head: S.user.headline, hue: hueOf(S.user.name), time: Date.now(), text: txt, likes: 0, liked: false, comments: [], reposts: 0 });
        save(); closeModal(); go('home'); toast('Post shared');
        break;
      }
      case 'like': {
        if (!p) break; p.liked = !p.liked; p.likes += p.liked ? 1 : -1; save();
        a.classList.toggle('on', p.liked);
        const stat = $('.post-stats .likes', postEl);
        stat.innerHTML = p.likes ? `<span class="lk">${svg(I.like,10)}</span> ${p.likes}` : '';
        break;
      }
      case 'comment': { const c = $('[data-comments]', postEl); c.hidden = !c.hidden; if (!c.hidden) $('[data-cinput]', c).focus(); break; }
      case 'csend': {
        const inp = $('[data-cinput]', postEl); const v = inp.value.trim(); if (!v || !p) break;
        p.comments.push({ name: S.user.name, text: v }); save();
        $('[data-clist]', postEl).insertAdjacentHTML('beforeend', cmtHTML({ name: S.user.name, text: v }));
        inp.value = '';
        $('.post-stats span:last-child', postEl).textContent = `${p.comments.length} comments${p.reposts?' · '+p.reposts+' reposts':''}`;
        break;
      }
      case 'repost': { if (!p) break; p.reposts++; save(); toast('Reposted to your feed'); $('.post-stats span:last-child', postEl).textContent = `${p.comments.length?p.comments.length+' comments · ':''}${p.reposts} reposts`; break; }
      case 'send': toast('Sharing options coming soon'); break;
      case 'postmore': toast('Post options'); break;
      case 'connect': {
        const el = a.closest('[data-person]'); const pr = S.people.find(x => x.id === el.dataset.person); if (!pr) break;
        pr.status = 'connected'; S.user.connections++; save();
        el.querySelector('.btn').outerHTML = `<button class="btn btn-ghost btn-sm" data-act="message-person">${svg(I.msg,16)} Message</button>`;
        toast(`You are now connected with ${pr.name.split(' ')[0]}`);
        renderTop();
        break;
      }
      case 'message-person': {
        const el = a.closest('[data-person]'); const pr = S.people.find(x => x.id === el.dataset.person);
        let th = S.threads.find(t => t.name === pr.name);
        if (!th) { th = { id: id(), name: pr.name, head: pr.head, hue: hueOf(pr.name), messages: [] }; S.threads.unshift(th); }
        save(); go('messaging', { thread: th.id });
        break;
      }
      case 'save': { const el = a.closest('[data-job]'); const j = S.jobs.find(x => x.id === el.dataset.job); j.saved = !j.saved; save(); a.innerHTML = svg(j.saved ? I.check : I.bookmark, 20); toast(j.saved ? 'Job saved' : 'Removed from saved'); break; }
      case 'apply': { const el = a.closest('[data-job]'); const j = S.jobs.find(x => x.id === el.dataset.job); j.applied = true; save(); a.textContent = 'Applied'; a.classList.remove('btn-primary'); a.classList.add('btn-ghost'); a.disabled = true; toast(`Application sent to ${j.company}`); break; }
      case 'sendmsg': { sendMessage(a.dataset.thread); break; }
      case 'editprofile': editProfileModal(); break;
      case 'saveprofile': {
        S.user.name = $('#ep-name').value.trim() || S.user.name;
        S.user.headline = $('#ep-head').value.trim();
        S.user.location = $('#ep-loc').value.trim();
        S.user.about = $('#ep-about').value.trim();
        save(); closeModal(); render(); toast('Profile updated');
        break;
      }
      case 'premium': toast('Premium is a demo — enjoy the free version!'); break;
    }
  });

  // thread switching + enter-to-send
  document.addEventListener('click', e => {
    const th = e.target.closest('[data-thread]');
    if (th && th.classList.contains('thread')) go('messaging', { thread: th.dataset.thread });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.matches('[data-msginput]')) { e.preventDefault(); sendMessage(e.target.dataset.thread); }
    else if (e.target.matches('[data-cinput]')) { e.preventDefault(); const post = e.target.closest('[data-post]'); $('[data-act="csend"]', post).click(); }
    else if (e.target.id === 'composeText' && (e.metaKey || e.ctrlKey)) { $('[data-act="publish"]').click(); }
  });
  // close modal on backdrop / escape
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function sendMessage(threadId) {
    const inp = $(`[data-msginput][data-thread="${threadId}"]`);
    const t = S.threads.find(x => x.id === threadId);
    if (!inp || !t) return;
    const v = inp.value.trim(); if (!v) return;
    t.messages.push({ from: 'me', text: v, t: Date.now() }); save();
    const body = $('.chat-body');
    body.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(v)}</div>`);
    inp.value = ''; body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      const replies = ['Thanks for reaching out!', 'Sounds good — let me check and get back to you.', "Appreciate it, Alex. Let's talk soon.", 'Great point! 👏', 'Will do. Talk later!'];
      const r = replies[Math.floor(Math.random() * replies.length)];
      t.messages.push({ from: 'them', text: r, t: Date.now() }); save();
      const b = $('.chat-body'); if (b) { b.insertAdjacentHTML('beforeend', `<div class="bubble them">${esc(r)}</div>`); b.scrollTop = b.scrollHeight; }
    }, 1100 + Math.random() * 900);
  }

  /* ---------------- boot ---------------- */
  load(); render();
})();
