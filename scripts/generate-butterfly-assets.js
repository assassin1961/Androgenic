#!/usr/bin/env node
// Generates the Butterfly app icon set procedurally (no image deps):
// a white butterfly mark on the brand pink gradient.
// Writes assets/icon.png, adaptive-icon.png, splash-icon.png, favicon.png.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Minimal PNG encoder ─────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Geometry helpers ────────────────────────────────────────────────
// Signed coverage of a rotated ellipse: returns true if (x,y) inside.
function inEllipse(x, y, cx, cy, rx, ry, rot) {
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const dx = x - cx, dy = y - cy;
  const lx = (dx * cos + dy * sin) / rx;
  const ly = (-dx * sin + dy * cos) / ry;
  return lx * lx + ly * ly <= 1;
}

// The butterfly mark: 4 wing ellipses + body, defined in unit space (0..1)
function butterflyHit(u, v) {
  // upper wings — big, angled outward
  if (inEllipse(u, v, 0.330, 0.400, 0.190, 0.130, -0.65)) return true;
  if (inEllipse(u, v, 0.670, 0.400, 0.190, 0.130, 0.65)) return true;
  // lower wings — smaller, angled down
  if (inEllipse(u, v, 0.385, 0.625, 0.130, 0.100, 0.55)) return true;
  if (inEllipse(u, v, 0.615, 0.625, 0.130, 0.100, -0.55)) return true;
  // body — vertical capsule
  if (inEllipse(u, v, 0.5, 0.50, 0.035, 0.180, 0)) return true;
  // head
  if (inEllipse(u, v, 0.5, 0.295, 0.040, 0.040, 0)) return true;
  return false;
}

// Antennae as thin line segments (distance to segment)
function distSeg(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const px = x1 + t * dx, py = y1 + t * dy;
  return Math.hypot(x - px, y - py);
}
function antennaeHit(u, v) {
  return (
    distSeg(u, v, 0.488, 0.272, 0.430, 0.180) < 0.011 ||
    distSeg(u, v, 0.512, 0.272, 0.570, 0.180) < 0.011 ||
    Math.hypot(u - 0.430, v - 0.180) < 0.022 ||
    Math.hypot(u - 0.570, v - 0.180) < 0.022
  );
}

function lerp(a, b, t) { return a + (b - a) * t; }

// gradient: brand pink, top-left light → bottom-right deep
const G0 = [0xff, 0x5c, 0x7c]; // #FF5C7C
const G1 = [0xe1, 0x1d, 0x48]; // #E11D48

function render(size, { transparentBg = false, markScale = 1, white = true } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 2; // 2x2 supersampling
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let cov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // unit coords, mark centered with optional scale-down
          let u = (x + (sx + 0.5) / SS) / size;
          let v = (y + (sy + 0.5) / SS) / size;
          u = 0.5 + (u - 0.5) / markScale;
          v = 0.5 + (v - 0.5) / markScale;
          if (butterflyHit(u, v) || antennaeHit(u, v)) cov++;
        }
      }
      cov /= SS * SS;
      const t = (x / size + y / size) / 2;
      const bg = transparentBg
        ? [0, 0, 0, 0]
        : [lerp(G0[0], G1[0], t), lerp(G0[1], G1[1], t), lerp(G0[2], G1[2], t), 255];
      const fg = white ? [255, 255, 255, 255] : [...G1, 255];
      const i = (y * size + x) * 4;
      // composite mark over bg
      const a = cov;
      rgba[i] = Math.round(lerp(bg[0], fg[0], a));
      rgba[i + 1] = Math.round(lerp(bg[1], fg[1], a));
      rgba[i + 2] = Math.round(lerp(bg[2], fg[2], a));
      rgba[i + 3] = transparentBg ? Math.round(Math.max(bg[3], a * 255)) : 255;
    }
  }
  return encodePNG(size, size, rgba);
}

const out = path.join(__dirname, '..', 'assets');
fs.writeFileSync(path.join(out, 'icon.png'), render(1024, { markScale: 1.15 }));
fs.writeFileSync(path.join(out, 'adaptive-icon.png'), render(1024, { transparentBg: true, markScale: 0.72 }));
fs.writeFileSync(path.join(out, 'splash-icon.png'), render(1024, { transparentBg: true, markScale: 0.9, white: false }));
fs.writeFileSync(path.join(out, 'favicon.png'), render(64, { markScale: 1.15 }));
console.log('Wrote icon.png, adaptive-icon.png, splash-icon.png, favicon.png');
