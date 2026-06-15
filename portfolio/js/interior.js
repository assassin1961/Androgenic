/* ============================================================
   HOUSE TOUR — first-person interior walkthrough (PlayCanvas)
   A furnished Pakistani designer show-home: foyer, formal living,
   dining, open kitchen, and a master bedroom. Walk with WASD +
   mouse on desktop, or the on-screen joystick + drag on mobile.
   The 2.3 MB engine is lazy-loaded only when a tour is opened.
   ============================================================ */
(function () {
  const ENGINE_SRC = "js/vendor/playcanvas.min.js";
  let enginePromise = null;
  let app = null, camRoot = null, cam = null;
  const state = {
    yaw: 180, pitch: -2, pos: null, vel: { x: 0, z: 0 },
    keys: {}, run: false,
    moveTouchId: null, lookTouchId: null,
    moveVec: { x: 0, y: 0 }, lookStart: null,
    walls: [], rooms: [], curRoom: ""
  };

  /* ---------- DOM ---------- */
  const overlay = document.getElementById("tour");
  const canvas = document.getElementById("tourCanvas");
  const roomLabel = document.getElementById("tourRoom");
  const loader = document.getElementById("tourLoader");
  const joyBase = document.getElementById("tourJoy");
  const joyKnob = document.getElementById("tourJoyKnob");

  function loadEngine() {
    if (window.pc) return Promise.resolve();
    if (enginePromise) return enginePromise;
    enginePromise = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = ENGINE_SRC;
      s.onload = res;
      s.onerror = () => rej(new Error("engine load failed"));
      document.head.appendChild(s);
    });
    return enginePromise;
  }

  /* ---------- texture helpers ---------- */
  function tex(draw, size = 256, rx = 1, ry = 1) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d"), size);
    const t = new pc.Texture(app.graphicsDevice, {
      width: size, height: size, format: pc.PIXELFORMAT_RGBA8, mipmaps: true
    });
    t.setSource(c);
    t.addressU = t.addressV = pc.ADDRESS_REPEAT;
    t.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
    t.magFilter = pc.FILTER_LINEAR;
    t.anisotropy = 8;
    t._rx = rx; t._ry = ry;
    return t;
  }
  function marbleTex() {
    return tex((ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, s, s);
      g.addColorStop(0, "#efece4"); g.addColorStop(0.5, "#e3ddd0"); g.addColorStop(1, "#eae5da");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(150,140,120,0.35)"; ctx.lineWidth = 1.2;
      for (let i = 0; i < 16; i++) {
        ctx.beginPath();
        let x = Math.random() * s, y = Math.random() * s;
        ctx.moveTo(x, y);
        for (let j = 0; j < 5; j++) { x += (Math.random() - 0.5) * s * 0.4; y += (Math.random() - 0.5) * s * 0.4; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(201,164,92,0.18)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); let x = Math.random() * s, y = Math.random() * s; ctx.moveTo(x, y);
        for (let j = 0; j < 4; j++) { x += (Math.random() - 0.5) * s * 0.5; y += (Math.random() - 0.5) * s * 0.5; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }, 256, 4, 4);
  }
  function rugTex() {
    return tex((ctx, s) => {
      ctx.fillStyle = "#2a3344"; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "#c9a45c"; ctx.fillRect(s * 0.08, s * 0.08, s * 0.84, s * 0.84);
      ctx.fillStyle = "#2a3344"; ctx.fillRect(s * 0.14, s * 0.14, s * 0.72, s * 0.72);
      ctx.strokeStyle = "#c9a45c"; ctx.lineWidth = 3;
      ctx.strokeRect(s * 0.2, s * 0.2, s * 0.6, s * 0.6);
      ctx.fillStyle = "#9a7b3f";
      ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.12, 0, 7); ctx.fill();
    }, 256, 1, 1);
  }
  function artTex(hue) {
    return tex((ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, s, s);
      g.addColorStop(0, hue[0]); g.addColorStop(1, hue[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = "#c9a45c"; ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 20 + Math.random() * 60, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }, 128, 1, 1);
  }

  /* ---------- material helper ---------- */
  function M(opts) {
    const m = new pc.StandardMaterial();
    if (opts.color) m.diffuse = new pc.Color(...opts.color);
    if (opts.map) { m.diffuseMap = opts.map; m.diffuseMapTiling = new pc.Vec2(opts.map._rx, opts.map._ry); }
    if (opts.gloss !== undefined) m.gloss = opts.gloss;
    if (opts.metal !== undefined) { m.metalness = opts.metal; m.useMetalness = true; }
    if (opts.emissive) { m.emissive = new pc.Color(...opts.emissive); m.emissiveIntensity = opts.emissiveI || 1; }
    if (opts.opacity !== undefined) { m.opacity = opts.opacity; m.blendType = pc.BLEND_NORMAL; }
    m.update();
    return m;
  }

  /* ---------- primitive helper ---------- */
  function prim(type, parent, { pos = [0, 0, 0], scale = [1, 1, 1], mat, shadow = true, recv = true }) {
    const e = new pc.Entity();
    e.addComponent("render", { type });
    if (mat) e.render.meshInstances.forEach((mi) => (mi.material = mat));
    e.render.castShadows = shadow;
    e.render.receiveShadows = recv;
    e.setLocalScale(scale[0], scale[1], scale[2]);
    e.setLocalPosition(pos[0], pos[1], pos[2]);
    (parent || app.root).addChild(e);
    return e;
  }
  const box = (p, o) => prim("box", p, o);

  /* ---------- furniture ---------- */
  const MATS = {};
  function buildMats() {
    MATS.floor = M({ map: marbleTex(), gloss: 0.82, metal: 0.04, color: [1, 1, 1] });
    MATS.wall = M({ color: [0.86, 0.83, 0.77], gloss: 0.2 });
    MATS.wallDark = M({ color: [0.16, 0.18, 0.22], gloss: 0.3 });
    MATS.ceiling = M({ color: [0.93, 0.92, 0.9], gloss: 0.1 });
    MATS.wood = M({ color: [0.27, 0.17, 0.10], gloss: 0.55, metal: 0.05 });
    MATS.woodLight = M({ color: [0.55, 0.39, 0.24], gloss: 0.4 });
    MATS.fabric = M({ color: [0.17, 0.22, 0.30], gloss: 0.25 });
    MATS.fabric2 = M({ color: [0.45, 0.36, 0.30], gloss: 0.25 });
    MATS.gold = M({ color: [0.79, 0.64, 0.36], gloss: 0.85, metal: 0.9 });
    MATS.metal = M({ color: [0.2, 0.2, 0.22], gloss: 0.7, metal: 0.8 });
    MATS.glass = M({ color: [0.6, 0.78, 0.9], opacity: 0.22, gloss: 0.95, metal: 0.1 });
    MATS.marbleWhite = M({ color: [0.9, 0.88, 0.83], gloss: 0.7, metal: 0.05 });
    MATS.warm = M({ color: [1, 0.86, 0.6], emissive: [1, 0.82, 0.5], emissiveI: 2.2 });
    MATS.screen = M({ color: [0.05, 0.05, 0.07], emissive: [0.3, 0.45, 0.7], emissiveI: 1.4 });
    MATS.window = M({ color: [1, 0.93, 0.78], emissive: [1, 0.9, 0.72], emissiveI: 1.6 });
    MATS.plant = M({ color: [0.13, 0.27, 0.16], gloss: 0.3 });
    MATS.rug = M({ map: rugTex(), gloss: 0.2, color: [1, 1, 1] });
  }

  function sofa(parent, x, z, rot, w = 2.4, matFab) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    const fab = matFab || MATS.fabric;
    box(g, { pos: [0, 0.22, 0], scale: [w, 0.44, 0.95], mat: fab });
    box(g, { pos: [0, 0.62, -0.4], scale: [w, 0.7, 0.18], mat: fab });
    box(g, { pos: [-w / 2 + 0.1, 0.5, 0], scale: [0.2, 0.5, 0.95], mat: fab });
    box(g, { pos: [w / 2 - 0.1, 0.5, 0], scale: [0.2, 0.5, 0.95], mat: fab });
    const n = Math.max(2, Math.round(w / 1.1));
    for (let i = 0; i < n; i++)
      box(g, { pos: [-w / 2 + w / (n * 2) + i * (w / n), 0.5, 0.05], scale: [w / n - 0.12, 0.16, 0.8], mat: fab });
    for (const sx of [-w / 2 + 0.15, w / 2 - 0.15])
      for (const sz of [-0.4, 0.4]) box(g, { pos: [sx, 0.05, sz], scale: [0.1, 0.1, 0.1], mat: MATS.metal });
    return g;
  }
  function coffeeTable(parent, x, z) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); (parent || app.root).addChild(g);
    box(g, { pos: [0, 0.4, 0], scale: [1.3, 0.08, 0.7], mat: MATS.gold });
    box(g, { pos: [0, 0.2, 0], scale: [1.2, 0.04, 0.6], mat: MATS.glass });
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.28, 0.28])
      prim("cylinder", g, { pos: [sx, 0.2, sz], scale: [0.05, 0.4, 0.05], mat: MATS.gold });
    return g;
  }
  function diningSet(parent, x, z) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); (parent || app.root).addChild(g);
    box(g, { pos: [0, 0.74, 0], scale: [2.4, 0.08, 1.1], mat: MATS.wood });
    box(g, { pos: [0, 0.76, 0], scale: [2.0, 0.02, 0.4], mat: MATS.warm });
    for (const sx of [-1.0, 1.0]) box(g, { pos: [sx, 0.37, 0], scale: [0.12, 0.74, 0.8], mat: MATS.wood });
    for (let i = 0; i < 3; i++) for (const side of [-1, 1]) {
      const cx = -0.8 + i * 0.8, cz = side * 0.85;
      box(g, { pos: [cx, 0.45, cz], scale: [0.42, 0.06, 0.42], mat: MATS.fabric2 });
      box(g, { pos: [cx, 0.72, cz + side * 0.18], scale: [0.42, 0.55, 0.06], mat: MATS.fabric2 });
      for (const lx of [-0.16, 0.16]) for (const lz of [-0.16, 0.16])
        prim("cylinder", g, { pos: [cx + lx, 0.22, cz + lz], scale: [0.04, 0.45, 0.04], mat: MATS.wood });
    }
    return g;
  }
  function kitchen(parent) {
    const g = new pc.Entity(); (parent || app.root).addChild(g);
    // run along north wall (z=-5.7)
    box(g, { pos: [-3, 0.45, -5.4], scale: [6, 0.9, 0.7], mat: MATS.wood });
    box(g, { pos: [-3, 0.92, -5.4], scale: [6, 0.06, 0.72], mat: MATS.marbleWhite });
    box(g, { pos: [-3, 2.3, -5.55], scale: [6, 0.8, 0.4], mat: MATS.woodLight });
    box(g, { pos: [-3, 1.5, -5.7], scale: [6, 0.8, 0.06], mat: MATS.wallDark }); // backsplash
    box(g, { pos: [-3, 1.0, -5.0], scale: [6, 0.02, 0.02], mat: MATS.warm }); // under-cabinet light
    // hood
    box(g, { pos: [-3, 2.0, -5.4], scale: [1.0, 0.5, 0.6], mat: MATS.metal });
    // sink notch (dark inset)
    box(g, { pos: [-4, 0.93, -5.4], scale: [0.7, 0.05, 0.5], mat: MATS.metal });
    // island
    box(g, { pos: [-3, 0.45, -3.4], scale: [3, 0.9, 1.2], mat: MATS.wallDark });
    box(g, { pos: [-3, 0.93, -3.4], scale: [3.2, 0.08, 1.4], mat: MATS.marbleWhite });
    for (const sx of [-1, 0, 1]) {
      prim("cylinder", g, { pos: [-3 + sx * 0.9, 0.55, -2.6], scale: [0.07, 0.7, 0.07], mat: MATS.gold });
      prim("cylinder", g, { pos: [-3 + sx * 0.9, 1.0, -2.6], scale: [0.34, 0.12, 0.34], mat: MATS.fabric2 });
    }
    return g;
  }
  function bed(parent, x, z) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); (parent || app.root).addChild(g);
    box(g, { pos: [0, 0.28, 0], scale: [2.1, 0.4, 2.3], mat: MATS.wood });
    box(g, { pos: [0, 0.55, 0.1], scale: [2.0, 0.25, 2.1], mat: MATS.marbleWhite }); // mattress
    box(g, { pos: [0, 0.6, 0.5], scale: [2.0, 0.18, 1.2], mat: MATS.fabric }); // duvet fold
    box(g, { pos: [0, 0.95, -1.05], scale: [2.2, 1.1, 0.16], mat: MATS.fabric2 }); // headboard
    for (const px of [-0.55, 0.55]) box(g, { pos: [px, 0.72, -0.6], scale: [0.7, 0.22, 0.5], mat: MATS.warm });
    for (const sx of [-1.4, 1.4]) {
      box(g, { pos: [sx, 0.3, -0.7], scale: [0.55, 0.55, 0.5], mat: MATS.wood });
      prim("cylinder", g, { pos: [sx, 0.75, -0.7], scale: [0.18, 0.35, 0.18], mat: MATS.warm });
    }
    return g;
  }
  function wardrobe(parent, x, z, rot) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    box(g, { pos: [0, 1.2, 0], scale: [2.4, 2.4, 0.6], mat: MATS.woodLight });
    for (let i = 0; i < 4; i++) box(g, { pos: [-0.9 + i * 0.6, 1.2, 0.31], scale: [0.02, 2.2, 0.02], mat: MATS.gold });
    return g;
  }
  function tvWall(parent, x, z, rot) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    box(g, { pos: [0, 1.5, 0.06], scale: [4.2, 3.0, 0.12], mat: MATS.wallDark });
    box(g, { pos: [0, 1.5, 0.14], scale: [2.6, 1.5, 0.06], mat: MATS.screen });
    box(g, { pos: [0, 0.3, 0.3], scale: [3.4, 0.5, 0.5], mat: MATS.wood });
    box(g, { pos: [0, 0.58, 0.3], scale: [3.4, 0.02, 0.5], mat: MATS.warm });
    for (let i = -1; i <= 1; i++) box(g, { pos: [i * 1.6, 1.5, 0.13], scale: [0.04, 2.6, 0.02], mat: MATS.gold });
    return g;
  }
  function painting(parent, x, y, z, rot, hue) {
    const g = new pc.Entity(); g.setLocalPosition(x, y, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    box(g, { pos: [0, 0, 0], scale: [1.3, 0.95, 0.06], mat: MATS.gold });
    const art = box(g, { pos: [0, 0, 0.04], scale: [1.15, 0.8, 0.04], mat: M({ map: artTex(hue), gloss: 0.3, color: [1, 1, 1] }) });
    return g;
  }
  function plant(parent, x, z, s = 1) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); (parent || app.root).addChild(g);
    prim("cylinder", g, { pos: [0, 0.3 * s, 0], scale: [0.4 * s, 0.6 * s, 0.4 * s], mat: MATS.marbleWhite });
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * 6.28;
      prim("cone", g, { pos: [Math.cos(a) * 0.18 * s, (0.9 + i * 0.12) * s, Math.sin(a) * 0.18 * s], scale: [0.5 * s, 1.0 * s, 0.5 * s], mat: MATS.plant });
    }
    prim("cone", g, { pos: [0, 1.4 * s, 0], scale: [0.5 * s, 1.1 * s, 0.5 * s], mat: MATS.plant });
    return g;
  }
  function chandelier(parent, x, z, y = 3.0) {
    const g = new pc.Entity(); g.setLocalPosition(x, y, z); (parent || app.root).addChild(g);
    prim("cylinder", g, { pos: [0, 0.4, 0], scale: [0.03, 0.8, 0.03], mat: MATS.gold });
    prim("torus", g, { pos: [0, 0, 0], scale: [1, 1, 1], mat: MATS.gold });
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.28;
      prim("sphere", g, { pos: [Math.cos(a) * 0.5, -0.1, Math.sin(a) * 0.5], scale: [0.16, 0.16, 0.16], mat: MATS.warm });
    }
    return g;
  }
  function curtain(parent, x, z, rot, w = 2.2) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    for (let i = 0; i < 6; i++) box(g, { pos: [-w / 2 + i * (w / 5), 1.7, 0], scale: [w / 9, 2.6, 0.08], mat: MATS.fabric2 });
    return g;
  }
  function stairs(parent, x, z, rot) {
    const g = new pc.Entity(); g.setLocalPosition(x, 0, z); g.setEulerAngles(0, rot, 0); (parent || app.root).addChild(g);
    for (let i = 0; i < 8; i++) box(g, { pos: [0, 0.15 + i * 0.22, -i * 0.3], scale: [1.8, 0.22, 0.32], mat: MATS.marbleWhite });
    box(g, { pos: [0.95, 1.0, -1.0], scale: [0.06, 1.2, 3.0], mat: MATS.glass });
    box(g, { pos: [0.95, 1.6, -1.0], scale: [0.08, 0.08, 3.0], mat: MATS.gold });
    return g;
  }

  /* ---------- walls + shell ---------- */
  function wallSeg(x1, z1, x2, z2, h, mat, collide = true, thick = 0.16) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, ang = Math.atan2(dx, dz) * 180 / Math.PI;
    const e = new pc.Entity();
    e.addComponent("render", { type: "box" });
    e.render.meshInstances.forEach((mi) => (mi.material = mat));
    e.render.castShadows = true; e.render.receiveShadows = true;
    e.setLocalScale(thick, h, len);
    e.setLocalPosition(cx, h / 2, cz);
    e.setEulerAngles(0, ang, 0);
    app.root.addChild(e);
    if (collide) state.walls.push({ x1, z1, x2, z2 });
    return e;
  }
  function windowOnWall(x1, z1, x2, z2, mat) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, ang = Math.atan2(dx, dz) * 180 / Math.PI;
    const e = new pc.Entity(); e.addComponent("render", { type: "box" });
    e.render.meshInstances.forEach((mi) => (mi.material = mat));
    e.setLocalScale(0.06, 1.8, len); e.setLocalPosition(cx, 1.7, cz); e.setEulerAngles(0, ang, 0);
    e.render.castShadows = false;
    app.root.addChild(e);
  }

  function buildHouse() {
    buildMats();
    const H = 3.2;
    // floor + ceiling
    box(null, { pos: [0, -0.05, 1], scale: [14, 0.1, 14], mat: MATS.floor });
    box(null, { pos: [0, H + 0.05, 1], scale: [14, 0.1, 14], mat: MATS.ceiling, shadow: false });
    // cove light strips on ceiling
    for (const cz of [-3, 1, 5]) box(null, { pos: [0, H - 0.06, cz], scale: [10, 0.04, 0.18], mat: MATS.warm, shadow: false });

    // outer walls (with south doorway gap x -3..-1)
    wallSeg(-7, 8, -3, 8, H, MATS.wall);
    wallSeg(-1, 8, 7, 8, H, MATS.wall);
    wallSeg(-7, -6, 7, -6, H, MATS.wall);
    wallSeg(-7, -6, -7, 8, H, MATS.wall);
    wallSeg(7, -6, 7, 8, H, MATS.wall);
    // bedroom partition (room x 2.5..7, z 4..8) with doorway gap z 5.4..6.6
    wallSeg(2.5, 4, 2.5, 5.4, H, MATS.wall);
    wallSeg(2.5, 6.6, 2.5, 8, H, MATS.wall);
    wallSeg(2.5, 4, 7, 4, H, MATS.wall);
    // accent feature wall behind TV (west)
    wallSeg(-6.9, 0.5, -6.9, 3.5, H, MATS.wallDark, false, 0.04);

    // glowing windows
    windowOnWall(-6.95, -5, -6.95, -2, MATS.window);
    windowOnWall(-2, -5.9, 2, -5.9, MATS.window);
    windowOnWall(6.95, -3, 6.95, 0, MATS.window);
    curtain(null, -6.7, -3.5, 90, 2.6);
    curtain(null, 6.7, -1.5, -90, 2.6);

    // ---- formal living (center-west) ----
    prim("plane", null, { pos: [-3, 0.02, 2], scale: [4.5, 1, 3.2], mat: MATS.rug, shadow: false });
    tvWall(null, -6.8, 2, 90);
    sofa(null, -3, 3.6, 180, 2.8, MATS.fabric);
    sofa(null, -5.0, 2, 90, 2.2, MATS.fabric);
    coffeeTable(null, -3, 2);
    plant(null, -6, 6.5, 1.1);
    chandelier(null, -3, 2, 3.0);
    painting(null, -3, 1.9, 7.9, 180, ["#243044", "#0f1726"]);

    // ---- dining (east-center) ----
    diningSet(null, 4.2, 1);
    chandelier(null, 4.2, 1, 3.0);
    painting(null, 6.9, 1.9, 0.5, -90, ["#3a2740", "#160f1e"]);

    // ---- kitchen (north) ----
    kitchen(null);
    plant(null, -6.2, -5, 1.0);

    // ---- foyer ----
    stairs(null, 1.4, 6.9, 180);
    plant(null, -6.3, 7.2, 1.2);
    painting(null, 0, 1.9, -5.9, 0, ["#243a36", "#0f1d1a"]);

    // ---- bedroom (SE room) ----
    prim("plane", null, { pos: [4.75, 0.02, 6], scale: [3.5, 1, 3.0], mat: MATS.rug, shadow: false });
    bed(null, 4.75, 5.4);
    wardrobe(null, 6.5, 6.2, -90);
    chandelier(null, 4.75, 6, 3.0);
    painting(null, 4.75, 1.9, 7.9, 180, ["#2a3344", "#11161f"]);
    plant(null, 3.1, 7.4, 0.9);

    // room zones for the label
    state.rooms = [
      { name: "Master Bedroom", x1: 2.5, z1: 4, x2: 7, z2: 8 },
      { name: "Open Kitchen", x1: -7, z1: -6, x2: 0, z2: -2.2 },
      { name: "Dining Area", x1: 1, z1: -2, x2: 7, z2: 3.8 },
      { name: "Formal Living", x1: -7, z1: -2, x2: 0.8, z2: 5 },
      { name: "Entrance Foyer", x1: -7, z1: 5, x2: 2.4, z2: 8 }
    ];
  }

  /* ---------- lighting ---------- */
  function buildLights() {
    app.scene.ambientLight = new pc.Color(0.42, 0.39, 0.35);
    if (app.scene.fog) { app.scene.fog = pc.FOG_NONE; }
    const sun = new pc.Entity();
    sun.addComponent("light", {
      type: "directional", color: new pc.Color(1, 0.88, 0.66), intensity: 1.3,
      castShadows: true, shadowResolution: 2048, shadowBias: 0.04, normalOffsetBias: 0.06,
      shadowDistance: 30, shadowType: pc.SHADOW_PCF3
    });
    sun.setEulerAngles(52, -125, 0);
    app.root.addChild(sun);
    const spots = [[-3, 2], [4.2, 1], [-3, -4], [4.75, 6], [-3, 6.5], [0, 7]];
    for (const [x, z] of spots) {
      const o = new pc.Entity();
      o.addComponent("light", { type: "omni", color: new pc.Color(1, 0.87, 0.64), intensity: 0.85, range: 8 });
      o.setLocalPosition(x, 2.9, z);
      app.root.addChild(o);
    }
  }

  /* ---------- collision ---------- */
  function collide(nx, nz) {
    const r = 0.34;
    let px = nx, pz = nz;
    for (const w of state.walls) {
      const dx = w.x2 - w.x1, dz = w.z2 - w.z1;
      const l2 = dx * dx + dz * dz || 1;
      let t = ((px - w.x1) * dx + (pz - w.z1) * dz) / l2;
      t = Math.max(0, Math.min(1, t));
      const cx = w.x1 + t * dx, cz = w.z1 + t * dz;
      const ddx = px - cx, ddz = pz - cz, d = Math.hypot(ddx, ddz);
      if (d < r && d > 1e-4) { px += (ddx / d) * (r - d); pz += (ddz / d) * (r - d); }
    }
    return [px, pz];
  }
  function roomAt(x, z) {
    for (const r of state.rooms)
      if (x >= r.x1 && x <= r.x2 && z >= r.z1 && z <= r.z2) return r.name;
    return "Show Home";
  }

  /* ---------- input ---------- */
  function bindInput() {
    window.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      state.keys[e.code] = true;
      if (e.code === "ShiftLeft") state.run = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      state.keys[e.code] = false;
      if (e.code === "ShiftLeft") state.run = false;
    });
    // desktop pointer-lock look
    canvas.addEventListener("click", () => {
      if (!isTouch()) canvas.requestPointerLock && canvas.requestPointerLock();
    });
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === canvas) {
        state.yaw -= e.movementX * 0.12;
        state.pitch = Math.max(-80, Math.min(80, state.pitch - e.movementY * 0.12));
      }
    });
    // touch: left third = joystick, rest = look
    canvas.addEventListener("touchstart", (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX < window.innerWidth * 0.4 && state.moveTouchId === null) {
          state.moveTouchId = t.identifier;
          state.joyOrigin = { x: t.clientX, y: t.clientY };
          joyBase.style.display = "block";
          joyBase.style.left = t.clientX + "px"; joyBase.style.top = t.clientY + "px";
        } else if (state.lookTouchId === null) {
          state.lookTouchId = t.identifier; state.lookStart = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: true });
    canvas.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === state.moveTouchId) {
          const dx = t.clientX - state.joyOrigin.x, dy = t.clientY - state.joyOrigin.y;
          const max = 55, d = Math.min(max, Math.hypot(dx, dy)) || 0;
          const a = Math.atan2(dy, dx);
          state.moveVec.x = Math.cos(a) * (d / max);
          state.moveVec.y = Math.sin(a) * (d / max);
          joyKnob.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`;
        } else if (t.identifier === state.lookTouchId) {
          state.yaw -= (t.clientX - state.lookStart.x) * 0.25;
          state.pitch = Math.max(-80, Math.min(80, state.pitch - (t.clientY - state.lookStart.y) * 0.25));
          state.lookStart = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: true });
    const endTouch = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === state.moveTouchId) {
          state.moveTouchId = null; state.moveVec.x = state.moveVec.y = 0;
          joyBase.style.display = "none"; joyKnob.style.transform = "translate(0,0)";
        }
        if (t.identifier === state.lookTouchId) state.lookTouchId = null;
      }
    };
    canvas.addEventListener("touchend", endTouch);
    canvas.addEventListener("touchcancel", endTouch);
  }
  const isTouch = () => window.matchMedia("(hover: none)").matches;

  /* ---------- update loop ---------- */
  function tick(dt) {
    if (!state.pos) return;
    const k = state.keys;
    let f = 0, s = 0;
    if (k.KeyW || k.ArrowUp) f += 1;
    if (k.KeyS || k.ArrowDown) f -= 1;
    if (k.KeyD || k.ArrowRight) s += 1;
    if (k.KeyA || k.ArrowLeft) s -= 1;
    if (state.moveTouchId !== null) { f -= state.moveVec.y; s += state.moveVec.x; }
    const speed = (state.run ? 5.2 : 2.7) * dt;
    const yr = state.yaw * Math.PI / 180;
    const sin = Math.sin(yr), cos = Math.cos(yr);
    // forward is -Z in PlayCanvas
    let mx = (-sin * f + cos * s);
    let mz = (-cos * f - sin * s);
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const p = state.pos;
    const [cx, cz] = collide(p.x + mx * speed, p.z + mz * speed);
    p.x = Math.max(-6.6, Math.min(6.6, cx));
    p.z = Math.max(-5.6, Math.min(7.6, cz));
    camRoot.setLocalPosition(p.x, 1.65, p.z);
    camRoot.setLocalEulerAngles(state.pitch, state.yaw, 0);
    const rn = roomAt(p.x, p.z);
    if (rn !== state.curRoom) { state.curRoom = rn; roomLabel.textContent = rn; }
  }

  /* ---------- lifecycle ---------- */
  function ensureApp() {
    if (app) return;
    app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      keyboard: new pc.Keyboard(window)
    });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
    camRoot = new pc.Entity("camRoot");
    cam = new pc.Entity("cam");
    cam.addComponent("camera", { fov: 70, clearColor: new pc.Color(0.04, 0.05, 0.08), nearClip: 0.05, farClip: 60 });
    if (cam.camera.toneMapping !== undefined) cam.camera.toneMapping = pc.TONEMAP_ACES;
    if (cam.camera.gammaCorrection !== undefined) cam.camera.gammaCorrection = pc.GAMMA_SRGB;
    camRoot.addChild(cam);
    app.root.addChild(camRoot);
    buildLights();
    buildHouse();
    bindInput();
    app.on("update", tick);
    app.start();
    window.addEventListener("resize", () => app.resizeCanvas());
  }

  async function open() {
    overlay.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
    loader.style.display = "flex";
    try {
      await loadEngine();
      ensureApp();
      // reset spawn at the foyer looking into the house (toward -Z)
      state.pos = { x: -1.5, y: 1.65, z: 7.0 };
      state.yaw = 0; state.pitch = -4;
      state.curRoom = ""; roomLabel.textContent = "Entrance Foyer";
      app.resizeCanvas();
      loader.style.display = "none";
    } catch (e) {
      loader.innerHTML = "<p>3D engine couldn't load on this connection.<br>Please try again on Wi-Fi.</p>";
    }
  }
  function close() {
    overlay.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    if (document.pointerLockElement) document.exitPointerLock();
    if (window.__lenis) window.__lenis.start();
  }

  document.getElementById("tourClose").addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("is-open")) close(); });

  window.HouseTour = { open, close };
})();
