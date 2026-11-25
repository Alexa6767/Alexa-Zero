/* Character select: two animated heroes on a stage. */
(function () {
  const SEQ = [
    ['idle', 1.7], ['run', 1.1], ['s1', 0.3], ['s2', 0.3], ['s3', 0.46], ['idle', 0.5], ['stab', 0.32], ['slide', 0.5], ['vic', 1.5]
  ];
  const TOTAL = SEQ.reduce((a, b) => a + b[1], 0);
  const DEFS = {
    m: { name: 'MALE', tag: 'BLUE SCARF. DARK HAIR.<br>A KATANA HE IS TIRED OF CARRYING.' },
    f: { name: 'FEMALE', tag: 'RED SCARF. DARK HAIR.<br>A KATANA SHE IS NOT TIRED OF.' }
  };
  function pstate(time, sel) {
    const p = { face: 1, ph: time * 15, vx: 0, vy: 0, ground: true, run: false, stage: 1, slash: 0, atk: null, slideT: 0, vic: false, hurt: false, inv: 0, hist: [] };
    if (!sel) return p;
    let tt = time % TOTAL, k = 'idle', u = 0, d = 1;
    for (const [n, dur] of SEQ) { if (tt < dur) { k = n; u = tt; d = dur; break; } tt -= dur; }
    if (k === 'run') { p.vx = 150; p.run = true; p.stage = u < 0.4 ? 1 : u < 0.8 ? 2 : 3; }
    else if (['s1', 's2', 's3', 'stab'].includes(k)) { p.atk = Object.assign({ type: k }, Sprites.ATK[k]); p.slash = d - u; }
    else if (k === 'slide') { p.slideT = d - u; }
    else if (k === 'vic') p.vic = true;
    return p;
  }
  function show(cb, initial) {
    let sel = initial === 'f' ? 'f' : 'm', done = false;
    const el = document.createElement('div');
    el.id = 'char-select';
    el.innerHTML = '<div class="cs-noise"></div><div class="cs-title">CHOOSE YOUR AVATAR</div>' +
      '<div class="cs-sub">WHO IS SITTING IN THE CHAIR?<br>YOU TYPE YOUR OWN NAME NEXT.</div><div class="cs-row"></div>' +
      '<button class="cs-go">CONFIRM</button><div class="cs-hint">A / D OR TAP TO CHOOSE. ENTER TO CONFIRM.</div>';
    document.body.appendChild(el);
    const row = el.querySelector('.cs-row'), cards = {}, cvs = {};
    ['m', 'f'].forEach(k => {
      const c = document.createElement('div'); c.className = 'cs-card';
      c.innerHTML = '<canvas width="132" height="104"></canvas><div class="cs-name">' + DEFS[k].name + '</div><div class="cs-tag">' + DEFS[k].tag + '</div>';
      c.addEventListener('click', (e) => { e.stopPropagation(); if (sel === k) confirm(); else { sel = k; upd(); } });
      row.appendChild(c); cards[k] = c; cvs[k] = c.querySelector('canvas').getContext('2d');
    });
    function upd() { ['m', 'f'].forEach(k => cards[k].classList.toggle('sel', k === sel)); }
    upd();
    el.querySelector('.cs-go').addEventListener('click', (e) => { e.stopPropagation(); confirm(); });
    const t0 = performance.now(); let raf = 0, tc = 0;
    function frame(now) {
      const t = (now - t0) / 1000;
      ['m', 'f'].forEach(k => {
        const x = cvs[k], on = k === sel, ttime = on ? (done ? tc : t) : t;
        x.imageSmoothingEnabled = false; x.clearRect(0, 0, 132, 104);
        const g = x.createRadialGradient(66, 80, 4, 66, 64, 70); g.addColorStop(0, on ? 'rgba(255,0,64,0.38)' : 'rgba(120,60,90,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, 132, 104);
        x.fillStyle = '#0d0810'; x.fillRect(0, 90, 132, 14); x.fillStyle = on ? '#ff0040' : '#4a2a44'; x.fillRect(0, 90, 132, 1);
        x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = -132; i < 264; i += 14) { x.fillRect(66 + (i - 66) * 1.0, 91, 1, 13); }
        const p = pstate(on ? (done ? tc : t) : t * 0.6, on);
        if (done && on) { p.vic = true; p.atk = null; p.slash = 0; }
        Sprites.draw(x, 66, 90, p, t, k, { floorY: 90 });
      });
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    function confirm() {
      if (done) return; done = true;
      el.classList.add('confirm');
      setTimeout(() => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true); el.remove(); cb(sel); }, 800);
    }
    function onKey(e) {
      if (done) return;
      if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); sel = sel === 'm' ? 'f' : 'm'; upd(); }
      else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') { e.preventDefault(); confirm(); }
    }
    window.addEventListener('keydown', onKey, true);
  }
  window.CharSelect = { show };
})();
