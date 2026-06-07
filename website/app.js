/* =====================================================================
   Androgenic — Research Peptides storefront
   Cart + order-by-email (FormSubmit -> androgenic@yahoo.com).
   Research use only. No medical/dosing guidance.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const ORDER_EMAIL = 'androgenic@yahoo.com';
  const money = n => '$' + n.toLocaleString();

  /* ---------- catalogue (research-use-only) ---------- */
  const PRODUCTS = [
    { id:'reta',  name:'Retatrutide', cls:'GLP-1 / GIP / Glucagon', size:'10 mg / vial', price:189,
      desc:'Triple-receptor agonist peptide widely studied in metabolic research models.' },
    { id:'tirze', name:'Tirzepatide', cls:'GLP-1 / GIP', size:'30 mg / vial', price:149,
      desc:'Dual incretin receptor agonist used in metabolic and endocrine research.' },
    { id:'sema',  name:'Semaglutide', cls:'GLP-1', size:'10 mg / vial', price:99,
      desc:'GLP-1 receptor agonist peptide for in-vitro metabolic studies.' },
    { id:'bpc',   name:'BPC-157', cls:'Cytoprotective', size:'10 mg / vial', price:55,
      desc:'Synthetic peptide fragment investigated in tissue and recovery research.' },
    { id:'tb',    name:'TB-500', cls:'Thymosin β4 fragment', size:'10 mg / vial', price:65,
      desc:'Actin-binding peptide studied for cell migration and repair models.' },
    { id:'blend', name:'BPC-157 + TB-500', cls:'Research blend', size:'10 mg / vial', price:85,
      desc:'Co-lyophilised blend for comparative recovery-pathway research.' },
    { id:'ghk',   name:'GHK-Cu', cls:'Copper peptide', size:'50 mg / vial', price:45,
      desc:'Copper-binding tripeptide examined in skin, collagen and matrix research.' },
    { id:'ipa',   name:'Ipamorelin', cls:'GH secretagogue', size:'10 mg / vial', price:49,
      desc:'Selective growth-hormone-secretagogue peptide for endocrine assays.' },
    { id:'cjc',   name:'CJC-1295 (no DAC)', cls:'GHRH analogue', size:'5 mg / vial', price:59,
      desc:'Growth-hormone-releasing-hormone analogue used in research pairings.' },
  ];
  const byId = id => PRODUCTS.find(p => p.id === id);

  /* ---------- cart ---------- */
  let cart = {}; try { cart = JSON.parse(localStorage.getItem('andro_cart')) || {}; } catch {}
  const saveCart = () => localStorage.setItem('andro_cart', JSON.stringify(cart));
  const qtyOf = id => cart[id] || 0;
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((t, [id, q]) => t + (byId(id) ? byId(id).price * q : 0), 0);

  function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1900); }

  /* ---------- render catalogue ---------- */
  function controlHTML(p){
    const q = qtyOf(p.id);
    return q > 0
      ? `<div class="stepper" data-id="${p.id}"><button data-dec aria-label="Decrease">−</button><span>${q}</span><button data-inc aria-label="Increase">+</button></div>`
      : `<button class="add" data-add="${p.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Add</button>`;
  }
  function renderGrid(){
    $('#grid').innerHTML = PRODUCTS.map((p, i) => `<article class="prod" style="animation-delay:${Math.min(i*55,360)}ms">
      <div class="ab">${esc(p.cls)}</div>
      <h3>${esc(p.name)}</h3>
      <div class="size">${esc(p.size)}</div>
      <p class="desc">${esc(p.desc)}</p>
      <div class="row"><div class="price">${money(p.price)} <small>/ vial</small></div><div data-control="${p.id}">${controlHTML(p)}</div></div>
    </article>`).join('');
  }
  function refreshControl(id){ const host = $(`[data-control="${id}"]`); if (host) host.innerHTML = controlHTML(byId(id)); }

  function setQty(id, q){ q = Math.max(0, q); if (q === 0) delete cart[id]; else cart[id] = q; saveCart(); refreshControl(id); syncCart(); }
  function syncCart(){ $('#cartCount').textContent = cartCount(); renderDrawer(); }

  /* ---------- drawer ---------- */
  function renderDrawer(){
    const ids = Object.keys(cart);
    const body = $('#drawerBody');
    if (!ids.length) { body.innerHTML = `<div class="cart-empty">Your order is empty.<br>Add peptides from the catalogue.</div>`; }
    else body.innerHTML = ids.map(id => { const p = byId(id), q = cart[id]; return `<div class="ci">
      <div class="ci-info"><b>${esc(p.name)}</b><small>${esc(p.size)} · ${money(p.price)} each</small><div class="ci-rm" data-rm="${id}">Remove</div></div>
      <div style="text-align:right"><div class="stepper" data-id="${id}"><button data-dec>−</button><span>${q}</span><button data-inc>+</button></div>
      <div class="ci-price" style="margin-top:6px">${money(p.price*q)}</div></div></div>`; }).join('');
    $('#total').textContent = money(cartTotal());
    $('#checkoutBtn').disabled = !ids.length;
  }
  function openDrawer(){ $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false'); }
  function closeDrawer(){ $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); $('#drawer').setAttribute('aria-hidden','true'); }

  /* ---------- order summary ---------- */
  function orderLines(){ return Object.entries(cart).map(([id,q]) => { const p = byId(id); return `${q} × ${p.name} (${p.size}) — ${money(p.price*q)}`; }).join('\n'); }

  /* ---------- checkout modal ---------- */
  function openCheckout(){
    if (!cartCount()) return;
    const m = $('#modal');
    m.innerHTML = `<div class="modal">
      <button class="modal-x" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <div class="modal-head"><h3>Place your order</h3><p>We'll email you to confirm availability, pricing &amp; payment.</p></div>
      <form id="orderForm" class="modal-body">
        <div class="summary">${esc(orderLines())}\n— — —\nEstimated total: ${money(cartTotal())}</div>
        <div class="frow"><label>Full name</label><input id="o-name" autocomplete="name" placeholder="Your name" required></div>
        <div class="frow two">
          <div><label>Email</label><input id="o-email" type="email" autocomplete="email" placeholder="you@email.com" required></div>
          <div><label>Phone</label><input id="o-phone" type="tel" autocomplete="tel" placeholder="+…"></div>
        </div>
        <div class="frow"><label>Shipping address</label><textarea id="o-addr" placeholder="Address for delivery" required></textarea></div>
        <div class="frow"><label>Notes (optional)</label><textarea id="o-notes" placeholder="Anything we should know"></textarea></div>
        <div class="err" id="o-err"></div>
        <div class="modal-foot"><button type="button" class="btn-ghost" data-close>Cancel</button><button type="submit" class="btn-cream btn-block" id="o-submit">Send order →</button></div>
      </form></div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
    setTimeout(() => $('#o-name') && $('#o-name').focus(), 60);
  }
  function closeModal(){ const m = $('#modal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); m.innerHTML = ''; }

  function submitOrder(e){
    e.preventDefault();
    const name = $('#o-name').value.trim(), email = $('#o-email').value.trim(), addr = $('#o-addr').value.trim();
    const err = $('#o-err');
    if (!name) { err.textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email.'; return; }
    if (!addr) { err.textContent = 'Please enter a shipping address.'; return; }
    $('#o-submit').disabled = true; $('#o-submit').textContent = 'Sending…';
    // reliable FormSubmit form POST -> emails the order; _next returns with #ordered
    const f = document.createElement('form');
    f.method = 'POST'; f.action = 'https://formsubmit.co/' + ORDER_EMAIL; f.style.display = 'none';
    const add = (k, v) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v == null ? '' : v; f.appendChild(i); };
    add('Name', name); add('Email', email); add('Phone', $('#o-phone').value.trim() || '—');
    add('Shipping address', addr); add('Notes', $('#o-notes').value.trim() || '—');
    add('Order', orderLines()); add('Estimated total', money(cartTotal()));
    add('_subject', `New peptide order — ${name} (${money(cartTotal())})`);
    add('_template', 'table'); add('_captcha', 'false');
    add('_next', location.origin + location.pathname + '#ordered');
    document.body.appendChild(f);
    cart = {}; saveCart();   // clear after sending
    f.submit();
  }
  function thankYou(){
    const m = $('#modal');
    m.innerHTML = `<div class="modal"><div class="ty"><div class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3>Order received</h3><p>Thank you. We've got your order and will email you shortly to confirm availability, pricing and payment.</p>
      <div class="modal-foot" style="justify-content:center;padding-top:18px"><button class="btn-cream" data-close>Done</button></div></div></div>`;
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'); if (add) { setQty(add.dataset.add, 1); openDrawer(); toast('Added to order'); return; }
    const step = e.target.closest('.stepper'); if (step) {
      const id = step.dataset.id;
      if (e.target.closest('[data-inc]')) setQty(id, qtyOf(id) + 1);
      else if (e.target.closest('[data-dec]')) setQty(id, qtyOf(id) - 1);
      return;
    }
    const rm = e.target.closest('[data-rm]'); if (rm) { setQty(rm.dataset.rm, 0); return; }
    if (e.target.closest('#cartBtn')) { openDrawer(); return; }
    if (e.target.closest('#checkoutBtn')) { openCheckout(); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'scrim') { closeDrawer(); closeModal(); return; }
    if (e.target.id === 'modal') closeModal();
  });
  document.addEventListener('submit', e => { if (e.target.id === 'orderForm') submitOrder(e); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  /* ---------- boot ---------- */
  $('#yr').textContent = new Date().getFullYear();
  renderGrid(); syncCart();
  if (/#ordered/.test(location.hash)) { history.replaceState(null, '', location.pathname); thankYou(); }
})();
