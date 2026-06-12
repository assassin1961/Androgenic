/* ============================================================
   ESTATE 3D — procedural architectural maquettes (Three.js)
   - Pinned scroll showcase: homes assemble + orbit with scroll
   - Lightbox viewer: drag-to-rotate model for every property
   ============================================================ */
import * as THREE from "three";

const GOLD = 0xc9a45c;
const NAVY = 0x223358;
const NAVY_DARK = 0x141f3a;
const WHITE_RENDER = 0x5a6c96;
const WINDOW_WARM = 0xffd98e;
const GREEN_DARK = 0x0d1a32;

/* ---------- material / geometry helpers ---------- */
const matCache = {};
function mat(color, rough = 0.85, metal = 0.12) {
  const key = `${color}-${rough}-${metal}`;
  return (matCache[key] ||= new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
}
const winMat = new THREE.MeshBasicMaterial({ color: WINDOW_WARM });
const edgeMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.75 });

function edged(geo, color = NAVY, rough = 0.85, metal = 0.12) {
  const m = new THREE.Mesh(geo, mat(color, rough, metal));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edgeMat));
  return m;
}
// box with origin at bottom-center so assembly can "grow" from the ground
function box(w, h, d, color = NAVY) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return edged(g, color);
}
function windowPane(w, h) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), winMat);
}
// grid of glowing windows on a wall plane
function windowGrid(parent, { cols, rows, w = 0.42, h = 0.5, gx = 0.3, gy = 0.42, x = 0, y = 1, z = 0, rotY = 0 }) {
  const g = new THREE.Group();
  const totW = cols * w + (cols - 1) * gx;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const p = windowPane(w, h);
      p.position.set(-totW / 2 + w / 2 + c * (w + gx), r * (h + gy) + h / 2, 0);
      g.add(p);
    }
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  return g;
}
function hipRoof(w, d, tw, td, h, color = NAVY_DARK) {
  const [x, z, tx, tz] = [w / 2, d / 2, tw / 2, td / 2];
  const v = [
    [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z],
    [-tx, h, -tz], [tx, h, -tz], [tx, h, tz], [-tx, h, tz]
  ];
  const faces = [
    [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
    [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
    [4, 5, 6], [4, 6, 7]
  ];
  const pos = [];
  faces.forEach((f) => f.forEach((i) => pos.push(...v[i])));
  let g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1, flatShading: true }));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), edgeMat));
  return m;
}
function prismRoof(w, d, h, color = NAVY_DARK) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(0, h); shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return edged(g, color);
}
function cypress(x, z, s = 1) {
  const g = new THREE.ConeGeometry(0.28 * s, 1.7 * s, 8);
  g.translate(0, 0.85 * s, 0);
  const m = edged(g, GREEN_DARK);
  m.position.set(x, 0, z);
  return m;
}
function tree(x, z, s = 1) {
  const grp = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.7 * s, 6);
  trunkGeo.translate(0, 0.35 * s, 0);
  grp.add(new THREE.Mesh(trunkGeo, mat(0x1a2440)));
  [[0, 1.05, 0, 0.55], [-0.35, 0.8, 0.1, 0.38], [0.33, 0.85, -0.08, 0.4]].forEach(([dx, dy, dz, r]) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 1), mat(GREEN_DARK, 0.95, 0.02));
    c.position.set(dx * s, dy * s, dz * s);
    grp.add(c);
  });
  grp.position.set(x, 0, z);
  return grp;
}
function lamp(x, z) {
  const grp = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6);
  poleGeo.translate(0, 0.45, 0);
  grp.add(new THREE.Mesh(poleGeo, mat(GOLD, 0.5, 0.7)));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), winMat);
  bulb.position.y = 0.95;
  grp.add(bulb);
  grp.position.set(x, 0, z);
  return grp;
}
function pool(w, d, x, z) {
  const water = edged(new THREE.BoxGeometry(w, 0.1, d).translate(0, 0.05, 0), 0x1d4066, 0.15, 0.85);
  water.position.set(x, 0.02, z);
  return water;
}
function plinth(r) {
  const grp = new THREE.Group();
  const baseGeo = new THREE.CylinderGeometry(r, r * 1.02, 0.22, 56);
  baseGeo.translate(0, 0.11, 0);
  grp.add(new THREE.Mesh(baseGeo, mat(NAVY_DARK, 0.95, 0.05)));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 8, 72), mat(GOLD, 0.4, 0.8));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.22;
  grp.add(ring);
  return grp;
}

/* ---------- part registration for staggered assembly ---------- */
function part(group, obj, order, lift = 0) {
  obj.userData.order = order;
  obj.userData.lift = lift;
  obj.userData.baseY = obj.position.y;
  group.add(obj);
  return obj;
}

/* ---------- house archetypes ---------- */
function buildModern({ white = false, withPool = true, grand = true } = {}) {
  const g = new THREE.Group();
  const wall = white ? WHITE_RENDER : NAVY;
  part(g, plinth(grand ? 5.6 : 4.6), 0);

  const volA = box(grand ? 4.6 : 3.6, 2.4, 3.6, wall);
  volA.position.set(grand ? -1.4 : -1, 0.22, 0);
  part(g, volA, 0.12, 0.6);
  windowGrid(volA, { cols: 3, rows: 1, w: 0.8, h: 1.2, gx: 0.24, y: 0.7, z: 1.81 });

  const volB = box(grand ? 3 : 2.4, grand ? 3.8 : 3.1, 3, wall);
  volB.position.set(grand ? 2 : 1.6, 0.22, 0.25);
  part(g, volB, 0.26, 0.8);
  windowGrid(volB, { cols: 3, rows: grand ? 3 : 2, w: 0.42, h: 0.5, y: 0.65, z: 1.51 });

  const slabA = box(grand ? 5.2 : 4.1, 0.16, 4.1, NAVY_DARK);
  slabA.position.set(volA.position.x, 2.62, 0);
  part(g, slabA, 0.42, 0.5);
  const slabB = box(grand ? 3.5 : 2.9, 0.16, 3.5, NAVY_DARK);
  slabB.position.set(volB.position.x, 0.22 + (grand ? 3.8 : 3.1), 0.25);
  part(g, slabB, 0.5, 0.5);

  if (withPool) part(g, pool(2.8, 1.4, -1.4, 2.7), 0.62);
  part(g, cypress(grand ? 4.4 : 3.6, 1.9, 1.05), 0.74);
  part(g, cypress(grand ? 4.9 : 4, 1.3, 0.85), 0.8);
  part(g, lamp(-3.9, 2.4), 0.88);
  return g;
}
function buildPalazzo() {
  const g = new THREE.Group();
  part(g, plinth(5.4), 0);
  const main = box(5.6, 3, 3.8, NAVY);
  main.position.y = 0.22;
  part(g, main, 0.12, 0.7);
  windowGrid(main, { cols: 2, rows: 2, w: 0.5, h: 0.62, gx: 2.6, gy: 0.6, y: 0.6, z: 1.91 });
  const doorArch = windowPane(0.7, 1.3);
  doorArch.position.set(0, 0.88, 1.92);
  part(g, doorArch, 0.3);
  for (let i = 0; i < 4; i++) {
    const colGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.6, 12);
    colGeo.translate(0, 1.3, 0);
    const col = edged(colGeo, NAVY_DARK);
    col.position.set(-1.8 + i * 1.2, 0.24, 2.2);
    part(g, col, 0.34 + i * 0.05, 0.4);
  }
  const pediment = prismRoof(6.2, 4.4, 1.25);
  pediment.position.y = 3.24;
  part(g, pediment, 0.58, 0.7);
  part(g, cypress(-3.6, 1.6, 1.15), 0.74);
  part(g, cypress(3.6, 1.6, 1.15), 0.78);
  part(g, lamp(-2.6, 3.2), 0.86);
  part(g, lamp(2.6, 3.2), 0.9);
  return g;
}
function buildColonial({ atrium = false } = {}) {
  const g = new THREE.Group();
  part(g, plinth(5.8), 0);
  const main = box(6, 2.7, 4, NAVY);
  main.position.y = 0.22;
  part(g, main, 0.12, 0.7);
  // veranda arches
  for (let i = 0; i < 3; i++) {
    const arch = windowPane(0.95, 1.35);
    arch.position.set(-1.9 + i * 1.9, 0.95, 2.01);
    part(g, arch, 0.28 + i * 0.04);
  }
  windowGrid(main, { cols: 3, rows: 1, w: 0.6, h: 0.5, gx: 1.3, y: 1.95, z: 2.01 });
  const roof = hipRoof(6.7, 4.6, 2.6, 1.4, 1.3);
  roof.position.y = 2.92;
  part(g, roof, 0.5, 0.7);
  if (atrium) {
    const glass = box(2, 1.9, 2, 0x21385c);
    glass.position.set(4.1, 0.22, 0.4);
    part(g, glass, 0.6, 0.5);
    windowGrid(glass, { cols: 3, rows: 2, w: 0.44, h: 0.55, gx: 0.14, gy: 0.2, y: 0.25, z: 1.01 });
  } else {
    part(g, tree(4.3, 1.2, 1.15), 0.62);
  }
  part(g, tree(-4.2, 1, 1.3), 0.7);
  part(g, lamp(0, 3.3), 0.86);
  return g;
}
function buildFarmhouse({ linear = false } = {}) {
  const g = new THREE.Group();
  part(g, plinth(6.2), 0);
  const main = box(linear ? 7.2 : 6.6, linear ? 1.9 : 2.2, 3.4, NAVY);
  main.position.y = 0.22;
  part(g, main, 0.12, 0.6);
  windowGrid(main, { cols: linear ? 5 : 4, rows: 1, w: 0.85, h: 1.05, gx: 0.35, y: 0.55, z: 1.71 });
  const slab = box(linear ? 7.9 : 7.3, 0.16, 4, NAVY_DARK);
  slab.position.y = 0.22 + (linear ? 1.9 : 2.2);
  part(g, slab, 0.36, 0.5);
  // veranda posts
  for (let i = 0; i < 4; i++) {
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, linear ? 1.9 : 2.2, 8);
    postGeo.translate(0, (linear ? 1.9 : 2.2) / 2, 0);
    const post = new THREE.Mesh(postGeo, mat(GOLD, 0.5, 0.6));
    post.position.set(-2.7 + i * 1.8, 0.22, 2.2);
    part(g, post, 0.4 + i * 0.04, 0.3);
  }
  part(g, tree(-4.6, 1.6, 1.1), 0.6);
  part(g, tree(4.7, 1.8, 0.95), 0.66);
  part(g, tree(5.4, 0.6, 0.75), 0.72);
  if (linear) part(g, pool(2.2, 1.2, 2.4, 2.9), 0.8);
  part(g, lamp(-3.2, 2.9), 0.88);
  return g;
}

const ARCHETYPES = {
  manor: () => buildModern({ grand: true, withPool: true }),
  modern: () => buildModern({ grand: false, withPool: false }),
  modernWhite: () => buildModern({ grand: false, withPool: false, white: true }),
  palazzo: () => buildPalazzo(),
  colonial: () => buildColonial(),
  colonialAtrium: () => buildColonial({ atrium: true }),
  farmhouse: () => buildFarmhouse(),
  linear: () => buildFarmhouse({ linear: true })
};

// property index (matches PROPERTIES in main.js) -> archetype
const PROPERTY_MODELS = [
  "manor", "modern", "modern", "modernWhite", "farmhouse", "modern",
  "palazzo", "colonialAtrium", "modernWhite", "colonial", "linear", "modern"
];

/* ---------- scene factory ---------- */
function makeScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0f1e, 16, 34);
  scene.add(new THREE.AmbientLight(0x5a6a96, 1.6));
  const key = new THREE.DirectionalLight(0xffd9a0, 1.9);
  key.position.set(6, 9, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4466cc, 0.9);
  rim.position.set(-7, 5, -6);
  scene.add(rim);
  return scene;
}
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
// staggered build: each part grows from the ground as progress sweeps through
function applyAssembly(house, p) {
  house.traverse((o) => {
    if (o.userData.order === undefined) return;
    const k = Math.min(Math.max((p * 1.45 - o.userData.order * 0.62) / 0.32, 0), 1);
    const e = easeOutCubic(k);
    const s = Math.max(e, 0.0001);
    o.scale.setScalar(s);
    o.position.y = o.userData.baseY + (1 - e) * (o.userData.lift || 0);
    o.visible = k > 0.001;
  });
}

/* ============================================================
   SCROLL SHOWCASE
   ============================================================ */
const SHOWCASE = [
  { type: "manor", name: "The Margalla View Manor", loc: "F-7/2, Islamabad", price: "Sold · PKR 38 Crore" },
  { type: "palazzo", name: "Phase 6 Palazzo", loc: "DHA Phase 6, Lahore", price: "Sold · PKR 13 Crore" },
  { type: "colonial", name: "Model Town Estate", loc: "Model Town Block C, Lahore", price: "Sold · PKR 16 Crore" }
];

function initShowcase() {
  const section = document.getElementById("showcase3d");
  const canvas = document.getElementById("estateCanvas");
  if (!section || !canvas || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    if (section) section.style.display = "none";
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    section.style.display = "none";
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = makeScene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const rig = new THREE.Group();
  scene.add(rig);

  const houses = SHOWCASE.map((s) => {
    const h = ARCHETYPES[s.type]();
    h.visible = false;
    rig.add(h);
    return h;
  });

  const captions = Array.from(section.querySelectorAll(".showcase3d__caption"));
  const counter = section.querySelector(".showcase3d__counter");

  function size() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener("resize", size);

  let progress = 0, inView = true, lastSeg = -1;
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=2800",
    pin: true,
    scrub: true,
    onUpdate(self) { progress = self.progress; }
  });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(section);

  function frame() {
    if (!inView) return;
    const segF = Math.min(progress * 3, 2.999);
    const seg = Math.floor(segF);
    const local = segF - seg;

    if (seg !== lastSeg) {
      houses.forEach((h, i) => (h.visible = i === seg));
      captions.forEach((c, i) => c.classList.toggle("is-active", i === seg));
      if (counter) counter.textContent = `0${seg + 1} / 03`;
      lastSeg = seg;
    }
    // 0.12 floor keeps the plinth visible while the section scrolls into view
    applyAssembly(houses[seg], Math.min(0.12 + local * 1.9, 1));
    houses[seg].rotation.y = -0.55 + local * 1.45;

    const camAngle = -0.18 + local * 0.22;
    camera.position.set(Math.sin(camAngle) * 14, 4.9 - local * 1.1, Math.cos(camAngle) * 14);
    camera.lookAt(0, 1.5, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
}

/* ============================================================
   LIGHTBOX VIEWER (drag to rotate, auto-spin)
   ============================================================ */
let viewer = null;
function ensureViewer(container) {
  if (viewer) return viewer;
  const canvas = document.createElement("canvas");
  canvas.className = "lightbox__3d";
  container.appendChild(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = makeScene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 4.4, 12);
  camera.lookAt(0, 1.4, 0);

  viewer = { renderer, scene, camera, canvas, house: null, rotY: 0, targetRotY: 0, dragging: false, open: false, built: 0, type: null };

  canvas.addEventListener("pointerdown", (e) => {
    viewer.dragging = true;
    viewer.lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!viewer.dragging) return;
    viewer.targetRotY += (e.clientX - viewer.lastX) * 0.012;
    viewer.lastX = e.clientX;
  });
  ["pointerup", "pointercancel"].forEach((ev) =>
    canvas.addEventListener(ev, () => (viewer.dragging = false)));

  function loop(t) {
    if (!viewer.open) return;
    requestAnimationFrame(loop);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * renderer.getPixelRatio()) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if (!viewer.dragging) viewer.targetRotY += 0.0035; // gentle auto-spin
    viewer.rotY += (viewer.targetRotY - viewer.rotY) * 0.08;
    if (viewer.house) {
      viewer.house.rotation.y = viewer.rotY;
      viewer.built = Math.min(viewer.built + 0.016, 1);
      applyAssembly(viewer.house, easeOutCubic(viewer.built));
    }
    renderer.render(scene, camera);
  }
  viewer.loop = loop;
  return viewer;
}

function openViewer(index, container) {
  const v = ensureViewer(container);
  if (!v) return false;
  const type = PROPERTY_MODELS[index] || "modern";
  if (v.type !== type) {
    if (v.house) { v.scene.remove(v.house); }
    v.house = ARCHETYPES[type]();
    v.scene.add(v.house);
    v.type = type;
  }
  v.built = 0;
  v.rotY = v.targetRotY = -0.4;
  v.open = true;
  v.canvas.style.display = "block";
  requestAnimationFrame(v.loop);
  return true;
}
function closeViewer() {
  if (viewer) viewer.open = false;
}

window.Estate3D = { openViewer, closeViewer };
initShowcase();
