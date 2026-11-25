/* Pause screen: VHS-tape freeze, glitch title, slash menu. Esc / P or the button. */
(function () {
  const btn = document.createElement('button');
  btn.id = 'pause-btn'; btn.innerHTML = '&#10074;&#10074; PAUSE'; btn.style.display = 'none';
  document.body.appendChild(btn);
  const ov = document.createElement('div');
  ov.id = 'pause';
  ov.innerHTML =
    '<div class="pz-noise"></div><div class="pz-track"></div><div class="pz-slash"></div><div class="pz-scan"></div>' +
    '<div class="pz-wrap">' +
      '<div class="pz-rec"><span class="pz-dot"></span>PAUSE <span id="pz-time">00:00:00</span></div>' +
      '<div class="pz-title" data-t="PAUSED">PAUSED</div>' +
      '<div class="pz-sub">THE TAPE IS HELD. THE ROOM WAITS.</div>' +
      '<div class="pz-menu" id="pz-menu"></div>' +
      '<div class="pz-panel" id="pz-panel"></div>' +
      '<div class="pz-foot">ESC / P  RESUME &nbsp; &#9650;&#9660;  SELECT &nbsp; ENTER  CONFIRM</div>' +
    '</div>';
  document.body.appendChild(ov);
  const menu = ov.querySelector('#pz-menu'), panel = ov.querySelector('#pz-panel'), timeEl = ov.querySelector('#pz-time');
  let open = false, sel = 0, items = [], t0 = 0, tick = null;
  const music = () => document.getElementById('music-btn');
  const CONTROLS =
    'MOVE  A D / ARROWS<br>RUN  SHIFT (3 STAGES)<br>JUMP  W / SPACE / UP<br>SLASH  J / Z / X / CLICK<br>' +
    'AIR SLASH  SLASH IN THE AIR<br>STAB  K<br>BACK KICK  L<br>SLIDE  S / DOWN / C (IN AIR: DASH)<br>ACT  E / ENTER<br>PAUSE  ESC / P';
  function build() {
    items = [
      { t: 'RESUME', fn: () => toggle(false) },
      { t: 'CONTROLS', fn: () => { panel.classList.toggle('on'); panel.innerHTML = CONTROLS; } },
      { t: () => (music() ? music().textContent.replace('MUSIC: ', 'MUSIC ') : 'MUSIC'), fn: () => { if (music()) music().click(); } }
    ];
    if (window.World && World.canRestart && World.canRestart()) items.push({ t: 'RESTART SCENE', fn: () => { toggle(false); World.restartScene(); } });
    items.push({ t: 'SAVE & EXIT', fn: () => { location.reload(); } });
    render();
  }
  function render() {
    menu.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.className = 'pz-item' + (i === sel ? ' sel' : '');
      b.innerHTML = '<span class="pz-arrow">&#9654;</span><span class="pz-lbl">' + (typeof it.t === 'function' ? it.t() : it.t) + '</span>';
      b.addEventListener('pointerenter', () => { sel = i; render(); });
      b.addEventListener('click', (e) => { e.stopPropagation(); it.fn(); if (open) render(); });
      menu.appendChild(b);
    });
  }
  function fmt(s) { s = Math.floor(s); const p = (n) => String(n).padStart(2, '0'); return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60); }
  function toggle(v) {
    if (v === undefined) v = !open;
    if (v === open) return;
    open = v; window.GAME_PAUSED = v;
    if (window.World && World.setPaused) World.setPaused(v);
    ov.classList.toggle('open', v);
    document.body.classList.toggle('is-paused', v);
    if (v) {
      sel = 0; panel.classList.remove('on'); build(); t0 = performance.now();
      const base = (window.World && World._debug && World._debug()) ? World._debug().t : 0;
      clearInterval(tick); tick = setInterval(() => { timeEl.textContent = fmt(base + (performance.now() - t0) / 1000); }, 250);
      ov.classList.remove('flash'); void ov.offsetWidth; ov.classList.add('flash');
    } else clearInterval(tick);
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); btn.blur(); toggle(true); });
  btn.addEventListener('pointerdown', (e) => e.stopPropagation());
  window.addEventListener('keydown', (e) => {
    if (document.getElementById('char-select')) return;
    const typing = e.target && e.target.tagName === 'INPUT';
    if (e.code === 'Escape' || (e.code === 'KeyP' && !typing)) {
      if (btn.style.display === 'none') return;
      e.preventDefault(); e.stopPropagation(); toggle(); return;
    }
    if (!open) return;
    e.preventDefault(); e.stopPropagation();
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { sel = (sel + 1) % items.length; render(); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') { sel = (sel + items.length - 1) % items.length; render(); }
    else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') { items[sel].fn(); if (open) render(); }
  }, true);
  window.addEventListener('blur', () => { if (btn.style.display !== 'none' && !open && window.World && World.active) toggle(true); });
  window.Pause = { show() { btn.style.display = 'block'; }, hide() { btn.style.display = 'none'; }, toggle };
  // button appears once the title screen is dismissed
  const ss = document.getElementById('start-screen');
  if (ss) { if (ss.style.display === 'none') window.Pause.show(); else ss.addEventListener('click', () => setTimeout(() => window.Pause.show(), 50)); }
})();
