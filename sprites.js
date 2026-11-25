/* Sprites: pose-driven pixel characters (male + female) with outline, hair physics, slash FX and floor reflection. */
(function () {
  const OX = 56, OY = 84, SW = 112, SH = 96, RH = 132;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  const [spr, sc] = mk(SW, SH), [sil, silc] = mk(SW, SH), [out, oc] = mk(SW, SH), [refl, rc] = mk(SW, RH);
  const R = Math.round;
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);

  const OUTLINE = '#0d0a12';
  const HERO = {
    m: {
      skin: '#f0c7a4', skinD: '#c99573', hair: '#1d1824', hairL: '#43385a', hairD: '#100d16',
      shirt: '#efeae0', shirtD: '#bdb7ad', vest: '#8a5530', vestL: '#b0743f', vestD: '#5d3720',
      pants: '#2c2e3e', pantsD: '#1c1d29', shoe: '#3a2a24', sole: '#e9e6e0', belt: '#15121a', long: false
    },
    f: {
      skin: '#f5cfb2', skinD: '#cf9d80', hair: '#2a1422', hairL: '#6b2f4d', hairD: '#170a14',
      shirt: '#f4f0ea', shirtD: '#c4bdb8', vest: '#3e7a6a', vestL: '#5ea08c', vestD: '#285448',
      pants: '#252638', pantsD: '#171822', shoe: '#d8334f', sole: '#f0eaea', belt: '#15121a', long: true, skirt: '#27304f', skirtL: '#3a4672'
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
    dash: { dur: 0.24, lo: 0.0, hi: 1.0, reach: 36, col: ['#ffffff', '#7fe9ff'] }
  };

  /* ---- pose ---- */
  function pose(p, t) {
    const o = { hx: 0, hy: -16, lean: 0.05, hd: 0, fa: [5, 0], fb: [-3, 0], ha: null, hb: null, armed: false, ang: 0, blen: 22, sa: 1, sb: 1, face: 'n', hair: 0.3, skirt: 0, blade: null, shut: false };
    const ph = p.ph || 0, moving = Math.abs(p.vx) > 6 && p.ground, running = moving && p.run, air = !p.ground;
    const a = p.atk; let u = a ? clamp(1 - p.slash / a.dur, 0, 1) : 0;
    const arm = (sh, ang, r) => [sh.x + Math.cos(ang) * r, sh.y + Math.sin(ang) * r];
    const sh0 = () => ({ x: o.hx + Math.sin(o.lean) * 12, y: o.hy - Math.cos(o.lean) * 12 });
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
      o.lean = 0.07; o.hy = -16 - Math.abs(Math.sin(ph)) * 1.2;
      o.fa = [Math.sin(ph) * 6, -Math.max(0, Math.cos(ph)) * 3.5]; o.fb = [Math.sin(ph + Math.PI) * 6, -Math.max(0, Math.cos(ph + Math.PI)) * 3.5];
      const sh = sh0(); o.ha = [sh.x + Math.sin(ph + Math.PI) * 5, sh.y + 11]; o.hb = [sh.x + Math.sin(ph) * 5, sh.y + 11]; o.sa = 1; o.sb = 1;
      o.hair = 0.5; o.skirt = 0.3; return o;
    }
    // idle: hands on hips, slow breathing, weight shift, hair sway
    const br = Math.sin(t * 2.3), shift = Math.sin(t * 0.9) * 0.6;
    o.hy = -16 + br * 0.5; o.hx = shift * 0.4; o.lean = 0.03 + br * 0.015;
    o.fa = [5 + shift * 0.3, 0]; o.fb = [-4, 0]; o.face = (hash(Math.floor(t * 0.5)) > 0.8 && Math.sin(t * 3) > 0.4) ? 'smirk' : 'n';
    const sh = sh0(); o.ha = [o.hx + 5.5, o.hy - 1]; o.hb = [o.hx - 4, o.hy - 1]; o.sa = 1; o.sb = 1; o.hair = 0.2 + br * 0.15; o.skirt = 0.1;
    return o;
  }

  /* ---- drawing ---- */
  function drawBlade(hx, hy, ang, len) {
    const c = Math.cos(ang), s = Math.sin(ang);
    L(hx - c * 4, hy - s * 4, hx + c * 1, hy + s * 1, 2, '#8a1e2e');                 // grip
    L(hx + c * 1, hy + s * 1, hx + c * (len + 1), hy + s * (len + 1), 2, '#e6eef6');  // blade
    L(hx + c * 3, hy + s * 3 + 1, hx + c * len, hy + s * len + 1, 1, '#8c9db2');     // edge shade
    L(hx + c * 3 - s, hy + s * 3 + c, hx + c * 1 + s, hy + s * 1 - c, 1, '#d9b24a'); // guard
    P(hx + c * len - 1, hy + s * len - 1, 2, 2, '#ffffff');
  }

  function face(hx, hy, o, t, p) {
    const e = o.face;
    // eye
    const blink = hash(Math.floor(t * 1.6)) > 0.94 && e === 'n';
    const ey = hy + 0;
    if (e === 'hurt') { P(hx + 1, ey - 1, 1, 1, '#1a1a22'); P(hx + 3, ey - 1, 1, 1, '#1a1a22'); P(hx + 2, ey, 1, 1, '#1a1a22'); P(hx + 1, ey + 1, 1, 1, '#1a1a22'); P(hx + 3, ey + 1, 1, 1, '#1a1a22'); }
    else if (e === 'happy') { P(hx + 1, ey, 1, 1, '#1a1a22'); P(hx + 2, ey - 1, 2, 1, '#1a1a22'); P(hx + 4, ey, 1, 1, '#1a1a22'); }
    else if (blink) P(hx + 1, ey + 1, 4, 1, '#2a1a14');
    else {
      P(hx + 1, ey - 1, 4, 3 + (e === 'fierce' ? -0 : 0), '#fff');
      P(hx + 3, ey - 1, 2, 3, e === 'fierce' ? '#d8334f' : (H.long ? '#3a6a8a' : '#2a1d2a'));
      P(hx + 4, ey - 1, 1, 1, '#fff');
      if (H.long) { P(hx + 0, ey - 2, 2, 1, '#1a1018'); P(hx + 4, ey - 2, 1, 1, '#1a1018'); }
    }
    // brow
    const bw = e === 'fierce' || e === 'hurt' ? 1 : 0;
    P(hx + 1, ey - 3 + (bw ? 1 : 0), 5, 1, H.hairD); if (bw) P(hx + 5, ey - 3, 1, 1, H.hairD);
    // nose
    P(hx + 6, ey + 2, 1, 2, H.skinD);
    // mouth
    const my = hy + 5;
    if (e === 'happy') { P(hx + 3, my - 1, 4, 2, '#7a2a30'); P(hx + 3, my - 1, 4, 1, '#fff'); }
    else if (e === 'hurt') P(hx + 4, my, 2, 2, '#5a1a20');
    else if (e === 'fierce') { P(hx + 3, my, 4, 1, '#5a2a30'); P(hx + 3, my + 1, 3, 1, '#fff'); }
    else if (e === 'smirk') { P(hx + 3, my, 3, 1, '#8a4a4a'); P(hx + 6, my - 1, 1, 1, '#8a4a4a'); }
    else P(hx + 3, my, 3, 1, '#8a4a4a');
    if (H.long) { P(hx + 1, my - 2, 2, 1, '#f09a9a'); }
    // ear
    P(hx - 3, hy + 0, 2, 3, H.skinD);
  }

  function hairBack(hdx, hdy, o, t, p) {
    const sway = o.hair, run = Math.max(0, sway);
    if (H.long) {
      // long hair: chain of segments streaming back, lifting with speed
      let px = hdx - 5, py = hdy - 2;
      const n = 9;
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1), lift = run * 0.9;
        const nx = px - (1.6 + run * 2.2), ny = py + 3.6 - lift * (1.2 + k * 3.2) + Math.sin(t * 4 + i * 0.7) * 0.5 * (0.4 + run * 0.4);
        L(px, py, nx, ny, 6 - k * 3, H.hair); L(px + 1, py, nx + 1, ny, 2, H.hairL);
        px = nx; py = ny;
      }
      P(px - 1, py - 1, 3, 3, H.hairD);
    } else {
      // messy back tuft, attached to the skull and whipping back with speed
      L(hdx - 5, hdy - 2, hdx - 9 - run * 4, hdy + 1 + Math.sin(t * 6) * 0.6 + run * 1.2, 3, H.hair);
      L(hdx - 5, hdy + 2, hdx - 8 - run * 3, hdy + 4 + run, 2, H.hairL);
    }
  }
  function hairFront(hdx, hdy, o, t) {
    const run = Math.max(0, o.hair);
    if (H.long) {
      P(hdx - 6, hdy - 7, 13, 5, H.hair); P(hdx - 7, hdy - 5, 4, 12, H.hair);          // cap + back mass
      P(hdx - 2, hdy - 8, 8, 2, H.hairL);                                               // shine band
      P(hdx + 1, hdy - 5, 6, 3, H.hair); P(hdx + 5, hdy - 3, 2, 5, H.hair);             // side-swept bangs
      P(hdx + 4, hdy + 0, 1, 3, H.hairD);
      P(hdx - 5, hdy - 6, 3, 2, '#e8405a'); P(hdx - 5, hdy - 5, 2, 1, '#ff8aa0');       // hair clip
    } else {
      P(hdx - 6, hdy - 7, 13, 4, H.hair);                                               // cap
      P(hdx - 7, hdy - 5, 3, 11, H.hair);                                               // back
      P(hdx - 1, hdy - 11, 3, 4, H.hair); P(hdx - 5, hdy - 10, 3, 4, H.hair); P(hdx + 3, hdy - 10, 3, 4, H.hair); P(hdx + 6, hdy - 8, 2, 3, H.hair); // spikes
      P(hdx - 2, hdy - 12, 1, 2, H.hairL); P(hdx + 4, hdy - 11, 1, 2, H.hairL); P(hdx - 4, hdy - 9, 2, 1, H.hairL);
      P(hdx + 1, hdy - 4, 6, 3, H.hair); P(hdx + 4, hdy - 1, 2, 4, H.hair); P(hdx + 6, hdy - 3, 1, 5, H.hair); // fringe over the eye
      P(hdx + 2, hdy - 1, 1, 1, H.hairD); P(hdx - 3, hdy - 7, 5, 1, H.hairL);
    }
  }

  function build(p, t, o) {
    sc.clearRect(0, 0, SW, SH);
    const hx = o.hx, hy = o.hy, sx = hx + Math.sin(o.lean) * 12, sy = hy - Math.cos(o.lean) * 12;
    const hdx = sx + Math.sin(o.lean * 0.7 + o.hd) * 8, hdy = sy - Math.cos(o.lean * 0.7 + o.hd) * 8 + 1;
    hairBack(hdx, hdy, o, t, p);
    // back arm
    const sleeve = H.shirt, sleeveD = H.shirtD;
    const armDraw = (tg, s, col, forearm) => {
      if (!tg) return;
      const j = ik(sx, sy + 1, tg[0], tg[1], 5.6, 5.6, s);
      L(sx, sy + 1, j.kx, j.ky, 3, col); L(j.kx, j.ky, j.x, j.y, 3, forearm);
      P(j.x - 1, j.y - 1, 3, 3, H.skin); return j;
    };
    armDraw(o.hb, o.sb, sleeveD, H.long ? sleeveD : H.skinD);
    // legs
    const leg = (ft, col, colD, sgn) => {
      const j = ik(hx, hy, ft[0], ft[1] - 2.5, 8, 8, -1);
      L(hx, hy, j.kx, j.ky, 5, col); L(j.kx, j.ky, j.x, j.y, 4, col);
      L(j.kx, j.ky, j.x, j.y, 1, colD);
      // shoe
      const sx0 = j.x - 2, sy0 = ft[1] - 3.5;
      P(sx0, sy0, 7, 4, H.shoe); P(sx0, sy0 + 3, 7, 1, H.sole); P(sx0 + 4, sy0, 2, 1, '#ffffff22' === 0 ? '#fff' : H.sole);
      P(sx0 - 0, sy0 - 1, 3, 1, H.pants === col ? colD : col);
    };
    leg(o.fb, H.pantsD, H.pantsD);
    // sheath always on the back hip
    L(hx + 3, hy - 1, hx - 16, hy + 5, 2, '#1c1822'); L(hx + 3, hy - 2, hx + 5, hy - 2.5, 2, '#8a1e2e');
    // torso: vest over shirt
    L(hx, hy - 1, sx, sy, 8, H.vest);
    L(hx + 2, hy - 1, sx + 2, sy, 2, H.vestL); L(hx - 3, hy - 1, sx - 3, sy, 2, H.vestD);
    P(sx + 1, sy - 2, 4, 3, H.shirt); P(sx + 2, sy + 1, 2, 2, H.shirt); P(sx + 3, sy - 3, 2, 1, H.shirtD);          // collar + V neck
    if (H.long) { P(sx + 3, sy + 4, 2, 2, H.vestL); P(sx + 3, sy + 7, 2, 2, H.vestL); }
    else { P(sx + 4, sy + 1, 1, 6, H.vestD); P(sx - 1, sy + 3, 3, 1, H.vestL); }
    P(hx - 4, hy - 3, 8, 2, H.belt); P(hx + 1, hy - 3, 2, 2, '#d9b24a');
    if (H.long) {
      const fl = o.skirt, w0 = 4;
      for (let r = 0; r < 7; r++) {
        const w = w0 + r * 0.75, off = -fl * r * 0.9;
        P(hx - w + off, hy - 3 + r, R(w * 2), 1, r % 2 ? H.skirt : H.skirtL);
        for (let q = -w + 2; q < w; q += 3) P(hx + q + off, hy - 3 + r, 1, 1, H.pantsD);
      }
      P(hx - w0 - 6 * 0.75 - 1 - fl * 6 * 0.9, hy + 3, R((w0 + 6 * 0.75) * 2) + 2, 1, '#aab4e0');
    }
    leg(o.fa, H.pants, H.pantsD);
    // head
    P(hdx - 2, hdy + 3, 5, 5, H.skinD);                                  // neck
    P(hdx - 5, hdy - 5, 12, 11, H.skin);                                  // face
    P(hdx - 5, hdy + 3, 12, 3, H.skin); P(hdx + 1, hdy + 5, 5, 1, H.skinD); // jaw shade
    hairFront(hdx, hdy, o, t);
    face(hdx, hdy, o, t, p);
    // front (weapon) arm over the body
    const j = armDraw(o.ha, o.sa, sleeve, H.long ? sleeve : H.skin);
    if (o.armed && j) drawBlade(j.x, j.y, o.ang, o.blen);
    if (o.armed && !j) { }
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
    const sx = x + f * 4, sy = y - 26;
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
    else if (ty === 'dash') { for (let i = 0; i < 7; i++) px(x - f * (6 + i * 8) - (f > 0 ? 8 : 0), y - 30 + i * 4, 10 + i * 2, 2, i % 2 ? a.col[1] : a.col[0], 0.55 - i * 0.06); }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  /* draw(ctx, x, y, p, t, hero, opts): x,y feet. opts: tint, noRefl, floorY, dissolve, noFx */
  function draw(ctx, x, y, p, t, hero, opts) {
    opts = opts || {};
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
    ctx.translate(x, y); ctx.scale(f, 1);
    if (opts.tint) { silhouette(out, opts.tint); ctx.drawImage(sil, -OX, -OY); }
    else ctx.drawImage(out, -OX, -OY);
    ctx.restore();
    if (!opts.tint && !opts.noFx) slashFx(ctx, x, y, p, t);
  }

  window.Sprites = { draw, ATK, HERO };
})();
