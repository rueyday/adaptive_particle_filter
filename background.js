const canvas = document.getElementById("bg-canvas");
const ctx    = canvas.getContext("2d");
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildHexCanvas();
}

const PALETTE = [
  [68,  110, 255],
  [120,  60, 255],
  [0,   180, 230],
  [168,  85, 247],
  [0,   210, 180],
  [90,  140, 255],
];
const C_BLUE = [60,  150, 255];
const C_CYAN = [0,   215, 225];

function pickTwo() {
  const a = Math.floor(Math.random() * PALETTE.length);
  let b;
  do { b = Math.floor(Math.random() * PALETTE.length); } while (b === a);
  return [PALETTE[a], PALETTE[b]];
}

function lerp(cA, cB, t) {
  return [
    (cA[0] + (cB[0] - cA[0]) * t) | 0,
    (cA[1] + (cB[1] - cA[1]) * t) | 0,
    (cA[2] + (cB[2] - cA[2]) * t) | 0,
  ];
}

const startTime  = performance.now();
const INTRO_DUR  = 2800;
const INTRO_MULT = 9;

function speedMult(now) {
  const e = now - startTime;
  if (e >= INTRO_DUR) return 0.88 + 0.12 * Math.sin(e * 0.00028);
  return 1 + (INTRO_MULT - 1) * Math.pow(1 - e / INTRO_DUR, 3);
}

function rx(px, py, pz, c, s) { return [px,      py*c - pz*s, py*s + pz*c]; }
function ry(px, py, pz, c, s) { return [px*c + pz*s, py, -px*s + pz*c];     }
function rz(px, py, pz, c, s) { return [px*c - py*s, px*s + py*c, pz];      }
const FOV = 900;

class Shape {
  constructor() { this.spawn(true); }

  spawn(initial = false) {
    const pad = 300;
    this.x = initial ? Math.random() * W : (Math.random() < 0.5 ? -pad : W + pad);
    this.y = initial ? Math.random() * H : (Math.random() < 0.5 ? -pad : H + pad);
    this.n    = Math.floor(Math.random() * 5) + 7;
    this.size = Math.random() * 130 + 90;
    this.rzA  = Math.random() * Math.PI * 2; this.rzS = (Math.random() - 0.5) * 0.0006;
    this.rxA  = Math.random() * Math.PI * 2; this.rxS = (Math.random() - 0.5) * 0.0005;
    this.ryA  = Math.random() * Math.PI * 2; this.ryS = (Math.random() - 0.5) * 0.0007;
    const a = Math.random() * Math.PI * 2, spd = Math.random() * 0.18 + 0.06;
    this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd;
    [this.cA, this.cB] = pickTwo();
    this.vc = Array.from({ length: this.n }, (_, i) => lerp(this.cA, this.cB, i / (this.n - 1)));
  }

  update(m) {
    this.x += this.vx * m; this.y += this.vy * m;
    this.rzA += this.rzS * m; this.rxA += this.rxS * m; this.ryA += this.ryS * m;
    const p = this.size * 2;
    if (this.x < -p || this.x > W + p || this.y < -p || this.y > H + p) this.spawn();
  }

  verts() {
    const cX = Math.cos(this.rxA), sX = Math.sin(this.rxA);
    const cY = Math.cos(this.ryA), sY = Math.sin(this.ryA);
    const cZ = Math.cos(this.rzA), sZ = Math.sin(this.rzA);
    return Array.from({ length: this.n }, (_, i) => {
      const a = (i / this.n) * Math.PI * 2 - Math.PI / 2;
      let [px, py, pz] = [Math.cos(a) * this.size, Math.sin(a) * this.size, 0];
      [px, py, pz] = rz(px, py, pz, cZ, sZ);
      [px, py, pz] = rx(px, py, pz, cX, sX);
      [px, py, pz] = ry(px, py, pz, cY, sY);
      const sc = FOV / (FOV + pz);
      return [this.x + px * sc, this.y + py * sc, pz];
    });
  }

  draw() {
    const n = this.n, pts = this.verts(), mz = this.size;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ad    = Math.min(j - i, n - (j - i));
        const ba    = Math.max(0.04, 0.45 / Math.pow(ad, 1.8));
        const lw    = ad === 1 ? 1.1 : Math.max(0.3, 0.7 / ad);
        const depth = (pts[i][2] + pts[j][2]) / 2;
        const alpha = Math.min(0.9, ba * (1 - depth / (mz * 2)));
        const [x1, y1] = pts[i], [x2, y2] = pts[j];
        const [r1, g1, b1] = this.vc[i], [r2, g2, b2] = this.vc[j];
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
        g.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = g; ctx.lineWidth = lw; ctx.stroke();
      }
    }
  }
}

let hexCanvas = null;

function buildHexCanvas() {
  hexCanvas = document.createElement("canvas");
  hexCanvas.width = W; hexCanvas.height = H;
  const hc = hexCanvas.getContext("2d");
  const r  = 42;
  const cw = Math.sqrt(3) * r, rh = 1.5 * r;
  hc.strokeStyle = "rgba(60, 150, 255, 1)";
  hc.lineWidth   = 0.5;
  for (let row = -1, rows = Math.ceil(H / rh) + 3; row < rows; row++) {
    for (let col = -1, cols = Math.ceil(W / cw) + 3; col < cols; col++) {
      const ox = (row % 2 !== 0) ? cw / 2 : 0;
      const cx = col * cw + ox, cy = row * rh;
      hc.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        hc.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      hc.closePath(); hc.stroke();
    }
  }
}

function drawHexGrid(t) {
  if (!hexCanvas) return;
  ctx.globalAlpha = 0.030 + 0.015 * Math.sin(t * 0.0004);
  ctx.drawImage(hexCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

function drawCornerBrackets() {
  const sz = 38, mg = 20;
  const [r, g, b] = C_CYAN;
  ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`;
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
  ctx.shadowBlur  = 7;
  [
    [mg,     mg,      1,  1],
    [W - mg, mg,     -1,  1],
    [mg,     H - mg,  1, -1],
    [W - mg, H - mg, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * sz, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * sz);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

class RingSystem {
  constructor(fx, fy, scale = 1) {
    this.fx = fx; this.fy = fy;
    this.vx = (Math.random() - 0.5) * 0.00006;
    this.vy = (Math.random() - 0.5) * 0.00006;
    this.rings = [
      { r: 65  * scale, rot: Math.random() * Math.PI * 2, spd:  0.0008, arcs: 3, col: C_CYAN },
      { r: 112 * scale, rot: Math.random() * Math.PI * 2, spd: -0.0005, arcs: 4, col: C_BLUE },
      { r: 162 * scale, rot: Math.random() * Math.PI * 2, spd:  0.0003, arcs: 2, col: C_BLUE },
    ];
  }

  update(m) {
    this.fx += this.vx * m; this.fy += this.vy * m;
    if (this.fx < 0.12 || this.fx > 0.88) this.vx *= -1;
    if (this.fy < 0.12 || this.fy > 0.88) this.vy *= -1;
    this.rings.forEach(ring => { ring.rot += ring.spd * m; });
  }

  draw() {
    const x = this.fx * W, y = this.fy * H;

    this.rings.forEach(ring => {
      const [r, g, b]  = ring.col;
      const segA       = (Math.PI * 2) / ring.arcs;
      const arcLen     = segA * 0.65;
      const alpha      = ring.r > 100 ? 0.22 : 0.38;
      
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.shadowBlur  = 6;
      for (let i = 0; i < ring.arcs; i++) {
        const start = ring.rot + i * segA;
        ctx.beginPath();
        ctx.arc(x, y, ring.r, start, start + arcLen);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 1.3;
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      const ticks = ring.arcs * 10;
      for (let i = 0; i < ticks; i++) {
        const angle = ring.rot + (i / ticks) * Math.PI * 2;
        const major = i % 10 === 0;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * (ring.r - (major ? 9 : 4)),
                   y + Math.sin(angle) * (ring.r - (major ? 9 : 4)));
        ctx.lineTo(x + Math.cos(angle) * ring.r,
                   y + Math.sin(angle) * ring.r);
        ctx.strokeStyle = `rgba(${r},${g},${b},${major ? 0.45 : 0.15})`;
        ctx.lineWidth   = major ? 1.0 : 0.4;
        ctx.stroke();
      }
    });
    
    const [r, g, b] = C_CYAN;
    ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
    ctx.lineWidth   = 0.7;
    ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke();
  }
}

class PulseRing {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = initial ? Math.random() * 100 : 0;
    this.maxR = Math.random() * 140 + 60;
    this.spd  = Math.random() * 0.4 + 0.2;
    this.col  = Math.random() < 0.5 ? C_BLUE : C_CYAN;
  }

  update(m) {
    this.r += this.spd * m;
    if (this.r >= this.maxR) this.reset();
  }

  draw() {
    const alpha = 0.28 * (1 - this.r / this.maxR);
    if (alpha < 0.01) return;
    const [r, g, b] = this.col;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth   = 0.8;
    ctx.stroke();
  }
}

const STAR_COUNT = 120;
const stars = [];

function initStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 0.9 + 0.2,
      base: Math.random() * 0.28 + 0.08,
      ts: Math.random() * 0.001 + 0.0003,
      to: Math.random() * Math.PI * 2,
    });
  }
}

resize();
initStars();
window.addEventListener("resize", () => { resize(); initStars(); });

const shapes = Array.from({ length: 4 }, () => new Shape());
const rings  = [new RingSystem(0.28, 0.32), new RingSystem(0.72, 0.68, 1.45)];
const pulses = Array.from({ length: 5 },  () => new PulseRing());

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    const a = s.base * (0.5 + 0.5 * Math.sin(t * s.ts + s.to));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210, 225, 255, ${a})`;
    ctx.fill();
  });

  drawHexGrid(t);
  drawCornerBrackets();

  const m = speedMult(t);

  pulses.forEach(p => { p.update(m); p.draw(); });
  rings.forEach(ring => { ring.update(m); ring.draw(); });
  shapes.forEach(s => { s.update(m); s.draw(); });

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
