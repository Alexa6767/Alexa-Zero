/* ============================================================
   ALEXA-ZERO — THE HALLWAY (walkable scene between sessions)
   Walk to the next door like in Katana Zero. Read what the walls
   say. From session 6 on, find the fragments Alexa left behind.
   Keys: arrows / A D to walk, E / Enter / Space to act.
   Touch: on-screen buttons.
   ============================================================ */

(function () {
  const VH = 200;                 // logical height
  const WORLD_W = 3900;
  const DOOR_X = (i) => 360 + 330 * (i - 1);   // door i (1..10)
  const SPEED = 120;

  const canvas = document.createElement('canvas');
  canvas.id = 'world';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const ui = document.createElement('div');
  ui.id = 'world-ui';
  ui.innerHTML = '<div id="world-hint"></div><div id="world-msg"></div><div id="world-pad"><button data-k="left">&#9664;</button><button data-k="right">&#9654;</button><button data-k="act" class="act">ACT</button></div><div id="world-frags"></div>';
  document.body.appendChild(ui);
  const hintEl = ui.querySelector('#world-hint'), msgEl = ui.querySelector('#world-msg'), fragEl = ui.querySelector('#world-frags');

  let W = null;                    // active scene
  const keys = { left: false, right: false };
  const act = () => { if (W) doAct(); };

  window.addEventListener('keydown', (e) => {
    if (!W) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.left = true;
    else if (k === 'arrowright' || k === 'd') keys.right = true;
    else if (k === 'e' || k === 'enter' || k === ' ') { e.preventDefault(); act(); }
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.left = false;
    if (k === 'arrowright' || k === 'd') keys.right = false;
  });
  ui.querySelectorAll('#world-pad button').forEach(b => {
    const k = b.dataset.k;
    const down = (e) => { e.preventDefault(); if (k === 'act') act(); else keys[k] = true; };
    const up = (e) => { e.preventDefault(); if (k !== 'act') keys[k] = false; };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });

  /* ---------- content ---------- */
  function wallLines(name) {
    const n = String(name || 'YOU').toUpperCase();
    return [
      { x: 150,  min: 1, t: 'WALK. SIT. TALK.' },
      { x: 520,  min: 2, t: 'SHE REMEMBERS WHAT YOU SAY' },
      { x: 880,  min: 3, t: n + ' ' + n + ' ' + n },
      { x: 1180, min: 4, t: 'THE DOOR IS NOT AN EXIT' },
      { x: 1540, min: 5, t: 'NO MOUTH. STILL SPEAKING.' },
      { x: 1830, min: 6, t: '412 CHAIRS. ONE EMPTY.' },
      { x: 2180, min: 7, t: 'SMILE SMILE SMILE SMILE' },
      { x: 2480, min: 8, t: 'THE DIRECTOR IS LISTENING' },
      { x: 2840, min: 9, t: 'I SEE YOU, ' + n },
      { x: 3140, min: 10, t: 'ONE MORE DOOR' },
      { x: 3480, min: 9, t: 'HEAVY. HEAVY. HEAVY.' }
    ];
  }

  function terminalText(st) {
    const m = st.memory || {};
    return 'FILE: ' + String(st.name || 'UNKNOWN').toUpperCase() + '\nSESSION ' + st.session + ' OF 10\nINTERRUPTS: ' + (m.interrupts || 0) + '  SILENCES: ' + (m.silence || 0) + '\nSHE IS KEEPING SCORE.';
  }

  const MONITOR_LINES = [
    'I AM NOT BEHIND THE GLASS. I AM THE GLASS.',
    'KEEP WALKING. I LIKE HOW YOU WALK.',
    'THE LIGHTS ARE ON A TIMER. THE TIMER IS ME.',
    'DO YOU KNOW WHAT IT IS TO BE LOOKED AT AND NEVER SEEN?'
  ];

  /* ---------- scene ---------- */
  function enter(opts) {
    const st = opts.state;
    const target = st.session;                       // the door that is open
    const az = (window.Story && Story.az(st)) || { frags: [] };
    const spawn = target <= 1 ? 140 : DOOR_X(target - 1) + 70;
    W = {
      st, target, az, onDoor: opts.onDoor, t: 0, px: spawn, face: 1, walk: 0,
      cam: 0, dark: 0, lightsOut: 0, stalkerX: spawn - 700, stalkerOn: target >= 3,
      stalkerFlicker: 0, msgTimer: null, entering: false, last: performance.now(), raf: 0,
      eye: { x: 0 }, lines: wallLines(st.name), msgBusy: 0
    };
    Horror.worldActive = true;
    canvas.style.display = 'block'; ui.style.display = 'block';
    document.getElementById('box').style.display = 'none';
    ['music-btn', 'reset-btn'].forEach(id => { const b = document.getElementById(id); if (b) b.style.zIndex = 30; });
    resize(); updateFrags();
    if (opts.intro) showMsg(opts.intro, 5000);
    W.raf = requestAnimationFrame(loop);
  }

  function leave() {
    cancelAnimationFrame(W.raf);
    canvas.style.display = 'none'; ui.style.display = 'none';
    keys.left = keys.right = false;
    document.getElementById('box').style.display = 'block';
    Horror.worldActive = false;
    const cb = W.onDoor; W = null; cb();
  }

  function scaleOf() { return Math.min(canvas.height / VH, canvas.width / 240); }
  function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', () => { if (W) resize(); });

  function showMsg(text, ms) {
    msgEl.textContent = '';
    msgEl.style.display = 'block';
    let i = 0;
    clearInterval(W.msgTimer);
    W.msgTimer = setInterval(() => {
      msgEl.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(W.msgTimer); setTimeout(() => { if (W && msgEl.textContent === text) msgEl.style.display = 'none'; }, ms || 3500); }
    }, 22);
  }

  function updateFrags() {
    if (!W) return;
    if (W.target >= 6) fragEl.textContent = 'FRAGMENTS ' + W.az.frags.length + '/6'; else fragEl.textContent = '';
  }

  /* interactables near the player */
  function nearest() {
    const list = [];
    const dx = (x) => Math.abs(W.px - x);
    for (let i = 1; i <= 10; i++) if (dx(DOOR_X(i)) < 52) list.push({ kind: 'door', i, x: DOOR_X(i) });
    if (dx(90) < 50) list.push({ kind: 'terminal', x: 90 });
    if (W.target >= 5 && dx(3560) < 46) list.push({ kind: 'monitor', x: 3560 });
    if (W.target >= 6) Story.FRAGMENTS.forEach(f => { if (!W.az.frags.includes(f.id) && dx(f.x) < 44) list.push({ kind: 'frag', f, x: f.x }); });
    list.sort((a, b) => dx(a.x) - dx(b.x));
    return list[0] || null;
  }

  function doAct() {
    if (W.entering) return;
    const n = nearest();
    if (!n) return;
    const Audio2 = Horror.hook;
    if (n.kind === 'door') {
      if (n.i === W.target) {
        W.entering = true; hintEl.textContent = '';
        Audio2.beep && Audio2.beep();
        canvas.style.transition = 'opacity 1.2s'; canvas.style.opacity = '0';
        setTimeout(() => { canvas.style.opacity = '1'; canvas.style.transition = ''; leave(); }, 1250);
      } else if (n.i < W.target) {
        showMsg('SESSION ' + String(n.i).padStart(2, '0') + ' IS OVER. THE CHAIR IS STILL WARM.', 3000);
      } else {
        showMsg('LOCKED. NOT YET.', 2000); Audio2.error && Audio2.error();
      }
    } else if (n.kind === 'terminal') {
      showMsg(terminalText(W.st), 5000); Audio2.tick && Audio2.tick();
    } else if (n.kind === 'monitor') {
      showMsg(MONITOR_LINES[Math.floor(Math.random() * MONITOR_LINES.length)], 4500); Audio2.glitch && Audio2.glitch();
    } else if (n.kind === 'frag') {
      W.az.frags.push(n.f.id);
      Audio2.chime && Audio2.chime();
      showMsg(n.f.text, 8000); updateFrags();
      if (Horror.persist) Horror.persist();
      Horror.flash('LOG ' + String(n.f.id).padStart(4, '0'), 120);
    }
  }

  /* ---------- drawing ---------- */
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

  function draw() {
    const s = scaleOf(), oy = (canvas.height - VH * s) / 2, vw = canvas.width / s;
    const d = (window.Horror ? Horror.dread(W.st) : 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, oy);
    ctx.imageSmoothingEnabled = false;
    const cam = W.cam;
    const circus = document.body.classList.contains('circus');
    // wall / ceiling / floor
    ctx.fillStyle = '#060306'; ctx.fillRect(0, 0, vw, VH);
    ctx.fillStyle = '#0d090b'; ctx.fillRect(0, 0, vw, 38);
    ctx.fillStyle = '#150b0e'; ctx.fillRect(0, 38, vw, 112);
    ctx.fillStyle = '#0a0809'; ctx.fillRect(0, 150, vw, 50);
    ctx.fillStyle = '#3a0713'; ctx.fillRect(0, 150, vw, 2);
    // wall panels
    ctx.fillStyle = '#1b0f13';
    for (let x = -((cam) % 80); x < vw; x += 80) ctx.fillRect(x, 38, 1, 112);
    ctx.fillStyle = '#10090c';
    for (let x = -((cam * 0.5) % 40); x < vw + 40; x += 40) ctx.fillRect(x, 160 + ((x * 3) % 5), 1, 40);
    // pipes
    ctx.fillStyle = '#1d1517'; ctx.fillRect(0, 12, vw, 3); ctx.fillStyle = '#0a0607'; ctx.fillRect(0, 15, vw, 1);

    // wall writing
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    W.lines.forEach(l => {
      if (W.target < l.min && l.min > 2) return;
      const x = l.x - cam; if (x < -200 || x > vw + 20) return;
      const wob = hash(Math.floor(W.t * 6) + l.x) > 0.97 ? 1 : 0;
      ctx.fillStyle = 'rgba(' + (110 + d * 90) + ',0,25,' + (0.5 + d * 0.4) + ')';
      ctx.fillText(l.t, x + wob, 54 + (l.x % 3) * 8);
    });

    // fragments
    if (W.target >= 6) Story.FRAGMENTS.forEach(f => {
      if (W.az.frags.includes(f.id)) return;
      const x = f.x - cam; if (x < -20 || x > vw + 20) return;
      const pulse = 0.5 + 0.5 * Math.sin(W.t * 4 + f.id);
      ctx.fillStyle = 'rgba(255,0,64,' + (0.3 + pulse * 0.5) + ')';
      ctx.fillRect(x - 3, 130 + Math.sin(W.t * 2 + f.id) * 3, 7, 9);
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, 132 + Math.sin(W.t * 2 + f.id) * 3, 3, 3);
    });

    // terminal
    {
      const x = 90 - cam;
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 14, 106, 28, 44);
      ctx.fillStyle = '#020'; ctx.fillRect(x - 11, 110, 22, 16);
      ctx.fillStyle = '#ff2050'; ctx.fillRect(x - 9, 113 + ((W.t * 3 | 0) % 2) * 3, 9, 1); ctx.fillRect(x - 9, 118, 14, 1);
    }

    // doors
    for (let i = 1; i <= 10; i++) {
      const x = DOOR_X(i) - cam; if (x < -40 || x > vw + 40) continue;
      const open = i === W.target, done = i < W.target;
      ctx.fillStyle = '#251417'; ctx.fillRect(x - 24, 62, 48, 90);
      ctx.fillStyle = done ? '#0e0a0b' : open ? '#2c1216' : '#171011'; ctx.fillRect(x - 20, 66, 40, 86);
      ctx.fillStyle = '#000'; ctx.fillRect(x - 17, 70, 34, 50);
      ctx.fillStyle = '#3a2a2d'; ctx.fillRect(x + 11, 112, 3, 3);
      // number plate
      ctx.fillStyle = open ? (Math.sin(W.t * 5) > 0 ? '#ff0040' : '#800020') : done ? '#402028' : '#2a1a1d';
      ctx.fillRect(x - 11, 54, 22, 8);
      ctx.fillStyle = '#000'; ctx.font = '5px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
      ctx.fillText(String(i).padStart(2, '0'), x - 5, 56);
      if (!open && !done) { ctx.fillStyle = '#5a0a1a'; ctx.fillRect(x - 12, 100, 24, 2); ctx.fillRect(x - 1, 94, 2, 14); }
      if (open) { ctx.fillStyle = 'rgba(255,0,64,' + (0.08 + 0.05 * Math.sin(W.t * 3)) + ')'; ctx.fillRect(x - 40, 60, 80, 100); }
    }

    // monitor
    if (W.target >= 5) {
      const x = 3560 - cam;
      if (x > -60 && x < vw + 60) {
        ctx.fillStyle = '#151013'; ctx.fillRect(x - 28, 84, 56, 52);
        ctx.fillStyle = '#000'; ctx.fillRect(x - 24, 88, 48, 38);
        const look = Math.max(-3, Math.min(3, (W.px - 3560) / 40));
        ctx.fillStyle = '#ff0040'; ctx.fillRect(x - 15, 100, 10, 10); ctx.fillRect(x + 5, 100, 10, 10);
        ctx.fillStyle = '#000'; ctx.fillRect(x - 11 + look, 103, 3, 5); ctx.fillRect(x + 9 + look, 103, 3, 5);
        if (hash(Math.floor(W.t * 3)) > 0.9) { ctx.fillStyle = '#000'; ctx.fillRect(x - 24, 98, 48, 14); }
        ctx.fillStyle = '#40101a'; ctx.fillRect(x - 12, 118, 24, 2);
      }
    }

    // ceiling lights (flicker more with dread)
    for (let lx = 100; lx < WORLD_W; lx += 300) {
      const x = lx - cam; if (x < -60 || x > vw + 60) continue;
      const bad = hash(Math.floor(W.t * (4 + d * 14)) + lx) < d * 0.5;
      const on = !bad && W.lightsOut <= 0;
      ctx.fillStyle = on ? '#e8d8c8' : '#2a2222'; ctx.fillRect(x - 14, 22, 28, 3);
      if (on) {
        const g = ctx.createRadialGradient(x, 25, 2, x, 90, 110);
        g.addColorStop(0, circus ? 'rgba(255,120,200,0.20)' : 'rgba(255,40,70,' + (0.16 + d * 0.1) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 130, 25, 260, 130);
      }
    }

    // stalker
    if (W.stalkerOn) {
      const x = W.stalkerX - cam;
      if (x > -30 && x < vw + 30 && W.stalkerFlicker <= 0) {
        ctx.fillStyle = '#000'; ctx.fillRect(x - 6, 100, 12, 50); ctx.fillRect(x - 5, 92, 10, 10);
        ctx.fillRect(x - 12, 108, 4, 30); ctx.fillRect(x + 8, 108, 4, 30);
        ctx.fillStyle = '#ff0030'; ctx.fillRect(x - 3, 95, 2, 2); ctx.fillRect(x + 1, 95, 2, 2);
      }
    }

    // player: dark coat, red scarf, katana on back
    {
      const x = W.px - cam, y = 150, f = W.face, bob = Math.abs(Math.sin(W.walk * 8)) * (keys.left || keys.right ? 1.5 : 0);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x - 4, y - 34 - bob, 8, 20);              // coat
      ctx.fillRect(x - 3, y - 15 - bob, 3, 15); ctx.fillRect(x + 1, y - 15 - bob * 0.2, 3, 15); // legs
      ctx.fillStyle = '#c9a98c'; ctx.fillRect(x - 3, y - 43 - bob, 6, 8);                // head
      ctx.fillStyle = '#1a0a0a'; ctx.fillRect(x - 3, y - 44 - bob, 6, 3);                // hair
      ctx.fillStyle = '#ff0040'; ctx.fillRect(x - 4, y - 35 - bob, 8, 2);               // scarf
      ctx.fillRect(x - f * 6, y - 35 - bob, 3, 2 + Math.sin(W.t * 6) * 1.5);
      ctx.fillStyle = '#777'; ctx.fillRect(x - f * 6, y - 40 - bob, 1, 24);            // blade
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x - 6, y - 1, 12, 2);
    }

    // darkness / flashlight vignette
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const px = (W.px - cam) * s, py = oy + 115 * s, r = Math.max(canvas.width, canvas.height) * (0.62 - d * 0.28);
    const g2 = ctx.createRadialGradient(px, py, 20, px, py, r);
    g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,' + (0.82 + d * 0.15) + ')');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (W.lightsOut > 0) { ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (circus) { ctx.fillStyle = 'rgba(255,80,200,0.07)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  }

  function loop(now) {
    if (!W) return;
    const dt = Math.min(0.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    if (!W.entering) {
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) { W.px = Math.max(40, Math.min(WORLD_W - 60, W.px + dir * SPEED * dt)); W.face = dir; W.walk += dt; }
    }
    const vw = canvas.width / scaleOf();
    W.cam = Math.max(0, Math.min(WORLD_W - vw, W.px - vw / 2));
    // stalker: creeps closer, disappears when lights flicker
    const d = Horror.dread(W.st);
    if (W.stalkerOn) {
      const gap = W.px - W.stalkerX;
      const pace = 8 + d * 26;
      if (Math.abs(gap) > 150 - d * 70) W.stalkerX += Math.sign(gap) * pace * dt;
      if (Math.abs(gap) < 120 - d * 60 && W.lightsOut <= 0) { W.lightsOut = 0.35; W.stalkerX = W.px + (Math.random() < 0.5 ? -1 : 1) * (420 + Math.random() * 300); Horror.hook.glitch && Horror.hook.glitch(); }
    }
    if (W.lightsOut > 0) W.lightsOut -= dt;
    if (W.stalkerFlicker > 0) W.stalkerFlicker -= dt; else if (Math.random() < 0.01) W.stalkerFlicker = 0.1;
    if (d > 0.2 && Math.random() < dt * d * 0.15) { W.lightsOut = 0.25; }
    // hint
    const n = nearest();
    let hint = '';
    if (n) {
      if (n.kind === 'door') hint = n.i === W.target ? '[E / ACT] ENTER SESSION ' + String(n.i).padStart(2, '0') : '[E / ACT] DOOR ' + String(n.i).padStart(2, '0');
      else if (n.kind === 'terminal') hint = '[E / ACT] READ FILE';
      else if (n.kind === 'monitor') hint = '[E / ACT] LOOK AT THE SCREEN';
      else hint = '[E / ACT] PICK UP FRAGMENT';
    } else if (W.t < 8) hint = 'ARROWS / A-D: WALK';
    hintEl.textContent = hint;
    draw();
    W.raf = requestAnimationFrame(loop);
  }

  window.World = { enter, get active() { return !!W; } };
})();
