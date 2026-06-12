/* ============================================================
   ADEEL AHMED RAHMAN — LUXURY REAL ESTATE PORTFOLIO
   ============================================================ */

const HAS_GSAP = typeof gsap !== "undefined";
const HAS_ST = HAS_GSAP && typeof ScrollTrigger !== "undefined";
const HAS_LENIS = typeof Lenis !== "undefined";
if (!HAS_GSAP) document.documentElement.classList.add("no-anim");

/* ---------- SOLD PROPERTIES ---------- */
const PROPERTIES = [
  {
    title: "The Margalla View Manor",
    loc: "F-7/2, Islamabad", city: "islamabad", size: "kanal", sizeLabel: "2 Kanal",
    beds: 7, baths: 8, area: "10,890 sq ft", year: 2025, price: "PKR 38 Crore",
    img: "assets/villas/01-margalla-manor.svg",
    desc: "A landmark double-kanal estate beneath the Margalla Hills — imported Italian marble, a glass-walled drawing room, and a heated infinity pool overlooking Sector F-7's greenest avenue.",
    soldIn: 18, tags: ["Designer Build", "Margalla View", "Basement Theater"],
    features: ["7 Beds Attached Baths", "Heated Infinity Pool", "Imported Italian Marble", "Smart Home", "Servant Quarter", "4-Car Parking"]
  },
  {
    title: "Villa Serena",
    loc: "DHA Phase 2, Islamabad", city: "islamabad", size: "kanal", sizeLabel: "1 Kanal",
    beds: 6, baths: 7, area: "5,400 sq ft", year: 2025, price: "PKR 14.5 Crore",
    img: "assets/villas/02-villa-serena.svg",
    desc: "Contemporary 1 Kanal masterpiece with a floating staircase, home cinema, and a landscaped courtyard that brings golden-hour light into every room. Sold above asking in eleven days.",
    soldIn: 11, tags: ["Brand New", "Double Unit", "Solar Installed"],
    features: ["6 Beds Attached Baths", "Floating Staircase", "Home Cinema", "Solar System Installed", "Double Unit", "Landscaped Courtyard"]
  },
  {
    title: "The Enclave Residence",
    loc: "Bahria Enclave, Islamabad", city: "islamabad", size: "10-marla", sizeLabel: "10 Marla",
    beds: 5, baths: 6, area: "3,250 sq ft", year: 2024, price: "PKR 5.8 Crore",
    img: "assets/villas/03-enclave-residence.svg",
    desc: "A designer 10 Marla with double-height lounge, smart-home automation throughout, and a rooftop terrace framing the Enclave's signature hills.",
    soldIn: 23, tags: ["Designer Build", "Park Face"],
    features: ["5 Beds Attached Baths", "Double-Height Lounge", "Smart Home Automation", "Rooftop Terrace", "Park Face", "Gas Water Electricity"]
  },
  {
    title: "Casa Blanca E-11",
    loc: "E-11/3, Islamabad", city: "islamabad", size: "5-marla", sizeLabel: "5 Marla",
    beds: 4, baths: 4, area: "2,100 sq ft", year: 2024, price: "PKR 3.2 Crore",
    img: "assets/villas/04-casa-blanca.svg",
    desc: "Proof that 5 Marla can feel limitless — white-render façade, Spanish porcelain floors, and a sunken lounge a young diplomat couple fell for at first viewing.",
    soldIn: 9, tags: ["Brand New", "Sun Face", "Investor Rate"],
    features: ["4 Beds Attached Baths", "Spanish Porcelain Floors", "Sunken Lounge", "Brand New", "Near Park & Masjid", "Water Boring"]
  },
  {
    title: "Gulberg Greens Farmhouse",
    loc: "Gulberg Greens, Islamabad", city: "islamabad", size: "kanal", sizeLabel: "4 Kanal",
    beds: 6, baths: 7, area: "9,000 sq ft", year: 2023, price: "PKR 22 Crore",
    img: "assets/villas/05-gulberg-farmhouse.svg",
    desc: "A resort-style farmhouse estate — orchard of forty fruit trees, guest annexe, and an open-plan living pavilion built for three generations under one roof.",
    soldIn: 35, tags: ["Farmhouse", "Orchard", "Gated Community"],
    features: ["6 Beds Attached Baths", "40-Tree Orchard", "Guest Annexe", "Staff Wing", "Bore Water + Solar", "Event Lawn"]
  },
  {
    title: "The Hilltop Modern",
    loc: "B-17 Multi Gardens, Islamabad", city: "islamabad", size: "10-marla", sizeLabel: "10 Marla",
    beds: 5, baths: 5, area: "3,100 sq ft", year: 2023, price: "PKR 3.9 Crore",
    img: "assets/villas/06-hilltop-modern.svg",
    desc: "Sharp modernist lines and full-height glazing on B-17's highest street — sold to an overseas family entirely over video walkthroughs.",
    soldIn: 27, tags: ["Hilltop", "Corner", "Overseas Deal"],
    features: ["5 Beds Attached Baths", "Full-Height Glazing", "Corner Plot", "Sold via Video Tour", "Possession Ready", "50 Ft Road"]
  },
  {
    title: "Phase 6 Palazzo",
    loc: "DHA Phase 6, Lahore", city: "lahore", size: "kanal", sizeLabel: "1 Kanal",
    beds: 6, baths: 7, area: "5,800 sq ft", year: 2025, price: "PKR 13 Crore",
    img: "assets/villas/07-phase6-palazzo.svg",
    desc: "Classical façade, contemporary heart. Twin kitchens, a cigar lounge, and Lahore's most photographed front elevation of 2025.",
    soldIn: 16, tags: ["Designer Build", "Double Unit"],
    features: ["6 Beds Attached Baths", "Twin Kitchens", "Cigar Lounge", "Double Unit", "Solid Construction", "2-Car Garage"]
  },
  {
    title: "The Gulberg Heritage House",
    loc: "Gulberg III, Lahore", city: "lahore", size: "kanal", sizeLabel: "2 Kanal",
    beds: 7, baths: 8, area: "11,200 sq ft", year: 2024, price: "PKR 34 Crore",
    img: "assets/villas/08-gulberg-heritage.svg",
    desc: "A storied Gulberg address reimagined — original 1970s bones restored around a new glass atrium, pool pavilion, and staff wing. A legacy sale handled in complete discretion.",
    soldIn: 41, tags: ["Legacy Estate", "Discreet Sale"],
    features: ["7 Beds Attached Baths", "Glass Atrium", "Pool Pavilion", "Staff Wing", "Mature Gardens", "Original 1970s Restored"]
  },
  {
    title: "Bahria Orchard Villa",
    loc: "Bahria Town Sector C, Lahore", city: "lahore", size: "10-marla", sizeLabel: "10 Marla",
    beds: 5, baths: 6, area: "3,400 sq ft", year: 2024, price: "PKR 4.65 Crore",
    img: "assets/villas/09-bahria-orchard.svg",
    desc: "Crisp white contemporary with a courtyard olive tree at its centre. Listed at 4 crore by others — closed at 4.65 after a two-week bidding strategy.",
    soldIn: 14, tags: ["Brand New", "Courtyard", "Above Demand"],
    features: ["5 Beds Attached Baths", "Courtyard Olive Tree", "Brand New Designer", "Closed Above Demand", "Tiled Flooring", "Solar Ready"]
  },
  {
    title: "Model Town Estate",
    loc: "Model Town Block C, Lahore", city: "lahore", size: "kanal", sizeLabel: "1 Kanal",
    beds: 6, baths: 6, area: "6,100 sq ft", year: 2023, price: "PKR 16 Crore",
    img: "assets/villas/10-model-town.svg",
    desc: "One of Model Town's coveted corner kanals — mature gardens, colonial verandas, and a library that smells of old Lahore. Passed to its next custodian family.",
    soldIn: 30, tags: ["Corner Kanal", "Mature Gardens"],
    features: ["6 Beds Attached Baths", "Colonial Verandas", "Library", "Corner Plot", "Mature Gardens", "Servant Quarters"]
  },
  {
    title: "Lake City Linear House",
    loc: "Lake City M-3, Lahore", city: "lahore", size: "10-marla", sizeLabel: "10 Marla",
    beds: 5, baths: 5, area: "3,300 sq ft", year: 2025, price: "PKR 4.2 Crore",
    img: "assets/villas/11-lake-city.svg",
    desc: "Long, low and luminous — a golf-course-facing modern with cedar screens and a double-height gallery that sold at first open house.",
    soldIn: 6, tags: ["Golf Facing", "Brand New"],
    features: ["5 Beds Attached Baths", "Golf Course Facing", "Cedar Screens", "Double-Height Gallery", "Sold at First Open House", "Possession Ready"]
  },
  {
    title: "The Phase 5 Courtyard",
    loc: "DHA Phase 5, Lahore", city: "lahore", size: "5-marla", sizeLabel: "5 Marla",
    beds: 3, baths: 4, area: "1,950 sq ft", year: 2024, price: "PKR 2.85 Crore",
    img: "assets/villas/12-phase5-courtyard.svg",
    desc: "A jewel-box 5 Marla wrapped around a private courtyard — terrazzo floors, brass details, and the highest per-marla price on its street that year.",
    soldIn: 19, tags: ["Jewel Box", "Record Price"],
    features: ["3 Beds Attached Baths", "Private Courtyard", "Terrazzo Floors", "Brass Details", "Highest Per-Marla on Street", "Near Markaz"]
  }
];

/* ---------- FALLBACK ART ----------
   If a remote photo can't load (offline, blocked CDN), swap in an
   elegant gold line-art villa so the gallery never shows a broken image. */
const VILLA_PATHS = [
  // modern flat-roof villa
  `<path d="M120 420 L120 300 L300 300 L300 250 L520 250 L520 420 Z" fill="none" stroke="#c9a45c" stroke-width="3"/>
   <rect x="150" y="330" width="60" height="90" fill="#c9a45c" opacity="0.55"/>
   <rect x="330" y="280" width="50" height="60" fill="#c9a45c" opacity="0.4"/>
   <rect x="410" y="280" width="50" height="60" fill="#c9a45c" opacity="0.4"/>
   <line x1="60" y1="420" x2="740" y2="420" stroke="#c9a45c" stroke-width="2"/>
   <rect x="560" y="340" width="110" height="80" fill="none" stroke="#c9a45c" stroke-width="2.4" opacity="0.7"/>
   <circle cx="640" cy="170" r="34" fill="none" stroke="#c9a45c" stroke-width="2" opacity="0.6"/>`,
  // two-storey with arched entrance
  `<path d="M140 420 L140 240 L400 170 L660 240 L660 420 Z" fill="none" stroke="#c9a45c" stroke-width="3"/>
   <path d="M360 420 L360 330 Q400 290 440 330 L440 420" fill="none" stroke="#c9a45c" stroke-width="3"/>
   <rect x="190" y="280" width="55" height="55" fill="#c9a45c" opacity="0.45"/>
   <rect x="555" y="280" width="55" height="55" fill="#c9a45c" opacity="0.45"/>
   <rect x="190" y="355" width="55" height="55" fill="#c9a45c" opacity="0.3"/>
   <rect x="555" y="355" width="55" height="55" fill="#c9a45c" opacity="0.3"/>
   <line x1="70" y1="420" x2="730" y2="420" stroke="#c9a45c" stroke-width="2"/>
   <circle cx="160" cy="150" r="28" fill="none" stroke="#c9a45c" stroke-width="2" opacity="0.6"/>`,
  // gated kanal estate
  `<path d="M100 420 L100 310 L260 310 L260 230 L480 230 L480 310 L700 310 L700 420 Z" fill="none" stroke="#c9a45c" stroke-width="3"/>
   <rect x="300" y="260" width="44" height="44" fill="#c9a45c" opacity="0.5"/>
   <rect x="396" y="260" width="44" height="44" fill="#c9a45c" opacity="0.5"/>
   <rect x="140" y="340" width="80" height="80" fill="none" stroke="#c9a45c" stroke-width="2.4" opacity="0.8"/>
   <rect x="580" y="340" width="80" height="80" fill="none" stroke="#c9a45c" stroke-width="2.4" opacity="0.8"/>
   <line x1="50" y1="420" x2="750" y2="420" stroke="#c9a45c" stroke-width="2"/>
   <path d="M540 200 q20 -40 40 0 q20 -36 40 0" fill="none" stroke="#c9a45c" stroke-width="2" opacity="0.5"/>`
];
function fallbackArt(i, label) {
  const villa = VILLA_PATHS[i % VILLA_PATHS.length];
  const hue = ["#0c1226", "#101a30", "#0e1322"][i % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="#070b16"/>
    </linearGradient></defs>
    <rect width="800" height="560" fill="url(#g)"/>
    ${villa}
    <text x="400" y="500" text-anchor="middle" fill="#c9a45c" opacity="0.85"
      font-family="Georgia, serif" font-style="italic" font-size="26">${label}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function guardImage(img, i, label) {
  img.addEventListener("error", () => { img.src = fallbackArt(i, label); }, { once: true });
  if (img.complete && img.naturalWidth === 0 && img.src.startsWith("http")) img.src = fallbackArt(i, label);
}

/* ---------- RENDER CARDS ---------- */
const grid = document.getElementById("grid");
PROPERTIES.forEach((p, i) => {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.city = p.city;
  card.dataset.size = p.size;
  card.innerHTML = `
    <div class="card__media">
      <img src="${p.img}" alt="${p.title}" loading="lazy" />
      <span class="card__sold">SOLD${p.soldIn ? ` · ${p.soldIn} DAYS` : ""}</span>
      <span class="card__size">${p.sizeLabel}</span>
    </div>
    <div class="card__body">
      <p class="card__loc">${p.loc}</p>
      <h3 class="card__title">${p.title}</h3>
      <div class="card__tags">${(p.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>
      <div class="card__meta">
        <span>🛏 ${p.beds} Beds</span><span>🛁 ${p.baths} Baths</span><span>📐 ${p.area}</span>
      </div>
      <div class="card__foot">
        <span class="card__price"><em>Closed at</em>${p.price}</span>
        <span class="card__view">View Story →</span>
      </div>
    </div>`;
  card.addEventListener("click", () => openLightbox(i));
  guardImage(card.querySelector(".card__media img"), i, p.title);
  grid.appendChild(card);
});

// Background hero/contact photos: fade out gracefully if unreachable
document.querySelectorAll(".hero__bg img, .contact__bg img").forEach((img) => {
  img.addEventListener("error", () => { img.style.display = "none"; }, { once: true });
});

/* ---------- PRELOADER ---------- */
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloaderBar");
const preloaderCount = document.getElementById("preloaderCount");
let preloaderDone = false;

function dismissPreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  if (HAS_GSAP) {
    gsap.to(preloader, {
      yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.2,
      onComplete: () => { preloader.style.display = "none"; }
    });
    heroIntro();
  } else {
    preloader.style.display = "none";
  }
}

function startPreloader() {
  if (!HAS_GSAP) {
    preloaderBar.style.width = "100%";
    preloaderCount.textContent = "100";
    dismissPreloader();
    return;
  }
  const progress = { v: 0 };
  gsap.to(progress, {
    v: 100, duration: 1.6, ease: "power2.inOut",
    onUpdate() {
      preloaderBar.style.width = progress.v + "%";
      preloaderCount.textContent = Math.round(progress.v);
    },
    onComplete: dismissPreloader
  });
}

if (document.readyState === "complete") startPreloader();
else window.addEventListener("load", startPreloader);
// Safety net: never trap the user behind the preloader
setTimeout(() => { if (!preloaderDone) { startPreloader(); setTimeout(dismissPreloader, 2000); } }, 4000);

/* ---------- SMOOTH SCROLL (LENIS) ---------- */
let lenis = null;
if (HAS_ST) gsap.registerPlugin(ScrollTrigger);
if (HAS_LENIS && HAS_GSAP) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  if (HAS_ST) lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- HERO INTRO ---------- */
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(".hero__title .line > span", { y: 0, duration: 1.3, stagger: 0.12 })
    .fromTo(".hero__portrait", { opacity: 0, y: 60, rotate: 2 }, { opacity: 1, y: 0, rotate: 0, duration: 1.4 }, 0.3)
    .to(".hero__eyebrow, .hero__sub, .hero__actions", { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.6)
    .to(".hero__stat", { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, onComplete: runCounters }, 0.9);
}

/* ---------- SCROLL REVEALS / PARALLAX / CARD ENTRANCES ---------- */
if (HAS_ST) {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero")) return; // hero handled by intro timeline
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  document.querySelectorAll("[data-speed]").forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    gsap.to(el, {
      yPercent: (1 - speed) * 30, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  gsap.utils.toArray(".card").forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 70, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 92%" },
      delay: (i % 3) * 0.08
    });
  });
}

/* ---------- COUNTERS ---------- */
function runCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (!HAS_GSAP) { el.textContent = end + suffix; return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2.2, ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
    });
  });
}
if (!HAS_GSAP) runCounters();

/* ---------- ANCHOR LINKS ---------- */
const burger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: "smooth" });
    }
    mobileMenu.classList.remove("is-open");
    burger.classList.remove("is-open");
  });
});

/* ---------- NAV / PROGRESS ---------- */
const nav = document.getElementById("nav");
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 60);
  const h = document.documentElement;
  scrollProgress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
}, { passive: true });

burger.addEventListener("click", () => {
  burger.classList.toggle("is-open");
  mobileMenu.classList.toggle("is-open");
});

/* ---------- FILTERS ---------- */
document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
  btn.classList.add("is-active");
  const f = btn.dataset.filter;
  const cards = Array.from(document.querySelectorAll(".card"));
  const apply = () => cards.forEach((card) => {
    const show = f === "all" || card.dataset.city === f || card.dataset.size === f;
    card.classList.toggle("is-hidden", !show);
  });

  if (!HAS_GSAP) { apply(); return; }
  gsap.to(cards, {
    opacity: 0, y: 24, scale: 0.97, duration: 0.28, stagger: 0.015, ease: "power2.in",
    onComplete() {
      apply();
      gsap.to(cards.filter((c) => !c.classList.contains("is-hidden")), {
        opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "power3.out"
      });
      if (HAS_ST) ScrollTrigger.refresh();
    }
  });
});

/* ---------- LIGHTBOX ---------- */
const lightbox = document.getElementById("lightbox");
function openLightbox(i) {
  const p = PROPERTIES[i];
  const lbImg = document.getElementById("lbImg");
  const cardImg = document.querySelectorAll(".card__media img")[i];
  lbImg.src = cardImg && cardImg.src ? cardImg.src : p.img; // reuse fallback art if photo failed
  guardImage(lbImg, i, p.title);
  document.getElementById("lbLoc").textContent = p.loc + " · Sold " + p.year;
  document.getElementById("lbTitle").textContent = p.title;
  document.getElementById("lbDesc").textContent = p.desc;
  document.getElementById("lbPrice").textContent = p.price;
  document.getElementById("lbSpecs").innerHTML = `
    <div><span>Plot Size</span><strong>${p.sizeLabel}</strong></div>
    <div><span>Covered Area</span><strong>${p.area}</strong></div>
    <div><span>Bedrooms</span><strong>${p.beds}</strong></div>
    <div><span>Bathrooms</span><strong>${p.baths}</strong></div>`;
  document.getElementById("lbFeatures").innerHTML =
    (p.features || []).map((f) => `<li>✓ ${f}</li>`).join("");
  document.getElementById("lbPriceLabel").textContent = "Closed at";
  document.getElementById("lbSold").style.display = "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  if (lenis) lenis.stop();

  // interactive 3D model (estate3d.js); falls back to the illustration
  const media = lightbox.querySelector(".lightbox__media");
  const hint = document.getElementById("lbDragHint");
  const has3d = window.Estate3D && window.Estate3D.openViewer(i, media);
  if (hint) hint.style.display = has3d ? "block" : "none";
}
function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  if (lenis) lenis.start();
  if (window.Estate3D) window.Estate3D.closeViewer();
}
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ---------- TESTIMONIAL SLIDER ---------- */
const slides = document.querySelectorAll(".testimonial");
const dotsWrap = document.getElementById("dots");
let slideIdx = 0, slideTimer;
slides.forEach((_, i) => {
  const dot = document.createElement("i");
  if (i === 0) dot.classList.add("is-active");
  dot.addEventListener("click", () => goSlide(i));
  dotsWrap.appendChild(dot);
});
function goSlide(i) {
  slideIdx = (i + slides.length) % slides.length;
  slides.forEach((s, j) => s.classList.toggle("is-active", j === slideIdx));
  dotsWrap.querySelectorAll("i").forEach((d, j) => d.classList.toggle("is-active", j === slideIdx));
  restartAuto();
}
function restartAuto() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goSlide(slideIdx + 1), 6000);
}
document.getElementById("prevT").addEventListener("click", () => goSlide(slideIdx - 1));
document.getElementById("nextT").addEventListener("click", () => goSlide(slideIdx + 1));
restartAuto();

/* ---------- CUSTOM CURSOR & MAGNETIC (pointer devices, gsap only) ---------- */
if (HAS_GSAP && window.matchMedia("(hover: hover)").matches) {
  const cursor = document.getElementById("cursor");
  const cursorDot = document.getElementById("cursorDot");
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const mouse = { ...pos };
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  gsap.ticker.add(() => {
    pos.x += (mouse.x - pos.x) * 0.16;
    pos.y += (mouse.y - pos.y) * 0.16;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
    cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("a, button, .card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * 0.25,
        y: (e.clientY - r.top - r.height / 2) * 0.25,
        duration: 0.4, ease: "power3.out"
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ---------- HOT DEALS (available listings — replace with real ones) ---------- */
const HOT_DEALS = [
  {
    title: "Brand New 10 Marla Designer House",
    loc: "Bahria Town Phase 8, Rawalpindi",
    demand: "PKR 4.85 Crore",
    tags: ["Brand New", "Park Face", "Solar Installed"],
    specs: "5 Beds Attached Baths · Double Unit · 2-Car Porch",
    img: "assets/villas/02-villa-serena.svg",
    badge: "HOT DEAL"
  },
  {
    title: "1 Kanal Designer Villa — Basement + Theater",
    loc: "DHA Phase 2, Islamabad",
    demand: "PKR 11.5 Crore",
    tags: ["Corner", "Possession Ready", "Gas Installed"],
    specs: "6 Beds Attached Baths · Home Theater · Servant Quarter",
    img: "assets/villas/01-margalla-manor.svg",
    badge: "PRIME LOCATION"
  },
  {
    title: "5 Marla Spanish Villa — Investor Rate",
    loc: "Bahria Town Phase 7, Rawalpindi",
    demand: "PKR 2.35 Crore",
    tags: ["Investor Rate", "Near Park & Masjid", "Brand New"],
    specs: "4 Beds Attached Baths · Tiled Flooring · Sun Face",
    img: "assets/villas/12-phase5-courtyard.svg",
    badge: "INVESTOR RATE"
  }
];
// 3D archetype per deal (see estate3d.js ARCHETYPES)
const DEAL_MODELS = ["greyTexture", "manor", "spanish"];

function openDealLightbox(d, i) {
  document.getElementById("lbImg").src = d.img;
  document.getElementById("lbLoc").textContent = d.loc + " · Available Now";
  document.getElementById("lbTitle").textContent = d.title;
  document.getElementById("lbDesc").textContent = d.specs;
  document.getElementById("lbPrice").textContent = d.demand;
  document.getElementById("lbPriceLabel").textContent = "Demand";
  document.getElementById("lbSold").style.display = "none";
  document.getElementById("lbSpecs").innerHTML = "";
  document.getElementById("lbFeatures").innerHTML =
    d.tags.map((t) => `<li>✓ ${t}</li>`).join("");
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  if (lenis) lenis.stop();
  const media = lightbox.querySelector(".lightbox__media");
  const hint = document.getElementById("lbDragHint");
  const has3d = window.Estate3D && window.Estate3D.openViewerByType(DEAL_MODELS[i] || "modern", media);
  if (hint) hint.style.display = has3d ? "block" : "none";
}

const dealsGrid = document.getElementById("dealsGrid");
if (dealsGrid) {
  HOT_DEALS.forEach((d, di) => {
    const el = document.createElement("article");
    el.className = "deal";
    const wa = `https://wa.me/16134083945?text=${encodeURIComponent(
      `Hello Adeel, I'm interested in: ${d.title} (${d.loc}) — Demand ${d.demand}. Please share details.`)}`;
    el.innerHTML = `
      <div class="deal__media">
        <img src="${d.img}" alt="${d.title}" loading="lazy" />
        <span class="deal__badge">${d.badge}</span>
        <span class="deal__3d">View in 3D</span>
      </div>
      <div class="deal__body">
        <p class="card__loc">${d.loc}</p>
        <h3 class="card__title">${d.title}</h3>
        <div class="card__tags">${d.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <p class="deal__specs">${d.specs}</p>
        <div class="deal__price"><span>Demand</span><strong>${d.demand}</strong></div>
        <div class="deal__actions">
          <a class="btn btn--wa" href="${wa}" target="_blank" rel="noopener">WhatsApp Now</a>
          <a class="btn btn--ghost btn--sm" href="tel:+16134083945">Call</a>
        </div>
      </div>`;
    dealsGrid.appendChild(el);
    el.querySelector(".deal__media").addEventListener("click", () => openDealLightbox(d, di));
    el.querySelector(".deal__media img").addEventListener("error", function () {
      this.style.display = "none";
    }, { once: true });
  });
}
