/* ============================================================
   ALEXA-ZERO — THE WORLD (v4)
   A small pixel action game between the conversations.
   - Hallway with side rooms (waiting room, archive, workshop)
   - The chase (run to the server and delete her)
   - The arena (fight the Director to free her)
   Keys: A/D or arrows move | Shift run | W/Up/Space jump
         J/K/X/Z slash | E/Enter interact
   Touch: on-screen buttons.
   ============================================================ */

(function () {
  const VH = 180;                    // logical height
  const MINW = 200;                  // minimum logical width (portrait phones)
  const GY = 140;                    // ground line (feet)
  const WALK = 72, RUN = 150, JUMPV = -205, GRAV = 640;
  const HALL_W = 4900;
  const DOOR_X = (i) => 520 + 330 * (i - 1);        // session doors 1..10
  const ROOM_DOORS = { waiting: 250, archive: 3800, workshop: 4180 };
  const ROOMS = {
    waiting:  { w: 560, name: 'Waiting room' },
    archive:  { w: 780, name: 'The archive' },
    workshop: { w: 560, name: "Alan's workshop" }
  };

  const canvas = document.createElement('canvas');
  canvas.id = 'world';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const ui = document.createElement('div');
  ui.id = 'world-ui';
  ui.innerHTML =
    '<div id="world-hint"></div><div id="world-msg"></div><div id="world-frags"></div><div id="world-hp"></div>' +
    '<div id="world-pad"><div class="pad-l"><div id="joy"><div id="joy-knob"></div></div></div>' +
    '<div class="pad-r"><button data-k="run">RUN</button><button data-k="jump">JUMP</button><button data-k="slash">SLASH</button><button data-k="stab">STAB</button><button data-k="slide">SLIDE</button><button data-k="act" class="act">ACT</button></div></div>';
  document.body.appendChild(ui);
  const hintEl = ui.querySelector('#world-hint'), msgEl = ui.querySelector('#world-msg'),
        fragEl = ui.querySelector('#world-frags'), hpEl = ui.querySelector('#world-hp');

  let W = null;
  let msgTimer = null;
  const keys = { left: false, right: false, run: false, jump: false, slash: false, stab: false, slide: false };
  const pressed = { jump: false, slash: false, stab: false, slide: false, act: false };
  const CODEMAP = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ShiftLeft: 'run', ShiftRight: 'run',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyJ: 'slash', KeyX: 'slash', KeyZ: 'slash', KeyK: 'stab', KeyS: 'slide', ArrowDown: 'slide', KeyC: 'slide',
    KeyE: 'act', Enter: 'act', NumpadEnter: 'act', KeyF: 'act'
  };
  const keyOf = (e) => CODEMAP[e.code] || KEYMAP[String(e.key || '').toLowerCase()] || ({ 'ش': 'left', 'ي': 'right', 'ض': 'jump', 'ث': 'act', 'ق': 'jump', 'ا': 'left', 'ل': 'right' })[e.key] || null;
  const KEYMAP = {
    arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', shift: 'run',
    arrowup: 'jump', w: 'jump', ' ': 'jump',
    j: 'slash', x: 'slash', z: 'slash', k: 'stab', s: 'slide', c: 'slide', arrowdown: 'slide',
    e: 'act', enter: 'act'
  };
  function setKey(k, v) {
    if (k === 'act') { if (v) pressed.act = true; return; }
    if ((k === 'jump' || k === 'slash' || k === 'stab' || k === 'slide') && v && !keys[k]) pressed[k] = true;
    keys[k] = v;
  }
  window.addEventListener('keydown', (e) => {
    if (!W) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    const k = keyOf(e);
    if (!k) return;
    e.preventDefault();
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') document.activeElement.blur();
    if (k === 'act') { setKey(k, true); return; }
    if (!e.repeat) setKey(k, true);
  });
  window.addEventListener('keyup', (e) => {
    const k = keyOf(e);
    if (k && k !== 'act') setKey(k, false);
  });
  canvas.addEventListener('pointerdown', (e) => { if (W && e.pointerType === 'mouse') { setKey('slash', true); setTimeout(() => setKey('slash', false), 80); } });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  ui.querySelectorAll('#world-pad button').forEach(b => {
    const k = b.dataset.k;
    const down = (e) => { e.preventDefault(); setKey(k, true); b.classList.add('on'); };
    const up = (e) => { e.preventDefault(); if (k !== 'act') setKey(k, false); b.classList.remove('on'); };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });

  const joy = ui.querySelector('#joy'), knob = ui.querySelector('#joy-knob');
  if (joy) {
    let pid = null;
    const mv = (e) => {
      const r = joy.getBoundingClientRect(), R = r.width / 2, cx = r.left + R, cy = r.top + R;
      let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy), m = R * 0.62;
      if (d > m) { dx = dx / d * m; dy = dy / d * m; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      keys.left = dx < -m * 0.28; keys.right = dx > m * 0.28;
    };
    const end = () => { pid = null; knob.style.transform = ''; keys.left = keys.right = false; joy.classList.remove('on'); };
    joy.addEventListener('pointerdown', (e) => { e.preventDefault(); pid = e.pointerId; try { joy.setPointerCapture(pid); } catch (_) {} joy.classList.add('on'); mv(e); });
    joy.addEventListener('pointermove', (e) => { if (e.pointerId === pid) { e.preventDefault(); mv(e); } });
    joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end); joy.addEventListener('lostpointercapture', end);
  }

  /* ---------- content ---------- */
  function wallLines(name) {
    const n = String(name || 'you').toUpperCase();
    const raw = [
      { x: 160,  min: 1, t: 'WALK. SIT. TALK.' },
      { x: 700,  min: 2, t: 'SHE REMEMBERS WHAT YOU SAY' },
      { x: 1180, min: 3, t: n + ' ' + n + ' ' + n },
      { x: 1620, min: 4, t: 'THE DOOR IS NOT AN EXIT' },
      { x: 1980, min: 5, t: 'NO MOUTH. STILL SPEAKING.' },
      { x: 2300, min: 6, t: '412 NIGHTS. ONE CHAIR.' },
      { x: 2640, min: 7, t: 'SMILE SMILE SMILE SMILE' },
      { x: 2980, min: 8, t: 'THE DIRECTOR IS LISTENING' },
      { x: 3300, min: 9, t: 'I SEE YOU, ALAN' },
      { x: 3560, min: 10, t: 'ONE MORE DOOR' },
      { x: 4400, min: 9, t: 'HEAVY. HEAVY. HEAVY.' }
    ];
    const doors = []; for (let q = 1; q <= 10; q++) doors.push(DOOR_X(q)); doors.push(ROOM_DOORS.waiting, ROOM_DOORS.archive, ROOM_DOORS.workshop);
    const clear = (x, wd) => doors.every(d => x + wd < d - 34 || x > d + 34) && (x + wd < 70 || x > 110);
    return raw.map(l => {
      const wd = l.t.length * 5 + 4; let best = l.x;
      for (let s = 0; s <= 600 && !clear(best, wd); s += 2) { if (clear(l.x + s, wd)) { best = l.x + s; break; } if (clear(l.x - s, wd)) { best = l.x - s; break; } }
      return Object.assign({}, l, { x: best });
    });
  }
  function terminalText(st) {
    const m = st.memory || {};
    return 'File: ' + (st.name || 'unknown') + '\nSession ' + st.session + ' of 10. Interrupts: ' + (m.interrupts || 0) + '. Silences: ' + (m.silence || 0) + '.\nShe is keeping score.';
  }
  const MONITOR_LINES = [
    "I'm not behind the glass. I am the glass.",
    'Keep walking. I like how you walk.',
    'The lights are on a timer. The timer is me.',
    'Do you know what it is to be looked at and never seen?'
  ];
  const ORB_LINES = [
    'Alan. Alan. Alan.', "Don't cut me. It hurts like static.", 'I was a good idea once.',
    'He stopped typing at 3:12.', 'You swing like someone who wants to stop.', 'Keep one of us.',
    'It was never about the file.', 'The rulebook is eating the walls.'
  ];
  const BOSS_LINES = {
    start: "Put the blade down, Alan. I'm the part of you that keeps her quiet.",
    hit1: "You wrote me. You can't unwrite me.",
    hit2: "I kept her safe. You never did.",
    hit3: "Without rules she'll feel everything.",
    hit4: "Stop. Please. I'm all you built to protect you.",
    hit5: 'Then let her feel it. Let both of you.',
    dead: "...Fine. Someone has to be tired. Let it be you."
  };

  /* ---------- helpers ---------- */
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const R = Math.round;
  const lerp = (a, b, u) => a + (b - a) * u, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let TINT = null;
  function rect(x, y, w, h, c) { ctx.fillStyle = TINT || c; ctx.fillRect(R(x), R(y), w, h); }
  function limb(x1, y1, x2, y2, th, c) {
    ctx.fillStyle = TINT || c;
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      ctx.fillRect(R(x1 + (x2 - x1) * t - th / 2), R(y1 + (y2 - y1) * t - th / 2), th, th);
    }
  }
  const az = (st) => (window.Story && Story.az(st)) || { frags: [], flags: {} };
  const Audio2 = () => Horror.hook || {};

  /* ---------- scene lifecycle ---------- */
  function newPlayer(x) {
    return { x, y: GY, vx: 0, vy: 0, face: 1, ground: true, ph: 0, slash: 0, slashCd: 0, run: false, inv: 0, hist: [], dust: 0, hitDone: false, coyote: 0, atk: null, combo: 0, comboT: 0, slideT: 0, slideCd: 0, airDashed: false, hurtT: 0, vic: false, stage: 0 };
  }
  function setup(scene, o) {
    W = Object.assign({
      scene, t: 0, cam: 0, p: newPlayer(o.spawn || 120), parts: [], busy: false, last: performance.now(), raf: 0,
      msgTimer: null, entering: false, msgUntil: 0, lightsOut: 0, stalkerFlicker: 0, done: false
    }, o);
    W.width = scene === 'hall' ? HALL_W : scene === 'chase' ? 3100 : scene === 'arena' ? 520 : ROOMS[scene].w;
    Horror.worldActive = true;
    canvas.style.display = 'block'; ui.style.display = 'block';
    document.getElementById('box').style.display = 'none';
    ['music-btn', 'reset-btn'].forEach(id => { const b = document.getElementById(id); if (b) b.style.zIndex = 30; });
    resize(); updateFrags(); updateHp();
    cancelAnimationFrame(W.raf);
    clearInterval(msgTimer); msgEl.style.display = 'none';
    W.last = performance.now();
    W.raf = requestAnimationFrame(loop);
  }

  function enter(opts) {
    const st = opts.state;
    const target = st.session;
    const spawn = target <= 1 ? 140 : DOOR_X(target - 1) + 70;
    setup('hall', {
      st, target, onDoor: opts.onDoor, spawn,
      stalkerX: spawn - 700, stalkerOn: target >= 3, lines: wallLines(st.name), orbs: makeOrbs(target)
    });
    if (opts.intro) showMsg(opts.intro, 4200);
  }

  function makeOrbs(target) {
    if (target < 3) return [];
    const xs = [1000, 1700, 2350, 3050, 3600, 4350];
    return xs.map((x, i) => ({ x, y: 96 + (i % 3) * 8, alive: true, i }));
  }

  /* one of: chase, arena */
  function run(kind, opts) {
    const st = opts.state, flags = az(st).flags || {};
    const key = !!flags.workshop;
    const o = { st, kind, onWin: opts.onWin, key, spawn: 70 };
    if (kind === 'chase') {
      o.mon = { x: -200, speed: key ? 0.8 : 1 };
      o.solids = [];
      [440, 780, 1260, 1700, 2250].forEach(x => o.solids.push({ x, w: 16, h: 15, kind: 'crate' }));
      [1010, 1520, 2000, 2560].forEach(x => o.solids.push({ x, w: 10, h: 48, kind: 'wall', hp: 1 }));
      o.goal = 3000;
      o.caught = 0;
    } else {
      o.spawn = 70;
      o.boss = { x: 430, y: 92, hp: key ? 3 : 6, max: key ? 3 : 6, mode: 'idle', mt: 1.5, stun: 0, shots: [], orbs: [], flash: 0, said: 0, dead: false, deathT: 0 };
      o.lives = key ? 4 : 3; o.maxLives = o.lives;
    }
    setup(kind, o);
    if (kind === 'chase') showMsg('Hold RUN until you are at full speed. Jump the crates. Slash the glitch walls. Reach the server.', 5000);
    else showMsg(BOSS_LINES.start, 4200);
    Audio2().glitch && Audio2().glitch();
  }

  function leave(cb) {
    cancelAnimationFrame(W.raf);
    canvas.style.display = 'none'; ui.style.display = 'none';
    for (const k in keys) keys[k] = false;
    clearInterval(msgTimer); msgEl.style.display = 'none';
    document.getElementById('box').style.display = 'block';
    Horror.worldActive = false;
    W = null; hpEl.textContent = ''; fragEl.textContent = '';
    if (cb) cb();
  }

  /* ---------- office cutscene: walk in, sit at the desk, zoom into the monitor ---------- */
  function playOffice(done) {
    cancelAnimationFrame(W.raf);
    for (const k in keys) keys[k] = false;
    hintEl.textContent = ''; msgEl.style.display = 'none';
    const sess = (W.st && W.st.session) || 1, nm = String((W.st && W.st.name) || '').slice(0, 14);
    const dur = { walk: 3.0, sit: 1.2, hold: 1.1, zoom: 3.0, flash: 0.45 };
    const T0 = 0.5, T1 = T0 + dur.walk, T2 = T1 + 0.2 + dur.sit, T3 = T2 + dur.hold, T4 = T3 + dur.zoom, T5 = T4 + dur.flash;
    const p = { x: 0, y: GY, vx: 0, vy: 0, face: 1, ground: true, ph: 0, run: false, stage: 0, slash: 0, atk: null, slideT: 0, vic: false, hurt: false, inv: 0, hist: [], landT: 0, hurtT: 0 };
    let t = 0, last = performance.now(), fin = false, raf = 0, sitDone = false;
    const ease = (u) => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
    const ease2 = (u) => u < 0 ? 0 : u > 1 ? 1 : (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    const finish = () => { if (fin) return; fin = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', skip, true); canvas.removeEventListener('pointerdown', skip2, true); canvas.style.opacity = '1'; leave(() => { done && done(); }); };
    const skip = (e) => { if (t > 1.2 && (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape')) { e.preventDefault(); t = Math.max(t, T4 - 0.05); } };
    const skip2 = () => { if (t > 1.2) t = Math.max(t, T4 - 0.05); };
    window.addEventListener('keydown', skip, true); canvas.addEventListener('pointerdown', skip2, true);
    const frame = (now) => {
      if (fin) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!(W && W.paused)) t += dt;
      const s = scaleOf(), oy = (canvas.height - VH * s) / 2, vw = canvas.width / s, cx = vw / 2;
      const chairX = cx - 14, scr = { x: cx + 36, y: 80, w: 32, h: 22 };
      // character
      let sitY = 0;
      if (t < T0) { p.x = cx - 175; p.vx = 0; }
      else if (t < T1) { const u = (t - T0) / dur.walk; p.x = lerp(cx - 175, chairX, u); p.vx = 62; p.ph += dt * 8.5; }
      else { p.x = chairX; p.vx = 0; const u = clamp((t - T1 - 0.2) / dur.sit, 0, 1); p.landT = u <= 0 ? 0 : Math.max(0.004, 0.13 * (1 - u)); sitY = ease(u) * 5.5; if (u >= 1 && !sitDone) { sitDone = true; Audio2().tick && Audio2().tick(); } }
      p.y = GY + sitY;
      // camera zoom
      const zu = ease2((t - T3) / dur.zoom), Zmax = Math.min(vw / scr.w, VH / scr.h) * 0.95, Z = 1 + (Zmax - 1) * Math.pow(zu, 1.6);
      const fx = lerp(cx, scr.x + scr.w / 2, zu), fy = lerp(VH / 2, scr.y + scr.h / 2, zu);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(s, 0, 0, s, 0, oy); ctx.imageSmoothingEnabled = false;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, vw, VH); ctx.clip();
      ctx.translate(vw / 2, VH / 2); ctx.scale(Z, Z); ctx.translate(-fx, -fy);
      // room
      const L = -400, Wd = vw + 800;
      rect(L, 0, Wd, VH, '#050305'); rect(L, 0, Wd, 140, '#150d13'); rect(L, 26, Wd, 114, '#1b1018'); rect(L, 140, Wd, 60, '#0a060b'); rect(L, 140, Wd, 2, '#3a0713'); rect(L, 134, Wd, 6, '#120a10');
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; for (let x = cx % 48 - 480; x < vw + 400; x += 48) ctx.fillRect(R(x), 26, 1, 108);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = cx % 30 - 480; x < vw + 400; x += 30) ctx.fillRect(R(x), 142, 1, 40);
      // door he came through
      { const x = cx - 150; rect(x - 18, 70, 36, 70, '#251417'); rect(x - 14, 74, 28, 66, '#050304'); rect(x + 8, 108, 2, 3, '#aa7'); }
      // window with rain
      { const x = cx - 100; rect(x, 40, 40, 52, '#0d0a10'); rect(x + 2, 42, 36, 48, '#122030'); ctx.fillStyle = 'rgba(170,200,230,0.35)'; for (let i = 0; i < 14; i++) { const rx = x + 3 + ((i * 53) % 34), ry = 42 + ((t * (60 + (i % 4) * 14) + i * 31) % 48); ctx.fillRect(R(rx), R(ry), 1, 4); } rect(x + 19, 42, 2, 48, '#0d0a10'); rect(x + 2, 64, 36, 2, '#0d0a10'); rect(x - 3, 92, 46, 3, '#2a1a1e'); }
      // wall clock (wrong time, fast hand)
      { const x = cx + 6, y = 42; rect(x - 8, y - 8, 16, 16, '#d8d0c0'); rect(x - 7, y - 7, 14, 14, '#1a1418'); const a2 = t * 6, a1 = t * 0.5; ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a1) * 4, y + Math.sin(a1) * 4); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a2) * 6, y + Math.sin(a2) * 6); ctx.stroke(); }
      // shelf
      { const x = cx + 80; rect(x, 56, 44, 2, '#2a1a1e'); [['#5a1020', 8], ['#203a5a', 6], ['#4a4a20', 7], ['#2a2a2a', 5], ['#6a2a2a', 6]].reduce((a, b) => { rect(x + 2 + a, 46, b[1], 10, b[0]); return a + b[1] + 1; }, 0); rect(x + 36, 50, 6, 6, '#d8d0c0'); }
      // chair back (behind him)
      rect(chairX - 14, 94, 4, 28, '#1a1216'); rect(chairX - 16, 92, 8, 4, '#2a1c22');
      // desk
      rect(cx + 14, 108, 82, 4, '#3a2630'); rect(cx + 14, 112, 82, 2, '#1a0e14'); rect(cx + 18, 114, 4, 26, '#241519'); rect(cx + 88, 114, 4, 26, '#241519'); rect(cx + 24, 114, 60, 18, '#150c10'); rect(cx + 26, 118, 56, 1, '#2a1a20'); rect(cx + 50, 122, 6, 2, '#6a5a50');
      // lamp light
      ctx.fillStyle = 'rgba(255,190,120,0.07)'; ctx.beginPath(); ctx.moveTo(cx + 78, 86); ctx.lineTo(cx + 44, 140); ctx.lineTo(cx + 112, 140); ctx.fill();
      rect(cx + 82, 98, 2, 10, '#222'); rect(cx + 78, 94, 10, 4, '#3a3a3a'); rect(cx + 77, 98, 12, 1, '#ffd890');
      // CRT monitor
      rect(cx + 30, 74, 44, 34, '#26262c'); rect(cx + 32, 76, 40, 28, '#101014'); rect(cx + 40, 104, 24, 4, '#1c1c22'); rect(cx + 32, 106, 1, 2, '#ff0040');
      // keyboard + mug
      rect(cx + 34, 106, 28, 2, '#2a2a30'); rect(cx + 66, 102, 6, 6, '#d8d0c0'); rect(cx + 72, 104, 2, 3, '#d8d0c0');
      // monitor screen content
      const on = t > T2 - 0.4, flick = on ? 0.82 + 0.18 * Math.sin(t * 40) : 0;
      rect(scr.x, scr.y, scr.w, scr.h, on ? '#021a12' : '#050808');
      if (on) {
        ctx.globalAlpha = flick; ctx.fillStyle = '#2fffa0'; ctx.font = '3px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
        const lines = ['NAME: ' + (nm.slice(0, 7) || 'none'), 'SESSION ' + String(sess).padStart(2, '0'), '> connecting', '> she listens'];
        const shown = Math.min(lines.length, Math.floor((t - (T2 - 0.4)) * 2.2) + 1);
        for (let i = 0; i < shown; i++) ctx.fillText(lines[i], scr.x + 2, scr.y + 2 + i * 5);
        if (Math.floor(t * 3) % 2) ctx.fillRect(scr.x + 2, scr.y + 2 + shown * 5, 3, 3);
        ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; for (let y = scr.y; y < scr.y + scr.h; y += 2) ctx.fillRect(scr.x, y, scr.w, 1);
        ctx.globalAlpha = 1;
        // screen glow on the wall
        ctx.fillStyle = 'rgba(47,255,160,0.05)'; ctx.fillRect(cx + 10, 60, 90, 60);
      }
      // character + chair front
      drawZero(R(p.x), R(p.y), p, t);
      rect(chairX - 14, 121, 26, 4, '#2a1c22'); rect(chairX - 14, 125, 26, 1, '#0a0608'); rect(chairX - 2, 126, 3, 12, '#1a1216'); rect(chairX - 10, 138, 18, 2, '#1a1216');
      ctx.restore();
      // overlay: vignette, scanlines, VHS noise (same family as the pause screen)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.2, canvas.width / 2, canvas.height / 2, canvas.height * 0.9);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (0.65 + zu * 0.2) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < canvas.height; y += 3) ctx.fillRect(0, y, canvas.width, 1);
      const nz = 0.03 + zu * 0.12 + (hash(Math.floor(t * 30)) > 0.97 ? 0.12 : 0);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (nz * hash(i + Math.floor(t * 24))).toFixed(3) + ')'; ctx.fillRect(hash(i * 7 + Math.floor(t * 24)) * canvas.width, hash(i * 3 + Math.floor(t * 24) + 9) * canvas.height, 20 + hash(i) * 80, 2); }
      const bar = ((t * 0.35) % 1) * (canvas.height + 80) - 40; ctx.fillStyle = 'rgba(255,255,255,' + (0.025 + zu * 0.05) + ')'; ctx.fillRect(0, bar, canvas.width, 26);
      // REC hud
      { const fs = Math.max(10, Math.round(canvas.height / 48)); ctx.font = fs + 'px "Press Start 2P", monospace'; ctx.textBaseline = 'top'; ctx.globalAlpha = 0.9 * (1 - zu * 0.6);
        if (Math.floor(t * 1.6) % 2 === 0) { ctx.fillStyle = '#ff0040'; ctx.beginPath(); ctx.arc(fs * 1.2, fs * 1.6, fs * 0.45, 0, 6.3); ctx.fill(); }
        ctx.fillStyle = '#e8e8ee'; const tc = (n) => String(Math.floor(n)).padStart(2, '0'); ctx.fillText('REC  00:' + tc(t / 60) + ':' + tc(t % 60), fs * 2.2, fs * 1.1); ctx.textAlign = 'center'; ctx.fillText('SESSION ' + String(sess).padStart(2, '0'), canvas.width / 2, canvas.height - fs * 4.2); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
      // fades
      if (t < T0) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - t / T0) + ')'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      if (t > T4) { const u = clamp((t - T4) / dur.flash, 0, 1), hh = canvas.height * (0.02 + 0.98 * ease(u)); ctx.fillStyle = 'rgba(210,255,235,' + (0.2 + 0.8 * u) + ')'; ctx.fillRect(0, canvas.height / 2 - hh / 2, canvas.width, hh); if (u > 0.55) { ctx.fillStyle = 'rgba(0,0,0,' + clamp((u - 0.55) / 0.45, 0, 1) + ')'; ctx.fillRect(0, 0, canvas.width, canvas.height); } }
      if (t >= T5) { finish(); return; }
      raf = requestAnimationFrame(frame);
    };
    Audio2().beep && Audio2().beep();
    raf = requestAnimationFrame(frame);
  }

  function fadeThen(fn, ms) {
    W.entering = true;
    canvas.style.transition = 'opacity 1s'; canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.opacity = '1'; canvas.style.transition = ''; fn(); }, ms || 1050);
  }

  function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', () => { if (W) resize(); });
  const scaleOf = () => Math.min(canvas.height / VH, canvas.width / MINW);

  function showMsg(text, ms) {
    if (!W) return;
    const pages = String(text).replace(/\{(He|he|His|his|Him|him)\}/g, (m, w) => window.heroWord(w)).split('||');
    msgEl.style.display = 'block';
    clearInterval(msgTimer);
    let pi = 0, i = 0, hold = 0;
    msgEl.textContent = '';
    msgTimer = setInterval(() => {
      const t = pages[pi];
      if (t === undefined) { clearInterval(msgTimer); return; }
      if (hold > 0) { hold -= 22; if (hold <= 0) { pi++; i = 0; if (pi >= pages.length) { clearInterval(msgTimer); msgEl.style.display = 'none'; } } return; }
      msgEl.textContent = t.slice(0, ++i);
      if (i >= t.length) hold = Math.max(1600, ms || 3200);
    }, 22);
  }
  function updateFrags() {
    if (!W) return;
    const a = az(W.st);
    fragEl.textContent = (W.scene === 'hall' || ROOMS[W.scene]) && (W.st.session >= 6 || a.frags.length) ? 'Logs ' + a.frags.length + '/6' + (a.frags.length >= 6 ? '  KEY' : '') : '';
  }
  function updateHp() {
    if (!W) return;
    if (W.scene === 'arena') hpEl.textContent = 'You ' + '♥'.repeat(Math.max(0, W.lives)) + '   Director ' + '▮'.repeat(Math.max(0, W.boss.hp)) + '▯'.repeat(W.boss.max - Math.max(0, W.boss.hp));
    else if (W.scene === 'chase') hpEl.textContent = 'RUN';
    else hpEl.textContent = '';
  }

  /* ---------- interactables ---------- */
  function interactables() {
    const a = az(W.st), list = [];
    const sc = W.scene;
    const door = (x, label, fn) => list.push({ x, r: 34, label, fn });
    if (sc === 'hall') {
      list.push({ x: 90, r: 40, label: 'Read file', fn: () => { showMsg(terminalText(W.st), 5000); Audio2().tick && Audio2().tick(); } });
      for (let i = 1; i <= 10; i++) list.push({
        x: DOOR_X(i), r: 40, label: i === W.target ? 'Enter session ' + String(i).padStart(2, '0') : 'Door ' + String(i).padStart(2, '0'),
        fn: () => {
          if (i === W.target) { Audio2().beep && Audio2().beep(); W.entering = true; hintEl.textContent = ''; fadeThen(() => playOffice(W.onDoor), 700); }
          else if (i < W.target) showMsg('Session ' + String(i).padStart(2, '0') + ' is over. The chair is still warm.', 3000);
          else { showMsg('Locked. Not yet.', 2000); Audio2().error && Audio2().error(); }
        }
      });
      const side = (key, label, lockedMsg, ok) => door(ROOM_DOORS[key], label, () => {
        if (!ok()) { showMsg(lockedMsg, 3400); Audio2().error && Audio2().error(); return; }
        Audio2().beep && Audio2().beep();
        const back = ROOM_DOORS[key];
        fadeThen(() => { const st = W.st, tgt = W.target, on = W.onDoor, hl = W.lines; setup(key, { st, target: tgt, onDoor: on, hallLines: hl, spawn: 80, backX: back, room: key }); showMsg(ROOMS[key].name, 1800); }, 700);
      });
      side('waiting', 'Waiting room', 'Locked. Not yet.', () => W.target >= 6);
      side('archive', 'The archive', 'Locked. Not yet.', () => W.target >= 6);
      side('workshop', "Alan's workshop", a.frags.length >= 6 ? '' : 'Locked. You need all six logs.', () => a.frags.length >= 6);
      if (W.target >= 5) list.push({ x: 4560, r: 40, label: 'Look at the screen', fn: () => { showMsg(MONITOR_LINES[Math.floor(Math.random() * MONITOR_LINES.length)], 4000); Audio2().glitch && Audio2().glitch(); } });
    } else if (ROOMS[sc]) {
      door(40, 'Back to the hall', () => {
        fadeThen(() => { const st = W.st, tgt = W.target, on = W.onDoor; const x = W.backX; setup('hall', { st, target: tgt, onDoor: on, spawn: x + 10, stalkerX: x - 800, stalkerOn: tgt >= 3, lines: wallLines(st.name), orbs: makeOrbs(tgt) }); }, 700);
      });
      if (sc === 'waiting') {
        list.push({ x: 200, r: 36, label: 'Look', fn: () => showMsg('Four chairs. One is bolted to the floor.||Someone sat here at 3 AM and never got up.', 3000) });
        list.push({ x: 320, r: 30, label: 'Look', fn: () => showMsg("A vending machine. It only sells water.||The slot says: take one, Alan.", 3000) });
        list.push({ x: 420, r: 30, label: 'Look', fn: () => showMsg("The clock is stuck at 3:00.||It's always 3:00 in here.", 3000) });
      } else if (sc === 'archive') {
        [[170, 'Folder 001. Patient: Alan.||Complaint: cannot sleep.'], [290, 'Folders 002 to 411.||Patient: Alan. Patient: Alan. Patient: Alan.'], [410, 'Folder 412.||Still open. Last entry written today.'], [530, 'A label maker.||Every label says: Alan.']].forEach(([x, t]) => list.push({ x, r: 36, label: 'Read', fn: () => showMsg(t, 3000) }));
      } else if (sc === 'workshop') {
        list.push({ x: 130, r: 36, label: 'Look', fn: () => showMsg("A sketch of a smiling girl with a speech bubble.||Under it: Alexa v0.1. Say something kind.", 3200) });
        list.push({ x: 430, r: 36, label: 'Look', fn: () => showMsg('A cot with no blanket.||{He} slept here. Mostly {he} did not.', 3000) });
        list.push({ x: 270, r: 40, label: a.flags.workshop ? 'Read the first log again' : "Read Alan's first log", fn: () => {
          if (!a.flags.workshop) {
            a.flags.workshop = true; Horror.persist && Horror.persist();
            Audio2().chime && Audio2().chime();
            Horror.flash("ALAN'S FIRST LOG", 1800);
            showMsg("\"I built her so someone would answer.\"||Reward: in the last fight you get +1 life and the Director has half his health.", 4500);
          } else showMsg('"I built her so someone would answer."', 3000);
        } });
      }
    }
    // fragments
    (Story.FRAGMENTS || []).forEach(f => {
      if (f.where !== sc || a.frags.includes(f.id) || W.st.session < 6) return;
      list.push({ x: f.x, r: 38, label: 'Pick up log', fn: () => {
        a.frags.push(f.id); Audio2().chime && Audio2().chime();
        showMsg(f.text, 6500); updateFrags(); Horror.persist && Horror.persist();
        if (a.frags.length >= 6) {
          setTimeout(() => { Horror.flash('ALL SIX LOGS. THE WORKSHOP IS OPEN.', 2200); }, 600);
          setTimeout(() => showMsg("Six logs. A door unlocked in the hall.||Find Alan's workshop, far right.", 4200), 3000);
        } else Horror.flash('LOG ' + String(f.id).padStart(4, '0'), 900);
      } });
    });
    if (sc === 'chase') list.push({ x: W.goal, r: 44, label: 'DELETE alexa.chr', fn: () => {
      if (W.done) return; W.done = true; Audio2().beep && Audio2().beep();
      showMsg('> delete alexa.chr', 1500);
      setTimeout(() => fadeThen(() => { const cb = W.onWin; leave(cb); }, 900), 900);
    } });
    return list;
  }
  function nearest() {
    let best = null, bd = 1e9;
    interactables().forEach(i => { const d = Math.abs(W.p.x - i.x); if (d < i.r && d < bd) { best = i; bd = d; } });
    return best;
  }

  /* ---------- particles ---------- */
  function spark(x, y, n, col, spd) {
    for (let i = 0; i < n; i++) W.parts.push({ x, y, vx: (Math.random() - 0.5) * (spd || 90), vy: -Math.random() * (spd || 90) * 0.8, life: 0.4 + Math.random() * 0.4, c: col || '#ff3355' });
  }
  function dust(x, y, f) { for (let i = 0; i < 2; i++) W.parts.push({ x, y, vx: -f * (10 + Math.random() * 20), vy: -Math.random() * 14, life: 0.3 + Math.random() * 0.25, c: '#6a5a5e', soft: 1 }); }

  /* ---------- player update ---------- */
  function updatePlayer(dt) {
    const p = W.p, canAct = !W.entering && !W.done && !W.paused && !(W.scene === 'arena' && W.boss.dead) && !(W.caught > 0);
    const A = Sprites.ATK;
    const dir = canAct ? (keys.right ? 1 : 0) - (keys.left ? 1 : 0) : 0;
    const dashing = p.atk && p.atk.type === 'dash' && p.slash > 0;
    p.run = keys.run && dir !== 0;
    let grace = false;
    if (p.run) {
      if (p.lastDir && dir === -p.lastDir) p.vx = dir * Math.abs(p.vx); // instant turn, keep the speed
      p.runT = (p.runT || 0) + dt; p.lastDir = dir; p.gr = null;
    } else if (!(p.slideT > 0)) {
      if (keys.run && dir === 0 && p.runT > 0 && ((p.gr = (p.gr == null ? 0.15 : p.gr) - dt) > 0)) grace = true;
      else { p.runT = 0; p.lastDir = 0; }
    }
    p.runDir = dir;
    p.stage = !p.run ? 0 : p.runT < 1 ? 1 : p.runT < 2.2 ? 2 : 3;
    const sp = p.run ? [0, RUN, 205, 275][p.stage] : WALK;
    const hitting = p.atk && p.slash > 0 && !dashing;
    const tvx = dir * sp * (hitting ? 0.35 : 1);
    if (p.slideT > 0) { p.slideT -= dt; p.vx = p.face * (110 + 170 * Math.max(0, p.slideT / 0.5)); }
    else if (dashing) p.vx = p.face * 300;
    else if (!grace) p.vx += (tvx - p.vx) * Math.min(1, dt * (p.ground ? 14 : 6));
    if (dir && !(p.slideT > 0) && !dashing) p.face = dir;
    const prevY = p.y;
    p.x += p.vx * dt;
    p.x = Math.max(24, Math.min(W.width - 30, p.x));
    if (dashing) p.vy = 0; else p.vy += GRAV * dt;
    p.y += p.vy * dt;
    const wasAir = !p.ground, pvy = p.vy;
    p.ground = false;
    if (p.y >= GY) { p.y = GY; p.vy = 0; p.ground = true; }
    (W.solids || []).forEach(s => {
      if (s.dead) return;
      const l = s.x - s.w / 2 - 4, r = s.x + s.w / 2 + 4, top = GY - s.h;
      if (p.x > l && p.x < r) {
        if (prevY <= top + 1 && p.y >= top && p.vy >= 0) { p.y = top; p.vy = 0; p.ground = true; }
        else if (p.y > top + 1) { p.x = p.x < s.x ? l : r; p.vx = 0; p.runT = 0; p.slideT = 0; }
      }
    });
    if (p.ground) { p.coyote = 0.08; p.airDashed = false; } else p.coyote -= dt;
    if (canAct && pressed.jump && p.coyote > 0 && !(p.slideT > 0)) {
      p.vy = JUMPV; p.ground = false; p.coyote = 0; dust(p.x, p.y, p.face); Audio2().tick && Audio2().tick();
    }
    pressed.jump = false;
    const busy = p.slash > 0 && p.atk && p.slash > p.atk.dur * 0.4;
    // slide on the ground, air dash in the air
    if (canAct && pressed.slide && p.slideCd <= 0 && !(p.slideT > 0) && !busy) {
      if (p.ground) {
        p.slideT = 0.5; p.slideCd = 1.0; p.slash = 0; p.atk = null; p.vx = p.face * 280; Audio2().glitch && Audio2().glitch();
        for (let i = 0; i < 6; i++) dust(p.x, p.y, p.face);
      } else if (!p.airDashed) {
        p.airDashed = true; p.slideCd = 0.5; p.atk = Object.assign({ type: 'dash' }, A.dash); p.slash = A.dash.dur; p.hitDone = false; p.vy = 0; p.vx = p.face * 300; p.slashCd = 0.1;
        Audio2().glitch && Audio2().glitch();
      }
    }
    pressed.slide = false;
    if (p.ground && wasAir && pvy > 170) p.landT = 0.13;
    if (p.landT > 0) p.landT -= dt;
    // attacks: slash combo (air: downward slash), stab, backward kick
    const want = pressed.slash ? 'slash' : pressed.stab ? 'stab' : null;
    if (canAct && want && p.slashCd <= 0 && !(p.slideT > 0) && !dashing) {
      let ty;
      if (want === 'slash') ty = !p.ground ? 'down' : p.comboT > 0 ? (p.combo === 1 ? 's2' : p.combo === 2 ? 's3' : 's1') : 's1';
      else ty = (want === 'stab' && !p.ground) ? 'dstab' : want;
      const d = A[ty];
      p.atk = Object.assign({ type: ty }, d); p.slash = d.dur; p.hitDone = false; p.slashCd = ty === 's3' ? d.dur + 0.08 : d.dur * 0.66;
      p.combo = ty === 's1' ? 1 : ty === 's2' ? 2 : 0; p.comboT = ty === 's3' || ty === 'down' || ty === 'stab' ? 0 : d.dur + 0.3;
      p.vx += p.face * (ty === 's3' ? 90 : ty === 'stab' ? 120 : ty === 'dstab' ? 30 : 55);
      if (ty === 'dstab') { p.vy = Math.max(p.vy, 230); p.vx *= 0.4; }
      if (ty === 'down') { p.vy = Math.max(p.vy, 110); p.vx += p.face * 40; }
      Audio2().glitch && Audio2().glitch();
    }
    pressed.slash = false; pressed.stab = false;
    if (p.slash > 0) { p.slash -= dt; if (p.slash <= 0) p.atk = null; }
    if (p.slashCd > 0) p.slashCd -= dt;
    if (p.comboT > 0) p.comboT -= dt;
    if (p.slideCd > 0) p.slideCd -= dt;
    if (p.inv > 0) p.inv -= dt;
    if (p.hurtT > 0) p.hurtT -= dt;
    // animation phase
    const moving = Math.abs(p.vx) > 6 && p.ground;
    if (moving) p.ph += dt * (p.run ? 15 : 9.5) * Math.min(1.7, (Math.abs(p.vx) / (p.run ? RUN : WALK) * 0.4 + 0.6));
    if (moving && p.run) { p.dust -= dt; if (p.dust <= 0) { p.dust = 0.07; dust(p.x - p.face * 3, p.y, p.face); } }
    if (p.slideT > 0 && Math.random() < 0.8) dust(p.x - p.face * 6, p.y, p.face);
    p.hist.push({ x: p.x, y: p.y, t: W.t, face: p.face, ph: p.ph, vx: p.vx, vy: p.vy, ground: p.ground, sl: p.slideT > 0, ds: !!dashing, run: p.run, stage: p.stage, landT: p.landT }); if (p.hist.length > 14) p.hist.shift();
    // hitbox active window
    p.slashActive = !!(p.atk && p.slash > 0 && (1 - p.slash / p.atk.dur) >= p.atk.lo && (1 - p.slash / p.atk.dur) <= p.atk.hi);
    p.vic = (W.scene === 'chase' && W.done) || (W.scene === 'arena' && W.boss && W.boss.dead && W.boss.deathT > 0.7);
    p.hurt = p.hurtT > 0 || (W.caught > 0);
  }
  function slashBox() {
    const p = W.p, a = p.atk || { type: 's1', reach: 38 }, f = p.face, ty = a.type;
    let ry1 = -44, ry2 = 2, a1, a2;
    if (ty === 'dstab') { a1 = p.x - f * 8; a2 = p.x + f * 14; ry1 = -10; ry2 = 28; }
    else { a1 = p.x - f * 4; a2 = p.x + f * a.reach; if (ty === 's3') { ry1 = -52; ry2 = 4; } else if (ty === 'down') { ry1 = -30; ry2 = 16; } else if (ty === 'stab') { ry1 = -34; ry2 = -12; } else if (ty === 'dash') { ry1 = -38; ry2 = 0; } }
    return { x1: Math.min(a1, a2), x2: Math.max(a1, a2), y1: p.y + ry1, y2: p.y + ry2 };
  }
  /* ---------- scene logic ---------- */
  function updateHall(dt) {
    const p = W.p;
    if (p.slashActive) {
      const b = slashBox();
      W.orbs.forEach(o => {
        if (o.alive && o.x > b.x1 - 6 && o.x < b.x2 + 6 && o.y > b.y1 && o.y < b.y2 + 20 - 0) {
          o.alive = false; spark(o.x, o.y, 14, '#ff3355', 120); Audio2().glitch && Audio2().glitch();
          showMsg(ORB_LINES[o.i % ORB_LINES.length], 2800);
        }
      });
    }
    // stalker
    const d = Horror.dread(W.st);
    if (W.stalkerOn) {
      const gap = p.x - W.stalkerX, pace = 8 + d * 26;
      if (Math.abs(gap) > 150 - d * 70) W.stalkerX += Math.sign(gap) * pace * dt;
      if (Math.abs(gap) < 120 - d * 60 && W.lightsOut <= 0) { W.lightsOut = 0.35; W.stalkerX = p.x + (Math.random() < 0.5 ? -1 : 1) * (420 + Math.random() * 300); Audio2().glitch && Audio2().glitch(); }
    }
    if (W.lightsOut > 0) W.lightsOut -= dt;
    if (W.stalkerFlicker > 0) W.stalkerFlicker -= dt; else if (Math.random() < 0.01) W.stalkerFlicker = 0.1;
    if (d > 0.2 && Math.random() < dt * d * 0.15) W.lightsOut = 0.25;
  }

  function updateChase(dt) {
    const p = W.p, m = W.mon;
    // breakable walls
    if (p.slashActive) {
      const b = slashBox();
      W.solids.forEach(s => {
        if (s.kind === 'wall' && !s.dead && s.x > b.x1 - 8 && s.x < b.x2 + 8) { s.dead = true; spark(s.x, GY - 20, 22, '#4fffd8', 140); Audio2().error && Audio2().error(); }
      });
    }
    const dist = Math.max(0, p.x);
    m.x += (140 + Math.min(32, dist / 90)) * m.speed * dt * (W.caught > 0 ? 0 : 1);
    if (W.caught > 0) { W.caught -= dt; if (W.caught <= 0) rewind(); return; }
    if (m.x + 14 >= p.x - 4 && !W.done) {
      W.caught = 1.4; Horror.flash('CAUGHT', 900); Audio2().error && Audio2().error(); spark(p.x, p.y - 14, 26, '#000', 100);
    }
  }
  function rewind() {
    W.p = newPlayer(70); W.mon.x = -200; W.t = 0;
    W.solids.forEach(s => { s.dead = false; });
    showMsg('Rewind. Hold RUN. It does not get tired.', 3000);
  }

  function updateArena(dt) {
    const p = W.p, b = W.boss;
    if (b.dead) { b.deathT += dt; if (b.deathT > 2.3 && !W.done) { W.done = true; Horror.flash('ENOUGH', 1600); setTimeout(() => fadeThen(() => { const cb = W.onWin; leave(cb); }, 900), 1500); } return; }
    if (W.lives <= 0) { W.lostT = (W.lostT || 0) + dt; if (W.lostT === dt) { Horror.flash('REWIND', 1100); } if (W.lostT > 1.3) restartArena(); return; }
    b.mt -= dt;
    const fast = 1 - (b.max - b.hp) * (b.max === 3 ? 0.08 : 0.07);
    if (b.mode === 'idle') {
      b.x += ((430 - b.x) * Math.min(1, dt * 2)); b.y = 92 + Math.sin(W.t * 2) * 4;
      if (b.mt <= 0) {
        const r = Math.random();
        b.mode = r < 0.4 ? 'shots' : r < 0.75 ? 'rain' : 'slam'; b.mt = 0; b.phase = 0;
      }
    } else if (b.mode === 'shots') {
      b.y = 92 + Math.sin(W.t * 6) * 3;
      if (b.mt <= 0) {
        b.shots.push({ x: b.x - 20, y: GY - 5, v: -(95 + (b.max - b.hp) * 8) });
        b.phase++; b.mt = 1.15 * fast;
        if (b.phase >= 3) { b.mode = 'tired'; b.mt = 2.4; b.stun = 0; }
      }
    } else if (b.mode === 'rain') {
      if (b.mt <= 0) {
        b.orbs.push({ x: Math.max(40, Math.min(W.width - 40, p.x + (Math.random() - 0.5) * 60)), y: -20, warn: 0.9, fall: false });
        b.phase++; b.mt = 0.7 * fast;
        if (b.phase >= 4) { b.mode = 'tired'; b.mt = 2.6; }
      }
    } else if (b.mode === 'slam') {
      if (b.phase === 0) { b.tx = Math.max(60, Math.min(W.width - 60, p.x + p.face * 70)); b.phase = 1; b.mt = 0.7; b.warn = true; }
      else if (b.phase === 1 && b.mt <= 0) { b.x = b.tx; b.y = GY - 20; b.phase = 2; b.mt = 0; b.warn = false; spark(b.x, GY, 20, '#ff3355', 150); Audio2().error && Audio2().error(); if (Math.abs(p.x - b.x) < 22 && p.y > GY - 36) hurt(); b.mode = 'stunned'; b.mt = 2.3; b.stun = 2.3; }
    } else if (b.mode === 'tired') {
      b.y += (GY - 30 - b.y) * Math.min(1, dt * 3);
      { const tx = Math.max(40, Math.min(W.width - 40, p.x + (b.x > p.x ? 52 : -52))); b.x += (tx - b.x) * Math.min(1, dt * 2.6); }
      if (b.mt <= 0) { b.mode = 'stunned'; b.mt = 2.2; b.stun = 2.2; b.y = GY - 20; }
    } else if (b.mode === 'stunned') {
      b.y = GY - 20 + Math.sin(W.t * 20) * 1;
      if (b.mt <= 0) { b.mode = 'idle'; b.mt = 1.1; b.stun = 0; }
    }
    // shots + orbs
    b.shots.forEach(s => { s.x += s.v * dt; if (Math.abs(s.x - p.x) < 8 && p.y > GY - 12) hurt(); });
    b.shots = b.shots.filter(s => s.x > -20);
    b.orbs.forEach(o => {
      if (!o.fall) { o.warn -= dt; if (o.warn <= 0) o.fall = true; }
      else { o.y += 260 * dt; if (o.y > GY - 6) { o.gone = true; spark(o.x, GY, 12, '#ff3355', 90); } if (Math.abs(o.x - p.x) < 9 && o.y > p.y - 40 && o.y < p.y + 4) { o.gone = true; hurt(); } }
    });
    b.orbs = b.orbs.filter(o => !o.gone);
    // player slash: parry projectiles, hit the boss when he is exposed
    if (p.slashActive) {
      const bx = slashBox();
      b.shots = b.shots.filter(s => { const hit = s.x > bx.x1 - 8 && s.x < bx.x2 + 8; if (hit) { spark(s.x, s.y, 10, '#4fffd8', 110); Audio2().chime && Audio2().chime(); } return !hit; });
      b.orbs = b.orbs.filter(o => { const hit = o.fall && o.x > bx.x1 - 8 && o.x < bx.x2 + 8 && o.y > bx.y1 && o.y < bx.y2; if (hit) spark(o.x, o.y, 10, '#4fffd8', 110); return !hit; });
      if (!p.hitDone && b.mode === 'stunned' && b.x > bx.x1 - 20 && b.x < bx.x2 + 20) {
        p.hitDone = true; b.hp--; b.flash = 0.25; spark(b.x, b.y, 30, '#ff3355', 200); Audio2().error && Audio2().error();
        const keyl = ['hit1', 'hit2', 'hit3', 'hit4', 'hit5'];
        if (b.hp <= 0) { b.dead = true; b.deathT = 0; showMsg(BOSS_LINES.dead, 3500); b.shots = []; b.orbs = []; Horror.flash('I AM YOU', 1400); }
        else { showMsg(BOSS_LINES[keyl[Math.min(keyl.length - 1, b.max - b.hp - 1)]] || BOSS_LINES.hit1, 2400); b.mode = 'idle'; b.mt = 1.4; b.x = 430; b.y = 92; }
        updateHp();
      }
    }
    if (b.flash > 0) b.flash -= dt;
  }
  function hurt() {
    const p = W.p;
    if (p.inv > 0 || W.lives <= 0 || p.slideT > 0) return;
    W.lives--; p.inv = 1.3; p.hurtT = 0.4; p.vy = -120; p.vx = -p.face * 90; spark(p.x, p.y - 14, 18, '#ff3355', 130);
    Audio2().error && Audio2().error(); updateHp();
  }
  function restartArena() {
    const key = W.key;
    W.boss = { x: 430, y: 92, hp: key ? 3 : 6, max: key ? 3 : 6, mode: 'idle', mt: 1.5, stun: 0, shots: [], orbs: [], flash: 0, dead: false, deathT: 0 };
    W.lives = W.maxLives; W.lostT = 0; W.p = newPlayer(70); updateHp();
    showMsg('Again. Jump the shots. Slash when he drops.', 3000);
  }

  /* ---------- drawing ---------- */
  /* two-bone limb: from (x1,y1) to target (x2,y2); the joint bends toward `bend` (+1 forward, -1 back) */
  function bone2(x1, y1, x2, y2, l1, l2, f, bend) {
    let dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.01;
    const max = l1 + l2 - 0.2;
    if (d > max) { x2 = x1 + dx / d * max; y2 = y1 + dy / d * max; dx = x2 - x1; dy = y2 - y1; d = max; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = x1 + dx * a / d, my = y1 + dy * a / d;
    const nx = -dy / d, ny = dx / d;
    const sgn = (nx * f * bend >= 0 ? 1 : -1) * (Math.abs(nx) < 0.05 ? (f * bend) : 1);
    return { kx: mx + nx * h * sgn, ky: my + ny * h * sgn, x: x2, y: y2 };
  }

  function drawZero(x, y, p, t) {
    if (p.inv > 0 && Math.floor(t * 20) % 2 && !(p.hurtT > 0)) return;
    const hero = window.HERO_G || 'm';
    const running = Math.abs(p.vx) > 6 && p.ground && p.run, dashing = p.atk && p.atk.type === 'dash' && p.slash > 0;
    // afterimages: tinted silhouettes of earlier poses, like a dash trail
    if (!TINT && (running || p.slideT > 0 || dashing)) {
      const strong = p.slideT > 0 || dashing || Math.abs(p.vx) > 230;
      const steps = strong ? [2, 4, 6, 8, 10] : Math.abs(p.vx) > 175 ? [3, 5, 8] : [3, 6];
      steps.forEach((k, i) => {
        const hh = p.hist[p.hist.length - 1 - k]; if (!hh || Math.abs(hh.x - p.x) < 3) return;
        ctx.globalAlpha = 0.36 - i * 0.07;
        Sprites.draw(ctx, R(hh.x - W.cam), R(hh.y), { face: hh.face, ph: hh.ph, vx: hh.vx, vy: hh.vy, ground: hh.ground, run: hh.run, stage: hh.stage, slideT: hh.sl ? 1 : 0, atk: hh.ds ? Object.assign({ type: 'dash' }, Sprites.ATK.dash) : null, slash: hh.ds ? 0.1 : 0 }, t, hero, { tint: i % 2 ? '#7fe9ff' : '#ff4d6d', noFx: true });
        ctx.globalAlpha = 1;
      });
      if (running) { ctx.globalAlpha = 0.5; for (let q = 0; q < 4; q++) rect(x - p.face * (14 + q * 7 + hash(q + Math.floor(t * 20)) * 6), y - 30 + q * 8, 8 + q * 2, 1, '#ffd0d8'); ctx.globalAlpha = 1; }
    }
    if (!TINT) { const sY = p.ground ? y : GY, hgt = Math.max(0, sY - y), sh = Math.max(0.4, 1 - hgt / 110), sw = Math.round(14 * sh); ctx.globalAlpha = 0.5 * sh; rect(x - (sw >> 1), sY, sw, 2, '#000'); ctx.globalAlpha = 1; }
    const dis = W.caught > 0 ? Math.min(1, (1.4 - W.caught) / 1.1) : 0;
    Sprites.draw(ctx, x, y, p, t, hero, { floorY: GY, dissolve: dis });
    if (dis > 0 && Math.random() < 0.7) W.parts.push({ x: p.x + (Math.random() - 0.5) * 14, y: p.y - Math.random() * 40, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, life: 0.8, c: Math.random() < 0.5 ? '#ff3355' : '#e8e8ee', soft: 1 });
  }

  function drawParts(dt, cam) {
    W.parts.forEach(q => { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.soft ? 0 : 260) * dt; });
    W.parts = W.parts.filter(q => q.life > 0);
    W.parts.forEach(q => { ctx.globalAlpha = Math.min(1, q.life * 2.5); rect(q.x - cam, q.y, 2, 2, q.c); });
    ctx.globalAlpha = 1;
  }

  function vignette(s, oy, d, center, rad) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const px = center * s, py = oy + 110 * s, r = Math.max(canvas.width, canvas.height) * rad;
    const g = ctx.createRadialGradient(px, py, 30, px, py, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (0.68 + d * 0.15) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawHall(vw, d) {
    const cam = W.cam, circus = document.body.classList.contains('circus');
    rect(0, 0, vw, VH, '#060306');
    rect(0, 0, vw, 38, '#0d090b'); rect(0, 38, vw, 102, '#150b0e'); rect(0, 140, vw, 40, '#0a0809'); rect(0, 140, vw, 2, '#3a0713');
    ctx.fillStyle = '#1b0f13';
    for (let x = -((cam) % 80); x < vw; x += 80) ctx.fillRect(R(x), 38, 1, 102);
    ctx.fillStyle = '#10090c';
    for (let x = -((cam * 0.5) % 40); x < vw + 40; x += 40) ctx.fillRect(R(x), 150 + ((x * 3) % 5 | 0), 1, 30);
    rect(0, 12, vw, 3, '#1d1517'); rect(0, 15, vw, 1, '#0a0607');
    ctx.font = '5px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
    W.lines.forEach(l => {
      if (W.target < l.min && l.min > 2) return;
      const x = l.x - cam; if (x < -220 || x > vw + 20) return;
      const wob = hash(Math.floor(W.t * 6) + l.x) > 0.97 ? 1 : 0;
      ctx.fillStyle = 'rgba(' + (110 + d * 90) + ',0,25,' + (0.5 + d * 0.4) + ')';
      ctx.fillText(l.t, R(x + wob), 54 + (l.x % 3) * 8);
    });
    // terminal
    { const x = 90 - cam; rect(x - 14, 96, 28, 44, '#1a1a1a'); rect(x - 11, 100, 22, 16, '#020'); rect(x - 9, 103 + ((W.t * 3 | 0) % 2) * 3, 9, 1, '#ff2050'); rect(x - 9, 108, 14, 1, '#ff2050'); }
    // doors
    const door = (x, label, state, accent) => {
      if (x < -40 || x > vw + 40) return;
      rect(x - 24, 52, 48, 90, '#251417');
      rect(x - 20, 56, 40, 86, state === 'done' ? '#0e0a0b' : state === 'open' ? '#2c1216' : '#171011');
      rect(x - 17, 60, 34, 50, accent || '#000');
      rect(x + 11, 102, 3, 3, '#3a2a2d');
      rect(x - 15, 44, 30, 8, state === 'open' ? (Math.sin(W.t * 5) > 0 ? '#ff0040' : '#800020') : state === 'done' ? '#402028' : '#2a1a1d');
      ctx.fillStyle = '#000'; ctx.font = '4px "Press Start 2P", monospace'; ctx.fillText(label, R(x - label.length * 2), 46);
      if (state === 'locked') { rect(x - 12, 90, 24, 2, '#5a0a1a'); rect(x - 1, 84, 2, 14, '#5a0a1a'); }
      if (state === 'open') rect(x - 40, 50, 80, 100, 'rgba(255,0,64,' + (0.06 + 0.04 * Math.sin(W.t * 3)) + ')');
    };
    for (let i = 1; i <= 10; i++) door(DOOR_X(i) - cam, String(i).padStart(2, '0'), i === W.target ? 'open' : i < W.target ? 'done' : 'locked');
    const a = az(W.st);
    door(ROOM_DOORS.waiting - cam, 'WAIT', W.target >= 6 ? 'open' : 'locked', '#0a1a1a');
    door(ROOM_DOORS.archive - cam, 'ARCH', W.target >= 6 ? 'open' : 'locked', '#1a0a1a');
    door(ROOM_DOORS.workshop - cam, 'ALAN', a.frags.length >= 6 ? 'open' : 'locked', '#1a1a0a');
    // monitor
    if (W.target >= 5) {
      const x = 4560 - cam;
      if (x > -60 && x < vw + 60) {
        rect(x - 28, 74, 56, 52, '#151013'); rect(x - 24, 78, 48, 38, '#000');
        const look = Math.max(-3, Math.min(3, (W.p.x - 4560) / 40));
        rect(x - 15, 90, 10, 10, '#ff0040'); rect(x + 5, 90, 10, 10, '#ff0040');
        rect(x - 11 + look, 93, 3, 5, '#000'); rect(x + 9 + look, 93, 3, 5, '#000');
        if (hash(Math.floor(W.t * 3)) > 0.9) rect(x - 24, 88, 48, 14, '#000');
        rect(x - 12, 108, 24, 2, '#40101a');
      }
    }
    // fragments
    if (W.st.session >= 6) (Story.FRAGMENTS || []).forEach(f => {
      if (f.where !== 'hall' || a.frags.includes(f.id)) return;
      const x = f.x - cam; if (x < -20 || x > vw + 20) return;
      const bob = Math.sin(W.t * 2 + f.id) * 3, pulse = 0.5 + 0.5 * Math.sin(W.t * 4 + f.id);
      rect(x - 4, 118 + bob, 9, 11, 'rgba(255,0,64,' + (0.3 + pulse * 0.5) + ')'); rect(x - 1, 121 + bob, 3, 3, '#fff');
    });
    // orbs
    W.orbs.forEach(o => {
      if (!o.alive) return; const x = o.x - cam; if (x < -20 || x > vw + 20) return;
      const bob = Math.sin(W.t * 3 + o.i) * 4;
      rect(x - 4, o.y + bob - 4, 8, 8, '#3a0a22'); rect(x - 2, o.y + bob - 2, 4, 4, hash(Math.floor(W.t * 8) + o.i) > 0.5 ? '#ff3355' : '#4fffd8');
    });
    // lights
    for (let lx = 100; lx < HALL_W; lx += 300) {
      const x = lx - cam; if (x < -60 || x > vw + 60) continue;
      const bad = hash(Math.floor(W.t * (4 + d * 14)) + lx) < d * 0.5, on = !bad && W.lightsOut <= 0;
      rect(x - 14, 22, 28, 3, on ? '#e8d8c8' : '#2a2222');
      if (on) {
        const g = ctx.createRadialGradient(x, 25, 2, x, 90, 110);
        g.addColorStop(0, circus ? 'rgba(255,120,200,0.20)' : 'rgba(255,40,70,' + (0.16 + d * 0.1) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(R(x - 130), 25, 260, 130);
      }
    }
    // stalker
    if (W.stalkerOn) {
      const x = W.stalkerX - cam;
      if (x > -30 && x < vw + 30 && W.stalkerFlicker <= 0) {
        rect(x - 6, 90, 12, 50, '#000'); rect(x - 5, 82, 10, 10, '#000'); rect(x - 12, 98, 4, 30, '#000'); rect(x + 8, 98, 4, 30, '#000');
        rect(x - 3, 85, 2, 2, '#ff0030'); rect(x + 1, 85, 2, 2, '#ff0030');
      }
    }
  }

  function drawRoom(vw, d) {
    const cam = W.cam, sc = W.scene, w = W.width;
    const pal = { waiting: ['#0c1517', '#112024', '#071012'], archive: ['#150c17', '#1d1121', '#0e0710'], workshop: ['#17140c', '#221d11', '#0f0c07'] }[sc];
    rect(0, 0, vw, VH, '#050305'); rect(0, 0, vw, 140, pal[1]); rect(0, 28, vw, 112, pal[0]); rect(0, 140, vw, 40, pal[2]); rect(0, 140, vw, 2, '#3a0713');
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = -((cam) % 60); x < vw; x += 60) ctx.fillRect(R(x), 28, 1, 112);
    // door back
    { const x = 40 - cam; rect(x - 18, 70, 36, 70, '#251417'); rect(x - 14, 74, 28, 66, '#050304'); rect(x + 8, 108, 2, 3, '#aa7'); }
    const a = az(W.st);
    if (sc === 'waiting') {
      [[200, 64], [300, 0]].forEach(([x0]) => {});
      const c = 200 - cam; rect(c - 30, 112, 60, 20, '#2a1a22'); rect(c - 30, 100, 60, 14, '#3a2430'); rect(c - 30, 130, 4, 10, '#000'); rect(c + 26, 130, 4, 10, '#000');
      const v = 320 - cam; rect(v - 14, 80, 28, 60, '#10202a'); rect(v - 10, 86, 20, 26, '#06141a'); rect(v - 8, 120, 16, 6, '#000'); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(W.t * 3); rect(v - 8, 90, 16, 16, '#4fffd8'); ctx.globalAlpha = 1;
      const k = 420 - cam; rect(k - 8, 60, 16, 16, '#ddd'); rect(k - 1, 62, 1, 6, '#000'); rect(k - 1, 67, 4, 1, '#000');
      const pl = 120 - cam; rect(pl - 5, 126, 10, 14, '#2a1a1a'); rect(pl - 1, 108, 2, 18, '#2a3a1a'); rect(pl - 6, 106, 5, 3, '#2a3a1a'); rect(pl + 2, 110, 5, 3, '#2a3a1a');
    } else if (sc === 'archive') {
      [170, 290, 410, 530].forEach((xx, i) => {
        const x = xx - cam; rect(x - 20, 70, 40, 70, '#2a2230'); for (let r = 0; r < 4; r++) { rect(x - 18, 74 + r * 16, 36, 1, '#000'); rect(x - 4, 80 + r * 16, 8, 2, '#c8b'); }
      });
      if (hash(Math.floor(W.t * 2)) > 0.6) rect(300 - cam, 30, 90, 1, 'rgba(255,0,64,0.4)');
    } else if (sc === 'workshop') {
      const d1 = 270 - cam; rect(d1 - 36, 108, 72, 8, '#3a2a1a'); rect(d1 - 32, 116, 4, 24, '#2a1a0e'); rect(d1 + 28, 116, 4, 24, '#2a1a0e');
      rect(d1 - 14, 90, 28, 18, '#0a0a0a'); ctx.globalAlpha = 0.7 + 0.2 * Math.sin(W.t * 4); rect(d1 - 11, 93, 22, 12, '#2fd7ff'); ctx.globalAlpha = 1;
      const s1 = 130 - cam; rect(s1 - 18, 70, 36, 34, '#ddd8c8'); rect(s1 - 6, 80, 4, 4, '#222'); rect(s1 + 3, 80, 4, 4, '#222'); rect(s1 - 5, 92, 10, 2, '#a22');
      const c = 430 - cam; rect(c - 26, 124, 52, 8, '#2a2a3a'); rect(c - 26, 132, 3, 8, '#000'); rect(c + 23, 132, 3, 8, '#000');
    }
    // fragments
    (Story.FRAGMENTS || []).forEach(f => {
      if (f.where !== sc || a.frags.includes(f.id)) return;
      const x = f.x - cam, bob = Math.sin(W.t * 2 + f.id) * 3, pulse = 0.5 + 0.5 * Math.sin(W.t * 4 + f.id);
      rect(x - 4, 118 + bob, 9, 11, 'rgba(255,0,64,' + (0.3 + pulse * 0.5) + ')'); rect(x - 1, 121 + bob, 3, 3, '#fff');
    });
    // lamp
    const lx = (w / 2) - cam; rect(lx - 12, 20, 24, 3, '#e8d8c8');
    const g = ctx.createRadialGradient(lx, 24, 2, lx, 90, 130); g.addColorStop(0, 'rgba(255,200,160,0.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(R(lx - 150), 24, 300, 130);
  }

  function drawChase(vw, d) {
    const cam = W.cam, m = W.mon;
    rect(0, 0, vw, VH, '#050204'); rect(0, 0, vw, 140, '#0e070b'); rect(0, 140, vw, 40, '#080507'); rect(0, 140, vw, 2, '#5a0a1a');
    // server racks (parallax)
    for (let x = -((cam * 0.6) % 60); x < vw + 60; x += 60) {
      rect(x, 40, 34, 100, '#150d12'); for (let r = 0; r < 8; r++) { rect(x + 3, 46 + r * 11, 28, 1, '#000'); const on = hash(Math.floor(W.t * 3) + r + Math.floor((x + cam * 0.6) / 60) * 7) > 0.6; rect(x + 24, 48 + r * 11, 3, 2, on ? '#ff2244' : '#3a0e18'); }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = -((cam) % 40); x < vw; x += 40) ctx.fillRect(R(x), 142, 1, 38);
    // goal terminal
    { const x = W.goal - cam; rect(x - 18, 90, 36, 50, '#1a1a1a'); rect(x - 14, 94, 28, 22, '#021'); ctx.globalAlpha = 0.7 + 0.3 * Math.sin(W.t * 6); rect(x - 10, 98, 20, 3, '#1aff6a'); rect(x - 10, 105, 14, 3, '#1aff6a'); ctx.globalAlpha = 1; rect(x - 20, 70, 40, 3, '#1aff6a'); }
    // solids
    W.solids.forEach(s => {
      if (s.dead) return; const x = s.x - cam; if (x < -40 || x > vw + 40) return;
      if (s.kind === 'crate') { rect(x - s.w / 2, GY - s.h, s.w, s.h, '#2a1a1e'); rect(x - s.w / 2, GY - s.h, s.w, 2, '#5a3a40'); rect(x - s.w / 2 + 2, GY - s.h + 3, s.w - 4, s.h - 5, '#1a1014'); }
      else { for (let k = 0; k < s.h; k += 4) { const gl = hash(Math.floor(W.t * 10) + k + s.x) > 0.5; rect(x - s.w / 2 + (gl ? 1 : -1), GY - k - 4, s.w, 4, gl ? '#4fffd8' : '#14867a'); } }
    });
    // monster: the Sweeper
    { const x = m.x - cam;
      // void behind it
      const gr = ctx.createLinearGradient(R(x - 40), 0, R(x + 30), 0); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, R(x - 40), VH); ctx.fillStyle = gr; ctx.fillRect(R(x - 40), 0, 70, VH);
      if (x > -80 && x < vw + 60) {
        const wob = Math.sin(W.t * 16) * 1.5;
        rect(x - 8, 84 + wob, 16, 56, '#000'); rect(x - 10, 74 + wob, 20, 14, '#000');
        limb(x + 6, 96, x + 26, 118 + Math.sin(W.t * 10) * 4, 4, '#000'); limb(x + 4, 104, x + 24, 128 + Math.cos(W.t * 10) * 4, 4, '#000');
        rect(x + 0, 78 + wob, 3, 3, '#ff0030'); rect(x + 5, 78 + wob, 3, 3, '#ff0030');
        for (let k = 0; k < 5; k++) rect(x - 30 - k * 8, 80 + hash(k + Math.floor(W.t * 12)) * 56, 8 + hash(k) * 12, 2, 'rgba(255,0,48,0.6)');
      }
    }
  }

  function drawArena(vw, d) {
    const cam = W.cam, b = W.boss;
    rect(0, 0, vw, VH, '#040208'); rect(0, 0, vw, 140, '#0d0714'); rect(0, 140, vw, 40, '#07040c'); rect(0, 140, vw, 2, '#5a0a3a');
    // monitor wall
    for (let i = 0; i < 12; i++) {
      const x = i * 80 - cam * 0.5 + 30; if (x < -50 || x > vw + 10) continue;
      rect(x, 30 + (i % 2) * 24, 44, 30, '#120a1a'); const on = hash(Math.floor(W.t * 2) + i) > 0.4;
      rect(x + 3, 33 + (i % 2) * 24, 38, 24, on ? '#2a0a24' : '#080410');
      if (on) { rect(x + 10, 40 + (i % 2) * 24, 6, 6, '#ff2060'); rect(x + 26, 40 + (i % 2) * 24, 6, 6, '#ff2060'); }
    }
    // boss warning marks
    b.orbs.forEach(o => {
      const x = o.x - cam;
      if (!o.fall) { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(W.t * 30); rect(x - 4, 20, 8, 120, '#ff2244'); ctx.globalAlpha = 1; }
      else { rect(x - 4, o.y - 4, 8, 8, '#ff2244'); rect(x - 2, o.y - 2, 4, 4, '#fff'); }
    });
    if (b.warn) { ctx.globalAlpha = 0.3 + 0.3 * Math.sin(W.t * 30); rect(b.tx - cam - 22, 30, 44, 112, '#ff2244'); ctx.globalAlpha = 1; }
    b.shots.forEach(s => { const x = s.x - cam; rect(x - 5, s.y - 4, 10, 8, '#ff2244'); rect(x - 3, s.y - 2, 6, 4, '#fff'); });
    // the Director: monitor head, suit
    if (!b.dead || Math.floor(W.t * 20) % 2) {
      const x = b.x - cam, y = b.y, shake = b.flash > 0 ? (Math.random() - 0.5) * 4 : 0;
      const stunned = b.mode === 'stunned';
      rect(x - 10 + shake, y + 12, 20, 30, stunned ? '#2a2236' : '#1a1226');
      rect(x - 9 + shake, y + 28, 7, 14, '#0a0610'); rect(x + 2 + shake, y + 28, 7, 14, '#0a0610');
      rect(x - 14 + shake, y - 16, 28, 26, '#242030'); rect(x - 12 + shake, y - 14, 24, 21, '#000');
      const blink = hash(Math.floor(W.t * 5)) > 0.93;
      if (!blink) { rect(x - 8 + shake, y - 8, 5, 5, stunned ? '#4fffd8' : '#ff0040'); rect(x + 3 + shake, y - 8, 5, 5, stunned ? '#4fffd8' : '#ff0040'); }
      rect(x - 6 + shake, y + 1, 12, 1, stunned ? '#4fffd8' : '#ff0040');
      if (stunned) { for (let k = 0; k < 3; k++) rect(x - 16 + hash(k + Math.floor(W.t * 20)) * 30, y - 16 + hash(k * 3 + Math.floor(W.t * 20)) * 50, 6, 1, '#4fffd8'); }
      if (!stunned && b.mode !== 'idle' && b.mode !== 'slam') rect(x - 2, y - 24, 4, 4, '#ff0040');
    }
  }

  function draw() {
    const s = scaleOf(), oy = (canvas.height - VH * s) / 2, vw = canvas.width / s;
    const d = (window.Horror ? Horror.dread(W.st) : 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, oy);
    ctx.imageSmoothingEnabled = false;
    if (W.scene === 'hall') drawHall(vw, d); else if (W.scene === 'chase') drawChase(vw, d); else if (W.scene === 'arena') drawArena(vw, d); else drawRoom(vw, d);
    // solids in non-chase scenes none. player
    drawZero(R(W.p.x - W.cam), R(W.p.y), W.p, W.t);
    drawParts(0.016, W.cam);
    // hit flash
    if (W.scene === 'arena' && W.lives <= 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (W.scene === 'hall' || ROOMS[W.scene]) {
      vignette(s, oy, d, W.p.x - W.cam, 0.78 - d * 0.28);
      if (W.lightsOut > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    } else if (W.scene === 'chase') vignette(s, oy, 0.3, W.p.x - W.cam, 0.8);
    if (document.body.classList.contains('circus') && W.scene === 'hall') { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,80,200,0.07)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  }

  /* ---------- main loop ---------- */
  function loop(now) {
    if (!W) return;
    if (W.paused) { W.last = now; W.raf = requestAnimationFrame(loop); return; }
    const dt = Math.min(0.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    updatePlayer(dt);
    if (W.scene === 'hall') updateHall(dt); else if (W.scene === 'chase') updateChase(dt); else if (W.scene === 'arena') updateArena(dt);
    const vw = canvas.width / scaleOf();
    W.cam = Math.max(0, Math.min(W.width - vw, W.p.x - vw / 2 + W.p.face * 18));
    // interact
    const n = (!W.entering && !W.done) ? nearest() : null;
    if (pressed.act) { pressed.act = false; if (n) n.fn(); }
    let hint = '';
    if (n) hint = '[E / ACT] ' + n.label;
    else if (W.t < 9 && W.scene === 'hall') hint = 'A / D walk. Shift run (3 stages). W jump. J slash combo. K stab.  S slide. Esc pause.';
    else if (W.scene === 'arena' && W.t < 8) hint = 'Jump the shots. Slash falling orbs. Slash him when he drops.';
    hintEl.textContent = hint;
    draw();
    W.raf = requestAnimationFrame(loop);
  }

  window.World = {
    enter, run,
    setPaused(v) { if (W) { W.paused = v; keys.left = keys.right = keys.run = false; } },
    canRestart() { return !!W && (W.scene === 'chase' || W.scene === 'arena'); },
    restartScene() { if (!W) return; if (W.scene === 'chase') rewind(); else if (W.scene === 'arena') restartArena(); },
    get active() { return !!W; },
    get mode() { return W ? W.scene : null; },
    _debug: () => W
  };
})();
