/* Sprites: pose-driven pixel characters (male + female) with outline, hair physics, slash FX and floor reflection. */
(function () {
  const OX = 64, OY = 100, SW = 128, SH = 112, RH = 150;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  const [spr, sc] = mk(SW, SH), [sil, silc] = mk(SW, SH), [out, oc] = mk(SW, SH), [refl, rc] = mk(SW, RH);
  const R = Math.round;
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);

  const OUTLINE = 'rgba(30,18,22,0.6)';
  const HERO = {
    m: {
      leg: 9.5, torso: 13, skin: '#f1cdb0', skinD: '#d3a688', hair: '#3b2a25', hairL: '#5b4237', hairD: '#241817', shirt: '#f1eee9', shirtD: '#c9c4c4',
      vest: '#8e4b2b', vestL: '#ad6238', vestD: '#5f301b', pants: '#2b2b32', pantsL: '#40404a', pantsD: '#1a1a20', shoe: '#1c1b20', shoeL: '#3a3944', long: false
    },
    f: {
      leg: 8, torso: 11, skin: '#f6d3c6', skinD: '#dba99b', hair: '#1b1722', hairL: '#4b4a6e', hairD: '#100d16', dress: '#f4f2f7', dressD: '#cbc9db', dressL: '#ffffff',
      shoe: '#e9e7ef', shoeD: '#a8a6b8', long: true
    }
  };

  let H = HERO.m;
  const P = (x, y, w, h, c) => { sc.fillStyle = c; sc.fillRect(R(OX + x), R(OY + y), w, h); };
  const L = (x1, y1, x2, y2, th, c) => {
    sc.fillStyle = c;
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1) * 1.2;
    for (let i = 0; i <= n; i++) { const t = i / n; sc.fillRect(R(OX + x1 + (x2 - x1) * t - th / 2), R(OY + y1 + (y2 - y1) * t - th / 2), th, th); }
  };
  /* two-bone IK in right-facing space. s = -1 knee/elbow forward, +1 back */
  function ik(x1, y1, x2, y2, l1, l2, s) {
    let dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.01;
    const mx = l1 + l2 - 0.3;
    if (d > mx) { x2 = x1 + dx / d * mx; y2 = y1 + dy / d * mx; dx = x2 - x1; dy = y2 - y1; d = mx; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return { kx: x1 + dx * a / d + (-dy / d) * h * s, ky: y1 + dy * a / d + (dx / d) * h * s, x: x2, y: y2 };
  }

  /* ---- attack definitions ---- */
  const ATK = {
    s1:   { dur: 0.30, lo: 0.30, hi: 0.78, reach: 38, col: ['#ffffff', '#7fe9ff'] },
    s2:   { dur: 0.30, lo: 0.28, hi: 0.78, reach: 38, col: ['#ffffff', '#ff9ac0'] },
    s3:   { dur: 0.46, lo: 0.40, hi: 0.80, reach: 56, col: ['#ffffff', '#ff3355'] },
    down: { dur: 0.34, lo: 0.25, hi: 0.95, reach: 44, col: ['#ffffff', '#ff3355'] },
    stab: { dur: 0.32, lo: 0.30, hi: 0.70, reach: 58, col: ['#ffffff', '#7fe9ff'] },
    kick: { dur: 0.32, lo: 0.30, hi: 0.72, reach: 40, col: ['#ffffff', '#ffd27f'] },
    dstab: { dur: 0.4, lo: 0.12, hi: 0.95, reach: 30, col: ['#ffffff', '#7fe9ff'] },
    dash: { dur: 0.24, lo: 0.0, hi: 1.0, reach: 36, col: ['#ffffff', '#7fe9ff'] }
  };

  /* ---- pose ---- */
  function pose(p, t) {
    const o = pose0(p, t), K = H.leg / 8, dy = o.hy * (K - 1) - (H.torso - 11) * Math.cos(o.lean);
    o.hy *= K; if (o.ha) o.ha = [o.ha[0], o.ha[1] + dy]; if (o.hb) o.hb = [o.hb[0], o.hb[1] + dy];
    return o;
  }
  function pose0(p, t) {
    const o = { hx: 0, hy: -16, lean: 0.05, hd: 0, fa: [5, 0], fb: [-3, 0], ha: null, hb: null, armed: false, ang: 0, blen: 22, sa: 1, sb: 1, face: 'n', hair: 0.3, skirt: 0, blade: null, shut: false };
    let ph = p.ph || 0; const moving = Math.abs(p.vx) > 6 && p.ground, running = moving && p.run, air = !p.ground;
    if (running) ph = Math.floor(ph / (Math.PI / 4)) * (Math.PI / 4); // 8-frame run cycle
    const a = p.atk; let u = a ? clamp(1 - p.slash / a.dur, 0, 1) : 0;
    const arm = (sh, ang, r) => [sh.x + Math.cos(ang) * r, sh.y + Math.sin(ang) * r];
    const sh0 = () => ({ x: o.hx + Math.sin(o.lean) * 11, y: o.hy - Math.cos(o.lean) * 11 });
    if (p.hurt) {
      o.lean = -0.32; o.hy = -15; o.fa = [6, 0]; o.fb = [-6, 0]; o.face = 'hurt'; o.hair = 1.4;
      const sh = sh0(); o.ha = [sh.x + 9, sh.y - 1]; o.hb = [sh.x - 8, sh.y + 2]; o.sa = -1; return o;
    }
    if (p.vic) {
      const b = Math.abs(Math.sin(t * 5)) * 0.8;
      o.hy = -15.5 - b * 0.5; o.lean = -0.1; o.fa = [7, 0]; o.fb = [-7, 0]; o.face = 'happy'; o.armed = true;
      const sh = sh0(); o.ha = [sh.x + 4, sh.y - 12]; o.sa = -1; o.ang = -1.35 + Math.sin(t * 4) * 0.05; o.blen = 24;
      o.hb = [o.hx - 5, o.hy - 2]; o.sb = 1; o.hair = 0.9; return o;
    }
    if (a && p.slash > 0) {
      o.armed = a.type !== 'kick'; o.face = 'fierce';
      const ty = a.type;
      if (ty === 's1') {
        const w = u < 0.25 ? ease(u / 0.25) : 1, sw = u < 0.25 ? 0 : ease(clamp((u - 0.25) / 0.45, 0, 1));
        o.lean = lerp(-0.12, 0.38, u < 0.25 ? 0 : sw) * (u < 0.25 ? w + 0.0 : 1) + (u < 0.25 ? -0.0 : 0);
        o.lean = u < 0.25 ? lerp(0.05, -0.15, w) : lerp(-0.15, 0.4, sw);
        o.hy = -15.5; o.fa = [lerp(5, 10, sw), 0]; o.fb = [lerp(-3, -8, sw), 0];
        const sh = sh0(), an = u < 0.25 ? lerp(-2.0, -2.5, w) : lerp(-2.5, 1.25, sw); o.ang = an; o.sa = -1;
        o.ha = arm(sh, an, 9); o.hb = [sh.x - 4, sh.y + 7];
      } else if (ty === 's2') {
        const sw = ease(clamp((u - 0.2) / 0.5, 0, 1)), w = ease(clamp(u / 0.2, 0, 1));
        o.lean = u < 0.2 ? lerp(0.35, 0.45, w) : lerp(0.45, -0.1, sw); o.hy = u < 0.2 ? -14 : lerp(-13.5, -16, sw);
        o.fa = [lerp(9, 6, sw), 0]; o.fb = [lerp(-8, -4, sw), 0];
        const sh = sh0(), an = u < 0.2 ? 1.35 : lerp(1.35, -2.0, sw); o.ang = an; o.sa = 1;
        o.ha = arm(sh, an, 9); o.hb = [sh.x - 5, sh.y + 5];
      } else if (ty === 's3') {
        const w = ease(clamp(u / 0.42, 0, 1)), sw = ease(clamp((u - 0.38) / 0.45, 0, 1));
        o.lean = u < 0.4 ? lerp(0.1, -0.35, w) : lerp(-0.35, 0.55, sw);
        o.hy = u < 0.4 ? lerp(-16, -11, w) : lerp(-11, -15, sw);
        o.fa = [u < 0.4 ? lerp(5, 8, w) : lerp(8, 12, sw), 0]; o.fb = [u < 0.4 ? lerp(-3, -10, w) : lerp(-10, -9, sw), 0];
        const sh = sh0(), an = u < 0.4 ? lerp(-2.7, 3.25, w) : lerp(3.25 - Math.PI * 2, 1.2, sw); o.ang = an; o.blen = 26; o.sa = -1;
        o.ha = arm(sh, an, 9); o.hb = [sh.x - 4, sh.y + 8]; o.hair = 1.2;
      } else if (ty === 'down') {
        const sw = ease(clamp((u - 0.15) / 0.55, 0, 1));
        o.lean = lerp(0.1, 0.62, sw); o.hy = -17; o.fa = [lerp(2, -3, sw), -8]; o.fb = [lerp(-4, -8, sw), -5];
        const sh = sh0(), an = u < 0.15 ? -2.1 : lerp(-2.1, 1.35, sw); o.ang = an; o.blen = 25; o.sa = -1;
        o.ha = arm(sh, an, 9); o.hb = [sh.x - 6, sh.y - 3]; o.hair = 1.5;
      } else if (ty === 'stab') {
        const w = ease(clamp(u / 0.3, 0, 1)), sw = ease(clamp((u - 0.28) / 0.25, 0, 1)), rt = ease(clamp((u - 0.7) / 0.3, 0, 1));
        o.lean = lerp(-0.1, 0.5, sw) * (1 - rt) + 0.05 * rt; o.hy = lerp(-16, -13, sw) * (1 - rt) + -16 * rt;
        o.fa = [lerp(5, 12, sw), 0]; o.fb = [lerp(-3, -10, sw), 0];
        const sh = sh0(), ex = lerp(-5, 13, sw) * (1 - rt) + -2 * rt;
        o.ha = [sh.x + ex, sh.y + 4]; o.ang = 0.04; o.sa = 1; o.blen = 26; o.hb = [sh.x - 6, sh.y + 6]; o.hair = 1.1;
      } else if (ty === 'kick') {
        const w = ease(clamp(u / 0.3, 0, 1)), sw = ease(clamp((u - 0.28) / 0.22, 0, 1)), rt = ease(clamp((u - 0.72) / 0.28, 0, 1));
        const k = (1 - rt) * (u < 0.3 ? w * 0.4 : 0.4 + sw * 0.6);
        o.lean = lerp(0.05, 0.5, k); o.hy = -16; o.fa = [2, 0];
        o.fb = [lerp(-3, -20, k), lerp(0, -16, k)]; o.sb = 1;
        const sh = sh0(); o.ha = [sh.x + 5 + 2 * k, sh.y + 7]; o.hb = [sh.x + 2 + 2 * k, sh.y + 9]; o.sa = 1; o.armed = false; o.hair = 1.3;
      } else if (ty === 'dstab') {
        o.lean = 0.08; o.hy = -17; o.fa = [2, -9]; o.fb = [-4, -6]; o.armed = true; const sh = sh0();
        o.ha = [sh.x + 4, sh.y - 2]; o.ang = Math.PI / 2 - 0.08; o.blen = 27; o.sa = -1; o.hb = [sh.x + 1, sh.y + 2]; o.sb = -1; o.hair = -0.8;
      } else if (ty === 'dash') {
        o.lean = 1.15; o.hy = -20; o.fa = [-6, -9]; o.fb = [-13, -11]; o.armed = true;
        const sh = sh0(); o.ha = [sh.x + 7, sh.y + 3]; o.ang = 0.05; o.blen = 26; o.sa = 1; o.hb = [sh.x - 4, sh.y + 8]; o.hair = 1.6;
      }
      return o;
    }
    if (p.slideT > 0) {
      o.hy = -7.5; o.lean = -0.62; o.fa = [16, -2]; o.fb = [-3, -1]; o.face = 'fierce'; o.armed = true;
      const sh = sh0(); o.ha = [sh.x - 6, sh.y + 5]; o.ang = Math.PI - 0.35; o.sa = 1; o.hb = [sh.x + 8, sh.y + 7]; o.sb = 1; o.hair = 1.5; o.blen = 20;
      return o;
    }
    if (p.landT > 0) {
      o.hy = -9.5; o.lean = 0.28; o.fa = [7, 0]; o.fb = [-6, 0]; const sh = sh0(); o.ha = [sh.x + 7, sh.y + 6]; o.hb = [sh.x - 6, sh.y + 7]; o.sa = 1; o.sb = 1; o.hair = 0.8; o.skirt = 1.2; return o;
    }
    if (air) {
      o.face = p.vy < 0 ? 'fierce' : 'n'; o.armed = false;
      const sh = sh0();
      if (p.vy < 0) { o.lean = 0.12; o.hy = -17; o.fa = [6, -10]; o.fb = [-4, -6]; o.ha = [sh.x + 5, sh.y - 7]; o.hb = [sh.x - 7, sh.y - 2]; o.sa = -1; o.hair = 1.1; }
      else { o.lean = 0.02; o.hy = -17; o.fa = [3, -3]; o.fb = [-3, -1.5]; o.ha = [sh.x + 8, sh.y + 4]; o.hb = [sh.x - 8, sh.y + 3]; o.hair = -0.8; }
      o.skirt = air && p.vy > 0 ? -1.2 : 0.8;
      return o;
    }
    if (running) {
      const st = p.stage || 1, A = 8 + st * 1.5, Lf = 6 + st;
      o.lean = 0.3 + st * 0.07; o.hy = -15 + -Math.abs(Math.sin(ph)) * 2.4; o.face = 'fierce'; o.armed = true;
      o.fa = [Math.sin(ph) * A, -Math.max(0, Math.cos(ph)) * Lf]; o.fb = [Math.sin(ph + Math.PI) * A, -Math.max(0, Math.cos(ph + Math.PI)) * Lf];
      const sh = sh0(); o.ha = [sh.x - 5, sh.y + 6 + Math.sin(ph) * 1.5]; o.ang = Math.PI - 0.1; o.sa = 1; o.blen = 20;
      o.hb = [sh.x + 3 + Math.sin(ph + Math.PI) * 8, sh.y + 7 - Math.abs(Math.sin(ph)) * 3]; o.sb = 1;
      o.hair = 1.3 + st * 0.15; o.skirt = 1.0 + st * 0.2;
      return o;
    }
    if (moving) {
      const sw = Math.sin(ph), cs = Math.cos(ph);
      o.lean = 0.06 + Math.abs(p.vx) / 900; o.hy = -16 + Math.cos(ph * 2) * 0.9; o.hx = sw * 0.5; o.hd = -0.03 * Math.cos(ph * 2); o.face = 'n';
      o.fa = [sw * 9, -Math.max(0, cs) * 4.2]; o.fb = [-sw * 9, -Math.max(0, -cs) * 4.2];
      const sh = sh0(); o.ha = [sh.x - sw * 7, sh.y + 10.5 - Math.abs(sw) * 0.6 + Math.max(0, -sw) * -1]; o.hb = [sh.x + sw * 7, sh.y + 10.5 - Math.abs(sw) * 0.6 + Math.max(0, sw) * -1]; o.sa = 1; o.sb = 1;
      o.hair = 0.2; o.skirt = 0.3 + Math.abs(sw) * 0.2; return o;
    }
    // idle: weight shift, slow breathing, and a cigarette. Hand low most of the time, a drag every ~10s.
    const br = Math.sin(t * 2.3), shift = Math.sin(t * 0.9) * 0.6;
    const cyc = (t + (p.idlePhase || 0)) % 10, sm = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const up = sm(2.6, 3.3, cyc) * (1 - sm(5.6, 6.3, cyc));
    o.hy = -16 + br * 0.5; o.hx = shift * 0.4; o.lean = 0.03 + br * 0.015 - up * 0.02; o.hd = -0.04 * up + 0.05 * (1 - up);
    o.fa = [5 + shift * 0.3, 0]; o.fb = [-4, 0]; o.shut = up > 0.6; o.face = (hash(Math.floor(t * 0.5)) > 0.8 && Math.sin(t * 3) > 0.4) ? 'smirk' : 'n';
    const sh = sh0();
    o.ha = [sh.x + 6 + up * 1.5, sh.y + 9.5 - up * 16.5]; o.hb = [o.hx - 4, o.hy - 1]; o.sa = 1; o.sb = 1; o.hair = 0.02 + br * 0.03; o.skirt = 0.1;
    o.smoke = { up, exh: sm(5.6, 6.0, cyc) * (1 - sm(7.5, 8.3, cyc)) };
    return o;
  }

  /* ---- drawing ---- */
  const E = (cx, cy, rx, ry, c) => {
    sc.fillStyle = c;
    for (let yy = -ry; yy <= ry; yy++) { const half = rx * Math.sqrt(Math.max(0, 1 - (yy / ry) * (yy / ry))); sc.fillRect(R(OX + cx - half), R(OY + cy + yy), Math.max(1, R(half * 2)), 1); }
  };
  function drawBlade(hx, hy, ang, len) {
    const c = Math.cos(ang), s = Math.sin(ang);
    L(hx - c * 4, hy - s * 4, hx + c * 1, hy + s * 1, 2, '#6a1e2a');
    L(hx + c * 1, hy + s * 1, hx + c * (len + 1), hy + s * (len + 1), 2, '#eef2f8');
    L(hx + c * 3, hy + s * 3 + 1, hx + c * len, hy + s * len + 1, 1, '#9aa8bc');
    L(hx + c * 1 - s * 1.5, hy + s * 1 + c * 1.5, hx + c * 1 + s * 1.5, hy + s * 1 - c * 1.5, 1, '#c9a43e');
    P(hx + c * len - 1, hy + s * len - 1, 2, 2, '#ffffff');
  }

  function headDraw(hdx, hdy, o, t) {
    const e = o.face, run = Math.max(0, o.hair), X = (cx, cy, rx, ry, c) => E(hdx + cx, hdy + cy, rx, ry, c), Q = (x, y, w, h, c) => P(hdx + x, hdy + y, w, h, c);
    const blink = hash(Math.floor(t * 1.6)) > 0.94 && e === 'n';
    X(0, 2, 8.6, 8.6, H.skinD); X(1, 0.6, 7.8, 7.8, H.skin);                       // face with soft shade
    if (!H.long) {
      // curly messy hair covering the eyes
      X(-8.5 - run * 2.5, 1, 3.2, 3.4, H.hair); X(-7 - run * 2, 7, 3.2, 3, H.hair); X(-9.5 - run * 3.5, 4, 2.6, 2.6, H.hairL);
      X(-1, -3, 10.8, 8.8, H.hair); X(-5, 3, 6, 7, H.hair); X(2.5, -1.5, 8.2, 5.2, H.hair);
      X(6.5, 3, 2.2, 2.6, H.hair); X(3, 4, 2, 2.2, H.hair); X(-0.5, 3.5, 2, 2.6, H.hairD);
      X(-4, -10, 3.2, 2.6, H.hair); X(3, -10, 3.4, 2.6, H.hair); X(8.5, -6, 2.8, 3.2, H.hair); X(-9, -6, 2.8, 3, H.hair);
      X(-3, -7, 3.6, 1.8, H.hairL); X(4, -6, 3.2, 1.5, H.hairL); X(-8, 2, 1.6, 2.4, H.hairL); X(0, 0, 4.5, 1.6, H.hairD);
      Q(10, 3, 2, 2, H.skin); Q(10, 4, 2, 1, H.skinD);                           // nose peeking below the fringe
      const my = 7;
      if (e === 'happy') { Q(6, my - 1, 5, 3, '#7a2a30'); Q(6, my - 1, 5, 1, '#ffffff'); }
      else if (e === 'hurt') Q(7, my - 1, 3, 3, '#5a1a20');
      else if (e === 'fierce') { Q(6, my, 5, 1, '#6a3a30'); Q(7, my + 1, 3, 1, '#ffffff'); }
      else if (e === 'smirk') { Q(6, my, 4, 1, '#9a5a4a'); Q(10, my - 1, 1, 1, '#9a5a4a'); }
      else Q(7, my, 3, 1, '#9a5a4a');
    } else {
      // long straight black hair, blunt bangs, simple dot eyes
      X(-1, -3, 10.4, 8.2, H.hair); Q(-9, -6, 19, 5, H.hair); Q(-3, -1, 3, 9, H.hair); Q(8, -2, 2, 6, H.hair); Q(7, -3, 3, 2, H.hair);
      X(-4, -8, 4, 1.6, H.hairL); X(3, -7.5, 3, 1.2, H.hairL); Q(-2, -5, 10, 1, H.hairD);
      if (e === 'hurt') { Q(4, 1, 1, 1, '#1a1620'); Q(6, 1, 1, 1, '#1a1620'); Q(5, 2, 1, 1, '#1a1620'); Q(4, 3, 1, 1, '#1a1620'); Q(6, 3, 1, 1, '#1a1620'); }
      else if (e === 'happy') { Q(3, 3, 1, 1, '#1a1620'); Q(4, 2, 2, 1, '#1a1620'); Q(6, 3, 1, 1, '#1a1620'); }
      else if (blink) Q(3, 3, 4, 1, '#1a1620');
      else { Q(4, 1, 2, 3, '#1a1620'); Q(4, 1, 1, 1, '#ffffff'); }
      if (e === 'fierce') Q(3, -1, 5, 1, H.hairD);
      Q(10, 4, 1, 1, H.skinD);
      if (e !== 'hurt') Q(5, 5, 3, 1, '#f1a0a4');
      const my = 7;
      if (e === 'happy') { Q(6, my - 1, 4, 2, '#9a3a44'); Q(6, my - 1, 4, 1, '#ffffff'); }
      else if (e === 'hurt') Q(7, my - 1, 2, 2, '#7a2a30');
      else Q(7, my, 2, 1, '#c4666e');
    }
  }

  function hairBackLong(hdx, hdy, o, t) {
    if (!H.long) return;
    const run = Math.min(0.4, Math.max(0, o.hair) * 0.3); let px = hdx - 7, py = hdy - 1; const n = 11;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), lift = run * 0.9;
      const nx = px - (1.4 + run * 2.4), ny = py + 3.9 - lift * (1.2 + k * 3.4) + Math.sin(t * 4 + i * 0.7) * 0.5 * (0.4 + run * 0.4);
      L(px, py, nx, ny, 9 - k * 4.5, H.hair); L(px + 2, py, nx + 2, ny, 2, H.hairL);
      px = nx; py = ny;
    }
    P(px - 1, py - 1, 4, 3, H.hairD);
  }

  function build(p, t, o) {
    sc.clearRect(0, 0, SW, SH);
    const hx = o.hx, hy = o.hy, sx = hx + Math.sin(o.lean) * H.torso, sy = hy - Math.cos(o.lean) * H.torso;
    const hdx = sx + Math.sin(o.lean * 0.7 + o.hd) * 10, hdy = sy - Math.cos(o.lean * 0.7 + o.hd) * 10.5;
    hairBackLong(hdx, hdy, o, t);
    const male = !H.long;
    const sleeve = male ? H.shirt : H.dress, sleeveD = male ? H.shirtD : H.dressD;
    const armDraw = (tg, s, back) => {
      if (!tg) return null;
      const j = ik(sx, sy + 1, tg[0], tg[1], 5.4, 5.4, s);
      L(sx, sy + 1, j.kx, j.ky, 4, back ? sleeveD : sleeve);
      L(j.kx, j.ky, j.x, j.y, 3, back ? H.skinD : H.skin);
      if (male) P(j.kx - 2, j.ky - 1, 4, 3, back ? sleeveD : sleeve);
      E(j.x + 0.5, j.y + 0.5, 2, 2, back ? H.skinD : H.skin);
      return j;
    };
    armDraw(o.hb, o.sb, true);
    const leg = (ft, back) => {
      const j = ik(hx, hy, ft[0], ft[1] - 3, H.leg, H.leg, -1);
      if (male) {
        const c = back ? H.pantsD : H.pants;
        L(hx, hy, j.kx, j.ky, 7, c); L(j.kx, j.ky, j.x, j.y, 6, c);
        if (!back) { L(hx + 1, hy, j.kx + 1, j.ky, 2, H.pantsL); L(j.kx + 1, j.ky, j.x + 1, j.y, 2, H.pantsL); }
        E(j.x + 1.5, ft[1] - 2.2, 5, 2.6, H.shoe); P(j.x - 1, ft[1] - 4, 4, 1, H.shoeL); P(j.x - 3, ft[1] - 1, 10, 1, '#0c0c10');
      } else {
        const skin = back ? H.skinD : H.skin;
        L(hx, hy, j.kx, j.ky, 4, skin); L(j.kx, j.ky, j.x, j.y, 4, back ? H.dressD : H.dress);
        E(j.x + 1.5, ft[1] - 2.2, 5, 2.6, back ? H.shoeD : H.shoe); P(j.x - 3, ft[1] - 1, 10, 1, H.shoeD);
      }
    };
    leg(o.fb, true);
    // sheath on the back hip
    L(hx + 3, hy - 1, hx - 15, hy + 5, 2, '#1c1822'); L(hx + 3, hy - 2, hx + 5, hy - 2.5, 2, '#6a1e2a');
    if (male) {
      L(hx, hy - 1, sx, sy, 9, H.vest);
      L(hx + 3, hy - 1, sx + 3, sy, 2, H.vestL); L(hx - 3, hy - 1, sx - 3, sy, 2, H.vestD);
      P(hx - 4, hy - 3, 9, 3, H.vestD); P(hx - 4, hy - 3, 9, 1, H.vestL);
      E(sx + 1, sy - 2, 4.4, 3.2, H.shirt); P(sx + 1, sy - 1, 4, 1, H.shirtD);               // collar
      for (let r = 0; r < 5; r++) P(sx + 2 - r * 0 + (r > 2 ? 1 : 0), sy - 1 + r, 4 - Math.min(3, r), 1, H.shirt); // V neck
      P(sx + 2, sy + 4, 1, 1, H.vestD);
    } else {
      L(hx, hy - 1, sx, sy, 8, H.dress); L(hx - 3, hy - 1, sx - 3, sy, 2, H.dressD); L(hx + 3, hy - 1, sx + 3, sy, 1, H.dressL);
      E(sx + 1, sy - 2, 4, 2.6, H.dressL); P(sx + 1, sy - 2, 4, 1, H.dressD);
      P(hx - 4, hy - 4, 9, 1, H.dressD);
      const fl = o.skirt;
      for (let r = 0; r < 8; r++) {
        const w = 4.6 + r * 0.95, off = -fl * r * 0.9;
        P(hx - w + off, hy - 3 + r, R(w * 2), 1, r % 2 ? H.dress : H.dressL);
        for (let q = -w + 2; q < w; q += 3) P(hx + q + off, hy - 3 + r, 1, 1, H.dressD);
      }
      P(hx - 4.6 - 7 * 0.95 - fl * 7 * 0.9, hy + 4, R((4.6 + 7 * 0.95) * 2), 1, H.dressD);
    }
    leg(o.fa, false);
    // head
    P(hdx - 2, hdy + 6, 5, 4, H.skinD);
    headDraw(hdx, hdy, o, t);
    const j = armDraw(o.ha, o.sa, false);
    if (o.smoke && j) {
      const u = o.smoke.up, cx = j.x + 2, cy = j.y - 1 - u * 1;
      P(cx, cy, 5, 1, '#efe9de'); P(cx + 5, cy, 1, 1, '#ff7a3a'); P(cx + 4, cy, 1, 1, '#c9c2b4');
      const mx = u > 0.5 ? cx + 7 : cx + 5, my = cy;
      for (let k = 0; k < 4; k++) { const r = ((t * 5 + k * 3.2) % 13); P(mx + Math.sin(t * 2.2 + k * 1.7) * 2.2 + r * 0.15, my - 1 - r, 1, 1, 'rgba(205,205,220,' + (0.55 * (1 - r / 13)).toFixed(2) + ')'); }
      if (o.smoke.exh > 0.01) { const ex = o.smoke.exh; for (let k = 0; k < 7; k++) { const r = (t * 7 + k * 2) % 16; P(hdx + 6 + r * 0.9, hdy + 3 - r * 0.25 + Math.sin(k + t * 3) * 1.5, 2, 1, 'rgba(215,215,228,' + (0.5 * ex * (1 - r / 16)).toFixed(2) + ')'); } }
    }
    if (o.armed && j) drawBlade(j.x, j.y, o.ang, o.blen);
    return o;
  }

  function silhouette(src, color) {
    silc.globalCompositeOperation = 'source-over'; silc.clearRect(0, 0, SW, SH); silc.drawImage(src, 0, 0);
    silc.globalCompositeOperation = 'source-in'; silc.fillStyle = color; silc.fillRect(0, 0, SW, SH);
    silc.globalCompositeOperation = 'source-over';
  }
  function composeOut(dissolve, t) {
    if (dissolve > 0) {
      for (let gy = 0; gy < SH; gy += 3) for (let gx = 0; gx < SW; gx += 3) {
        const hh = hash(gx * 13.7 + gy * 7.3 + Math.floor(t * 8)), lim = dissolve * 1.25 - (gy / SH) * 0.3 + (gx - OX > 0 ? 0 : 0.05);
        if (hh < lim) sc.clearRect(gx, gy, 3, 3);
      }
    }
    silhouette(spr, OUTLINE);
    oc.clearRect(0, 0, SW, SH);
    [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(d => oc.drawImage(sil, d[0], d[1]));
    oc.drawImage(spr, 0, 0);
  }

  function slashFx(ctx, x, y, p, t) {
    const a = p.atk; if (!a || p.slash <= 0) return;
    const u = clamp(1 - p.slash / a.dur, 0, 1), f = p.face, ty = a.type;
    const sx = x + f * 4, sy = y - 27;
    ctx.save();
    const px = (xx, yy, w, h, c, al) => { ctx.globalAlpha = al; ctx.fillStyle = c; ctx.fillRect(R(xx), R(yy), w, h); };
    const arc = (cx, cy, r, a0, a1, th, cols, fade) => {
      const n = 26;
      for (let k = 0; k <= n; k++) {
        const q = k / n, an = lerp(a0, a1, q), w = Math.max(0.6, th * Math.sin(Math.PI * Math.pow(q, 0.8)));
        const al = clamp(fade * (0.25 + q * 0.75), 0, 1);
        const xx = cx + Math.cos(an) * f * r, yy = cy + Math.sin(an) * r;
        px(xx - w * 0.5 * 1.4, yy - w * 0.5 * 1.4, Math.max(1, R(w * 1.4)), Math.max(1, R(w * 1.4)), cols[1], al * 0.6);
        px(xx - w * 0.25, yy - w * 0.25, Math.max(1, R(w * 0.7)), Math.max(1, R(w * 0.7)), cols[0], al);
      }
    };
    const fade = u > 0.8 ? clamp((1 - u) / 0.2, 0, 1) : 1;
    if (ty === 's1') { const e = clamp((u - 0.25) / 0.45, 0, 1); if (e > 0) arc(sx, sy, 27, -2.5, lerp(-2.5, 1.25, ease(e)), 6, a.col, fade); }
    else if (ty === 's2') { const e = clamp((u - 0.2) / 0.5, 0, 1); if (e > 0) arc(sx, sy + 4, 26, 1.35, lerp(1.35, -2.0, ease(e)), 6, a.col, fade); }
    else if (ty === 's3') { const e = clamp((u - 0.38) / 0.45, 0, 1); if (e > 0) { arc(sx, sy, 36, 3.25 - Math.PI * 2, lerp(3.25 - Math.PI * 2, 1.2, ease(e)), 9, a.col, fade); if (e > 0.55) arc(sx, sy, 28, -1.2, 1.2, 4, a.col, fade * 0.7); } }
    else if (ty === 'down') { const e = clamp((u - 0.15) / 0.55, 0, 1); if (e > 0) arc(sx, sy - 2, 32, -2.1, lerp(-2.1, 1.35, ease(e)), 8, a.col, fade); }
    else if (ty === 'stab') { const e = clamp((u - 0.28) / 0.25, 0, 1); if (e > 0) for (let i = 0; i < 6; i++) { px(x + f * (10 + e * 40) - (f > 0 ? i * 8 + 6 : -i * 8), y - 22 - i * 0.2 + (hash(i + Math.floor(t * 30)) - 0.5) * 3, 8, 1 + (i < 2 ? 1 : 0), i % 2 ? a.col[1] : a.col[0], fade * (1 - i * 0.14)); } }
    else if (ty === 'kick') { const e = clamp((u - 0.28) / 0.22, 0, 1); if (e > 0) arc(x, y - 14, 24, Math.PI - 0.9, Math.PI + 0.7, 5, a.col, fade); }
    else if (ty === 'dstab') { for (let i = 0; i < 7; i++) px(x + f * 9 - 1 + (hash(i + Math.floor(t * 30)) - 0.5) * 3, y - 32 + i * 9, 2, 9, i % 2 ? a.col[1] : a.col[0], fade * (1 - i * 0.08)); }
    else if (ty === 'dash') { for (let i = 0; i < 7; i++) px(x - f * (6 + i * 8) - (f > 0 ? 8 : 0), y - 30 + i * 4, 10 + i * 2, 2, i % 2 ? a.col[1] : a.col[0], 0.55 - i * 0.06); }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  /* draw(ctx, x, y, p, t, hero, opts): x,y feet. opts: tint, noRefl, floorY, dissolve, noFx */
  /* ---- sprite-sheet renderer (IbrahimArt free character pack, see README credits) ---- */
  const PM = {"idle": [0, 8], "walk": [8, 10], "run": [18, 10], "jump": [28, 4], "fall": [32, 5], "slide": [37, 5], "a1": [42, 8], "a2": [50, 8], "a3": [58, 10], "up": [68, 5], "jup": [73, 6], "dwn": [79, 7], "hurt": [86, 5], "death": [91, 9], "land": [100, 4], "apex": [104, 5], "slst": [109, 4], "slen": [113, 5], "_": {"cw": 120, "ch": 88, "ax": 43, "ay": 62, "cols": 12}};
  const PSC = 1.3, PACK = {};
  ['m', 'f'].forEach(k => { const im = new Image(); const e = PACK[k] = { im, ok: false }; im.onload = () => { e.ok = true; }; im.src = 'img/char_' + k + '.png'; });
  const ptmp = document.createElement('canvas'); ptmp.width = PM._.cw; ptmp.height = PM._.ch; const ptx = ptmp.getContext('2d');
  function packFrame(p, t, opts) {
    const fl = (n, f) => { const m = PM[n]; return [n, m[0] + Math.max(0, Math.min(m[1] - 1, Math.floor(f)))]; };
    const a = p.atk, moving = Math.abs(p.vx) > 6 && p.ground, air = !p.ground, ph = p.ph || 0;
    if (opts.dissolve > 0) return fl('death', opts.dissolve * 9);
    if (p.hurt) return fl('hurt', 1 + ((t * 8) % 2));
    if (a && p.slash > 0) {
      const u = clamp(1 - p.slash / a.dur, 0, 0.999), ty = a.type;
      const nm = ty === 's1' ? 'a1' : ty === 's2' ? 'a2' : ty === 's3' ? 'a3' : ty === 'stab' ? 'a1' : ty === 'dash' ? 'a3' : ty === 'down' || ty === 'dstab' ? 'dwn' : 'a1';
      return fl(nm, u * PM[nm][1]);
    }
    if (p.vic) return fl('idle', (t * 8) % 8);
    if (p.slideT > 0) return fl('slide', Math.min(4, (0.5 - p.slideT) * 14));
    if (p.landT > 0) return fl('land', clamp(1 - p.landT / 0.13, 0, 0.99) * 4);
    if (air) { if (p.vy < -90) return fl('jump', clamp((p.vy + 330) / 60, 0, 3)); if (p.vy < 90) return fl('apex', (p.vy + 90) / 36); return fl('fall', clamp((p.vy - 90) / 70, 0, 4.9)); }
    if (moving) { const n = p.run ? 'run' : 'walk'; return fl(n, ((ph / (Math.PI * 2)) % 1 + 1) % 1 * 10); }
    return fl('idle', (t * 9) % 8);
  }
  function drawPack(ctx, x, y, p, t, hero, opts) {
    const e = PACK[hero] || PACK.m, M = PM._, fr = packFrame(p, t, opts), idx = fr[1], f = p.face || 1;
    const sx = (idx % M.cols) * M.cw, sy = Math.floor(idx / M.cols) * M.ch;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (opts.floorY != null && !opts.tint && !opts.noRefl) {
      ctx.save(); ctx.translate(x, y); ctx.scale(f * PSC, -PSC); ctx.globalAlpha = 0.22; ctx.drawImage(e.im, sx, sy, M.cw, M.ch, -M.ax, -M.ay, M.cw, M.ch); ctx.restore();
    }
    ctx.translate(x, y); ctx.scale(f * PSC, PSC);
    if (opts.dissolve > 0) ctx.globalAlpha = 1 - opts.dissolve * 0.85;
    if (opts.tint) {
      ptx.clearRect(0, 0, M.cw, M.ch); ptx.globalCompositeOperation = 'source-over'; ptx.drawImage(e.im, sx, sy, M.cw, M.ch, 0, 0, M.cw, M.ch);
      ptx.globalCompositeOperation = 'source-in'; ptx.fillStyle = opts.tint; ptx.fillRect(0, 0, M.cw, M.ch); ptx.globalCompositeOperation = 'source-over';
      ctx.drawImage(ptmp, -M.ax, -M.ay);
    } else ctx.drawImage(e.im, sx, sy, M.cw, M.ch, -M.ax, -M.ay, M.cw, M.ch);
    ctx.restore();
  }

  function draw(ctx, x, y, p, t, hero, opts) {
    opts = opts || {};
    if (PACK[hero || 'm'] && PACK[hero || 'm'].ok) return drawPack(ctx, x, y, p, t, hero || 'm', opts);
    H = HERO[hero] || HERO.m;
    const o = pose(p, t);
    build(p, t, o);
    composeOut(opts.dissolve || 0, t);
    const f = p.face || 1;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (opts.floorY != null && !opts.tint && !opts.noRefl) {
      rc.clearRect(0, 0, SW, RH); rc.save(); rc.setTransform(1, 0, 0, -1, 0, 2 * OY); rc.drawImage(out, 0, 0); rc.restore();
      rc.globalCompositeOperation = 'destination-in';
      const g = rc.createLinearGradient(0, OY, 0, OY + 34); g.addColorStop(0, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      rc.fillStyle = g; rc.fillRect(0, 0, SW, RH); rc.globalCompositeOperation = 'source-over';
      ctx.translate(x, 2 * opts.floorY - y); ctx.scale(f, 1); ctx.drawImage(refl, -OX, -OY); ctx.setTransform(ctx.getTransform());
      ctx.restore(); ctx.save(); ctx.imageSmoothingEnabled = false;
    }
    ctx.translate(x, y); ctx.scale(f * 0.88, 0.88);
    if (opts.tint) { silhouette(out, opts.tint); ctx.drawImage(sil, -OX, -OY); }
    else ctx.drawImage(out, -OX, -OY);
    ctx.restore();
    if (!opts.tint && !opts.noFx) slashFx(ctx, x, y, p, t);
  }

  window.Sprites = { draw, ATK, HERO };
})();
