/* =====================================================================
   Androgenic — Research Peptides storefront
   Order = opens the customer's email app (mailto) to androgenic@yahoo.com
   with subject "Order", the order summary, and a mailing-address template.
   Research use only. No medical/dosing guidance.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const ORDER_EMAIL = 'androgenic@yahoo.com';
  const money = n => '$' + n.toLocaleString();

  /* ---------- catalogue (research-use-only) ----------
     GLP-1 line (reta / tirzepatide / semaglutide) keep base pricing;
     everything else includes the +$50 tier.                            */
  const PRODUCTS = [
    { id:'reta',  name:'Retatrutide', cls:'GLP-1 / GIP / Glucagon', size:'10 mg / vial', price:189, desc:'Triple-receptor agonist peptide widely studied in metabolic research models.' },
    { id:'tirze', name:'Tirzepatide', cls:'GLP-1 / GIP', size:'30 mg / vial', price:149, desc:'Dual incretin receptor agonist used in metabolic and endocrine research.' },
    { id:'sema',  name:'Semaglutide', cls:'GLP-1', size:'10 mg / vial', price:99, desc:'GLP-1 receptor agonist peptide for in-vitro metabolic studies.' },

    { id:'bpc',   name:'BPC-157', cls:'Cytoprotective', size:'10 mg / vial', price:105, desc:'Synthetic peptide fragment investigated in tissue and recovery research.' },
    { id:'tb',    name:'TB-500', cls:'Thymosin β4 fragment', size:'10 mg / vial', price:115, desc:'Actin-binding peptide studied for cell migration and repair models.' },
    { id:'blend', name:'BPC-157 + TB-500', cls:'Research blend', size:'10 mg / vial', price:135, desc:'Co-lyophilised blend for comparative recovery-pathway research.' },
    { id:'kpv',   name:'KPV', cls:'Anti-inflammatory tripeptide', size:'10 mg / vial', price:95, desc:'α-MSH C-terminal fragment studied in inflammation and gut-research models.' },
    { id:'ghk',   name:'GHK-Cu', cls:'Copper peptide', size:'50 mg / vial', price:95, desc:'Copper-binding tripeptide examined in skin, collagen and matrix research.' },
    { id:'pt141', name:'PT-141 (Bremelanotide)', cls:'Melanocortin agonist', size:'10 mg / vial', price:99, desc:'Melanocortin-receptor agonist peptide used in libido and behaviour research.' },
    { id:'mt2',   name:'Melanotan II', cls:'Melanocortin / pigmentation', size:'10 mg / vial', price:89, desc:'Melanocortin agonist examined in pigmentation research models.' },
    { id:'ipa',   name:'Ipamorelin', cls:'GH secretagogue', size:'10 mg / vial', price:99, desc:'Selective growth-hormone-secretagogue peptide for endocrine assays.' },
    { id:'cjc',   name:'CJC-1295 (no DAC)', cls:'GHRH analogue', size:'5 mg / vial', price:109, desc:'Growth-hormone-releasing-hormone analogue used in research pairings.' },
    { id:'ghrp6', name:'GHRP-6', cls:'GH secretagogue', size:'10 mg / vial', price:89, desc:'Growth-hormone-releasing peptide for secretagogue research.' },
    { id:'serm',  name:'Sermorelin', cls:'GHRH analogue', size:'5 mg / vial', price:99, desc:'GHRH (1-29) analogue peptide for endocrine research.' },
    { id:'tesa',  name:'Tesamorelin', cls:'GHRH analogue', size:'10 mg / vial', price:149, desc:'Stabilised GHRH analogue studied in metabolic and lipodystrophy models.' },
    { id:'motsc', name:'MOTS-c', cls:'Mitochondrial-derived', size:'10 mg / vial', price:129, desc:'Mitochondrial-derived peptide examined in metabolic and ageing research.' },
    { id:'aod',   name:'AOD-9604', cls:'GH fragment 176-191', size:'5 mg / vial', price:99, desc:'Growth-hormone C-terminal fragment studied in lipid-metabolism research.' },
    { id:'selank',name:'Selank', cls:'Anxiolytic peptide', size:'10 mg / vial', price:99, desc:'Tuftsin-analogue peptide investigated in anxiety and cognition research.' },
    { id:'semax', name:'Semax', cls:'Nootropic peptide', size:'10 mg / vial', price:99, desc:'ACTH-fragment peptide studied in neuroprotection and cognition models.' },
    { id:'ta1',   name:'Thymosin Alpha-1', cls:'Immune peptide', size:'10 mg / vial', price:129, desc:'Thymic peptide examined in immune-modulation research.' },
    { id:'epi',   name:'Epitalon', cls:'Telomere / pineal', size:'50 mg / vial', price:99, desc:'Tetrapeptide investigated in telomere and circadian research.' },
    { id:'dsip',  name:'DSIP', cls:'Delta sleep-inducing', size:'5 mg / vial', price:89, desc:'Delta sleep-inducing peptide studied in sleep and stress research.' },
    { id:'nad',   name:'NAD+', cls:'Cellular energy', size:'500 mg / vial', price:119, desc:'Coenzyme studied in cellular-energy and metabolic research.' },
  ];
  const byId = id => PRODUCTS.find(p => p.id === id);

  /* ---------- cart ---------- */
  let cart = {}; try { cart = JSON.parse(localStorage.getItem('andro_cart')) || {}; } catch {}
  // drop any ids no longer in the catalogue
  Object.keys(cart).forEach(id => { if (!byId(id)) delete cart[id]; });
  const saveCart = () => localStorage.setItem('andro_cart', JSON.stringify(cart));
  const qtyOf = id => cart[id] || 0;
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((t, [id, q]) => t + (byId(id) ? byId(id).price * q : 0), 0);

  function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }

  /* ---------- render catalogue ---------- */
  function controlHTML(p){
    const q = qtyOf(p.id);
    return q > 0
      ? `<div class="stepper" data-id="${p.id}"><button data-dec aria-label="Decrease">−</button><span>${q}</span><button data-inc aria-label="Increase">+</button></div>`
      : `<button class="add" data-add="${p.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Add</button>`;
  }
  function renderGrid(){
    $('#grid').innerHTML = PRODUCTS.map((p, i) => `<article class="prod" style="animation-delay:${Math.min(i*40,400)}ms">
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
    if (!ids.length) body.innerHTML = `<div class="cart-empty">Your order is empty.<br>Add peptides from the catalogue.</div>`;
    else body.innerHTML = ids.map(id => { const p = byId(id), q = cart[id]; return `<div class="ci">
      <div class="ci-info"><b>${esc(p.name)}</b><small>${esc(p.size)} · ${money(p.price)} each</small><div class="ci-rm" data-rm="${id}">Remove</div></div>
      <div style="text-align:right"><div class="stepper" data-id="${id}"><button data-dec>−</button><span>${q}</span><button data-inc>+</button></div>
      <div class="ci-price" style="margin-top:6px">${money(p.price*q)}</div></div></div>`; }).join('');
    $('#total').textContent = money(cartTotal());
    $('#checkoutBtn').disabled = !ids.length;
  }
  function openDrawer(){ $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false'); }
  function closeDrawer(){ $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); $('#drawer').setAttribute('aria-hidden','true'); }

  /* ---------- place order → opens email app (mailto) ---------- */
  function placeOrder(){
    if (!cartCount()) return;
    const lines = Object.entries(cart).map(([id, q]) => { const p = byId(id); return `${q} x ${p.name} (${p.size}) - ${money(p.price * q)}`; }).join('\n');
    const body =
`Hi Androgenic,

I'd like to place the following order:

${lines}

Estimated total: ${money(cartTotal())}

Please ship to my FULL mailing address (fill in below):
Full name:
Street address (apt / unit):
City:
State / Province:
ZIP / Postal code:
Country:
Phone:

----- SAMPLE FORMAT -----
John Doe
123 Main Street, Apt 4B
Springfield, IL 62704
United States
+1 555 123 4567

Thank you!`;
    const href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('Order') + '&body=' + encodeURIComponent(body);
    toast('Opening your email app…');
    window.location.href = href;
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
    if (e.target.closest('#checkoutBtn')) { placeOrder(); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'scrim') { closeDrawer(); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- boot ---------- */
  $('#yr').textContent = new Date().getFullYear();
  renderGrid(); syncCart();
})();
