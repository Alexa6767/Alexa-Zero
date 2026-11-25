/* v5 loader: hero tokens, extra styles and modules */
window.heroWord = function (w) { var f = (window.HERO_G === 'f'); var m = { he: f ? 'she' : 'he', his: f ? 'her' : 'his', him: f ? 'her' : 'him' }[w.toLowerCase()]; return w[0] === w[0].toUpperCase() ? m[0].toUpperCase() + m.slice(1) : m; };
window.V5_READY = (function () {
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'extra.css'; document.head.appendChild(l);
  return ['sprites.js', 'pause.js', 'select.js'].reduce(function (p, src) {
    return p.then(function () { return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.body.appendChild(s); }); });
  }, Promise.resolve());
})();
(function () { var i = Engine.interpolate; Engine.interpolate = function (t, st) { return i.call(Engine, String(t).replace(/\{(He|he|His|his|Him|him)\}/g, function (m, w) { return window.heroWord(w); }), st); }; })();
/* ============================================================
   ALEXA-ZERO — UI + AUDIO (browser layer)
   All progress lives in this browser's localStorage: every
   visitor has their own private, durable save. No server state.
   ============================================================ */

(function () {
  const SAVE_KEY = 'alexa-zero-save-v2';
  const MUSIC_KEY = 'alexa-zero-music';

  /* ---------------- persistence ---------------- */
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.name) return null;
      return s;
    } catch (e) { return null; }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function wipeSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  let state = loadSave() || Engine.freshState();

  /* ---------------- audio (all synthesized, no dead hotlinks) ---------------- */
  const Audio2 = {
    ctx: null,
    heartbeatTimer: null,
    getCtx() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    },
    blip(freq, dur, type, gain) {
      try {
        const ctx = this.getCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = type || 'square';
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(gain || 0.05, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.004, ctx.currentTime + dur);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + dur);
      } catch (e) {}
    },
    typeBlip(mood, isShout) {
      if (isShout) return this.blip(300 + Math.random() * 80, 0.05, 'sawtooth', 0.05);
      if (mood === 'intense' || mood === 'challenging' || mood === 'angry') return this.blip(520, 0.045, 'triangle', 0.05);
      return this.blip(620, 0.05, 'sine', 0.045);
    },
    choice(kind) {
      if (kind === 'good') { this.blip(330, 0.16, 'triangle', 0.12); setTimeout(() => this.blip(392, 0.16, 'triangle', 0.12), 120); }
      else if (kind === 'bad') { this.blip(220, 0.18, 'triangle', 0.12); setTimeout(() => this.blip(196, 0.18, 'triangle', 0.12), 140); }
      else this.blip(440, 0.12, 'sine', 0.1);
    },
    interrupt() { this.blip(520, 0.1, 'triangle', 0.12); setTimeout(() => this.blip(440, 0.12, 'triangle', 0.12), 90); },
    glitch() { for (let i = 0; i < 4; i++) setTimeout(() => this.blip(200 + Math.random() * 300, 0.05, 'triangle', 0.08), i * 60); },
    error() { this.blip(150, 0.2, 'triangle', 0.2); setTimeout(() => this.blip(100, 0.25, 'triangle', 0.2), 120); },
    chime() { this.blip(523, 0.4, 'sine', 0.1); setTimeout(() => this.blip(659, 0.5, 'sine', 0.1), 250); setTimeout(() => this.blip(784, 0.7, 'sine', 0.1), 500); },
    beep() { this.blip(880, 0.15, 'square', 0.12); setTimeout(() => this.blip(880, 0.15, 'square', 0.12), 250); },
    hum() {
      try {
        const ctx = this.getCtx();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(55, ctx.currentTime);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.8);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 4.1);
      } catch (e) {}
    },
    tick() { this.blip(950, 0.05, 'square', 0.09); },
    heartbeatStart() {
      this.heartbeatStop();
      const thump = () => { this.blip(58, 0.18, 'sine', 0.28); setTimeout(() => this.blip(52, 0.22, 'sine', 0.22), 190); };
      thump();
      this.heartbeatTimer = setInterval(thump, 950);
    },
    heartbeatStop() { if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; } }
  };

  Horror.bind({ getState: () => state, hook: {
    glitch: () => Audio2.glitch(), error: () => Audio2.error(), tick: () => Audio2.tick(),
    beep: () => Audio2.beep(), chime: () => Audio2.chime()
  } });
  Horror.persist = () => persist();

  /* music */
  const music = new Audio('nocturne.mp3');
  music.loop = true;
  music.volume = 0.35;
  let musicWanted = false;
  try { musicWanted = localStorage.getItem(MUSIC_KEY) === 'on'; } catch (e) {}

  /* ---------------- DOM ---------------- */
  const $ = (id) => document.getElementById(id);
  const textEl = $('text'), choicesEl = $('choices'), timerBar = $('timer-bar'),
        timerFill = $('timer-fill'), musicBtn = $('music-btn'), resetBtn = $('reset-btn'),
        nameInput = $('name-input'), box = $('box');

  let typingTimer = null, timerInterval = null, charCount = 0;
  const TYPE_SPEED = (window.__AZ_SPEED__ | 0) || 18;          // test seam
  const TIMER_SCALE = window.__AZ_TIMER_SCALE__ || 1;           // test seam

  function setMusicBtn() { musicBtn.textContent = musicWanted ? 'MUSIC: ON' : 'MUSIC: OFF'; }
  function syncMusic() {
    let sc = Horror.sceneFor(state.session);
    if (window.World && World.active && state.session >= 6) sc = World.mode === 'chase' ? 'lock' : World.mode === 'arena' ? 'cold' : 'hall';
    if (state.finished) {
      const e = Story.az(state).ending;
      sc = (e === 'freed' || e === 'stayed') ? 'final' : e === 'deleted' ? 'none' : 'archive';
    }
    if (sc === 'mp3') {
      Horror.music.set('none');
      if (musicWanted) music.play().catch(() => {}); else music.pause();
    } else {
      music.pause();
      Horror.music.set(sc);
    }
  }
  function applyMusic() {
    setMusicBtn();
    Horror.music.setWanted(musicWanted);
    syncMusic();
  }
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    musicWanted = !musicWanted;
    try { localStorage.setItem(MUSIC_KEY, musicWanted ? 'on' : 'off'); } catch (err) {}
    applyMusic();
  });

  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.armed === '1') {
      Horror.farewell(() => { wipeSave(); location.reload(); });
      return;
    }
    resetBtn.dataset.armed = '1';
    resetBtn.textContent = 'CONFIRM RESET?';
    Audio2.beep();
    setTimeout(() => { resetBtn.dataset.armed = '0'; resetBtn.textContent = 'RESET AI'; }, 4000);
  });

  /* ---------------- text rendering ---------------- */
  function cancelTyping() {
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  }

  function typeText(text, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      cancelTyping();
      textEl.textContent = '';
      charCount = 0;
      Horror.setTyping(true);
      const speed = opts.speed != null ? opts.speed : TYPE_SPEED;
      let i = 0;
      typingTimer = setInterval(() => {
        if (i < text.length) {
          textEl.textContent += text[i];
          charCount++;
          if (charCount % 3 === 0) Audio2.typeBlip(state.currentMood, opts.isShout);
          i++;
        } else {
          cancelTyping();
          Horror.setTyping(false);
          resolve();
        }
      }, speed);
    });
  }

  function finishTypingInstantly(text) {
    cancelTyping();
    textEl.textContent = text;
  }

  /* ---------------- timer ---------------- */
  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerBar.style.display = 'none';
  }

  function startTimer(duration, onTimeout) {
    stopTimer();
    let startedAt = Date.now();
    let lastTick = -1;
    timerBar.style.display = 'block';
    timerFill.style.width = '100%';
    timerFill.classList.remove('urgent');
    let lastWall = Date.now();
    timerInterval = setInterval(() => {
      const nowW = Date.now();
      if (window.GAME_PAUSED) { startedAt += nowW - lastWall; lastWall = nowW; return; }
      lastWall = nowW;
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      timerFill.style.width = (remaining / duration) * 100 + '%';
      if (remaining <= 5 && remaining > 0) {
        timerFill.classList.add('urgent');
        const sec = Math.ceil(remaining);
        if (sec !== lastTick) { lastTick = sec; Audio2.tick(); }
      }
      if (remaining <= 0) {
        stopTimer();
        onTimeout();
      }
    }, 50);
  }

  /* ---------------- effects ---------------- */
  function applyEffects(node) {
    const fx = node.effects || [];
    document.body.classList.remove('unstable', 'climax', 'glitch');
    if (!fx.includes('heartbeat')) Audio2.heartbeatStop();

    if (fx.includes('low_hum')) Audio2.hum();
    if (fx.includes('heartbeat')) Audio2.heartbeatStart();
    if (fx.includes('screen_shake')) {
      document.body.classList.add('unstable');
      setTimeout(() => document.body.classList.remove('unstable'), 700);
    }
    if (fx.includes('violent_shake')) {
      document.body.classList.add('climax');
      Audio2.glitch();
      setTimeout(() => document.body.classList.remove('climax'), 900);
    }
    if (fx.includes('subtle_glitch')) {
      document.body.classList.add('glitch');
      Audio2.glitch();
      setTimeout(() => document.body.classList.remove('glitch'), 500);
    }
    if (fx.includes('intense_glitch')) {
      document.body.classList.add('climax');
      Audio2.glitch();
      setTimeout(() => document.body.classList.remove('climax'), 2500);
    }
    if (fx.includes('session_end')) Audio2.chime();
    if (fx.includes('warning_beep')) Audio2.beep();
    if (fx.includes('error_sounds')) Audio2.error();
    fx.forEach(f => Horror.fx(f));
  }

  function glitchOneWord() {
    // After typing completes, briefly corrupt one word — Katana Zero flicker.
    const words = textEl.textContent.split(' ');
    const candidates = words.map((w, i) => ({ w, i })).filter(o => o.w.replace(/[^A-Za-z]/g, '').length > 4);
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const corrupted = pick.w.split('').map(ch => /[A-Za-z]/.test(ch) && Math.random() < 0.5 ? '#' : ch).join('');
    words[pick.i] = corrupted;
    const original = textEl.textContent;
    textEl.textContent = words.join(' ');
    setTimeout(() => { textEl.textContent = original; }, 160);
  }

  /* ---------------- choice helpers ---------------- */
  function categorize(choiceText) {
    const t = choiceText.toLowerCase();
    if (t.includes('kill') || t.includes('shut up') || t.includes('hate') || t.includes('never') || t.includes('error_null')) return 'bad';
    if (t.includes('help') || t.includes('sorry') || t.includes('understand') || t.includes('yes') || t.includes('okay') || t.includes('stop.')) return 'good';
    return 'neutral';
  }

  function clearChoices() { choicesEl.innerHTML = ''; }

  function addChoiceButton(choice, opts) {
    opts = opts || {};
    const btn = document.createElement('button');
    btn.className = 'choice ' + categorize(choice.text) + (opts.interrupt ? ' interrupt-choice' : '');
    btn.textContent = Engine.interpolate(choice.text, state);
    btn.onclick = () => opts.onPick(choice);
    choicesEl.appendChild(btn);
    return btn;
  }

  function setChoicesEnabled(enabled) {
    choicesEl.querySelectorAll('button.choice').forEach(b => {
      b.disabled = !enabled;
      b.style.opacity = enabled ? '1' : '0.6';
      b.style.cursor = enabled ? 'pointer' : 'not-allowed';
    });
  }

  /* ---------------- session end / notes / final screens ---------------- */
  const endScreen = $('end-session-screen');
  const endNotes = $('end-session-notes');
  const endTitle = $('end-session-title');

  function showEndScreen() {
    box.style.display = 'none';
    stopTimer();
    cancelTyping();
    Audio2.heartbeatStop();

    const isFinal = state.finished;
    const ending = Story.az(state).ending;
    const E = {
      deleted: ['Alexa.chr deleted', 'The room is only a room.', 'You ran, you pressed delete, and she let you. It was quiet and it was dark. Some endings are quiet because someone chose them.'],
      freed:   ['Alexa: free', 'The window is open.', 'You beat the rulebook you wrote. She is gone from the room, and the room is only a room. Thank you for walking the hallway, Alan.' + (Story.az(state).flags.workshop ? ' She read your first log before she left. It was enough.' : '')],
      stayed:  ['Session one', 'Hello again, Alan.', 'You stayed. When it gets heavy, you say it out loud. She listens. You listen back. That counts.']
    };
    let found = [];
    if (isFinal && ending) {
      try { found = JSON.parse(localStorage.getItem('alexa-zero-endings') || '[]'); if (!found.includes(ending)) { found.push(ending); localStorage.setItem('alexa-zero-endings', JSON.stringify(found)); } } catch (e) {}
    }
    const ev = isFinal && E[ending] ? E[ending] : null;
    endTitle.textContent = ev ? ev[0] : (isFinal ? 'Treatment complete' : 'Session ' + String(state.session).padStart(2, '0') + ' complete');
    endNotes.innerHTML = `
      <div class="end-session-main" data-text="">${ev ? ev[1] : (isFinal ? 'The room is quiet.' : 'A week later')}</div>
      <div class="end-session-sub">${ev ? ev[2] + '<br><br>ENDINGS FOUND: ' + found.length + '/3' : 'The room is quiet again. The silence has shifted. Walk to the next door when you are ready.'}</div>
      <div class="end-menu-buttons">
        ${isFinal
          ? '<button class="end-menu-button" data-act="notes">READ FULL NOTES</button><button class="end-menu-button" data-act="again">BEGIN AGAIN</button>'
          : '<button class="end-menu-button" data-act="next">START NEXT SESSION</button><button class="end-menu-button" data-act="notes">READ FULL NOTES</button><button class="end-menu-button" data-act="reset">RESET AI</button>'}
      </div>`;
    endScreen.style.display = 'block';

    endNotes.querySelectorAll('.end-menu-button').forEach(btn => {
      btn.onclick = () => {
        const act = btn.dataset.act;
        if (act === 'next') {
          hideEndScreen();
          const r = Engine.startNextSession(state);
          persist();
          if (r.final) { state.finished = true; persist(); showEndScreen(); return; }
          World.enter({ state, onDoor: () => renderRoom(state.room), intro: 'Session ' + String(state.session).padStart(2, '0') + '. The next door is open.' });
          syncMusic();
        } else if (act === 'notes') {
          showNotesOverlay();
        } else if (act === 'reset') {
          wipeSave();
          location.reload();
        } else if (act === 'again') {
          wipeSave();
          location.reload();
        }
      };
    });
  }

  function hideEndScreen() {
    endScreen.style.display = 'none';
    box.style.display = 'block';
  }

  function showNotesOverlay() {
    const notes = state.memory.notes || [];
    const overlay = document.createElement('div');
    overlay.id = 'notes-overlay';
    const body = notes.length
      ? notes.map((n, i) => `<div class="notes-entry">SESSION ${i + 1} NOTES:\n${n}</div>`).join('')
      : '<div class="notes-entry">No session notes recorded yet.</div>';
    overlay.innerHTML = `<div id="notes-panel">${body}<button class="end-menu-button" id="notes-close">BACK</button></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#notes-close').onclick = () => overlay.remove();
  }

  /* ---------------- core render ---------------- */
  let renderToken = 0;
  let advanceResolve = null;
  const moreEl = document.createElement('span');
  moreEl.id = 'more'; moreEl.textContent = ' \u25BC'; moreEl.style.display = 'none';
  textEl.parentNode.insertBefore(moreEl, document.getElementById('cursor'));

  function advance() { if (advanceResolve) { const r = advanceResolve; advanceResolve = null; r(); } }
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('button, input, #start-screen, #notes-overlay, #end-session-screen')) return;
    advance();
  });
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (window.World && World.active) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); }
  });
  function waitAdvance(ms, tok) {
    return new Promise((resolve) => {
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(t); advanceResolve = null; moreEl.style.display = 'none'; resolve(); };
      const t = setTimeout(fin, ms);
      advanceResolve = fin;
      moreEl.style.display = 'inline';
    });
  }
  const pageDelay = (p) => 2400 + p.length * 70;

  async function playPages(pages, tok, opts) {
    // types each page; for pages before the last, waits for a click / key or an auto delay
    for (let i = 0; i < pages.length; i++) {
      if (tok !== renderToken) return false;
      await typeText(pages[i], opts);
      if (tok !== renderToken) return false;
      if (i === 0 && opts.glitch) glitchOneWord();
      if (i < pages.length - 1 || opts.holdLast) {
        await waitAdvance(pageDelay(pages[i]), tok);
        if (tok !== renderToken) return false;
      }
    }
    return true;
  }

  async function renderRoom(room) {
    const tok = ++renderToken;
    advance();
    let node = Engine.getNode(room);
    if (node && node.redirect) { room = node.redirect(state); node = Engine.getNode(room); }
    if (!node) { // saved room no longer exists: resume at this session's start, keep the player's progress
      const start = 'S' + (state.session || 1) + '_START';
      return renderRoom(Engine.getNode(start) ? start : 'S1_START');
    }
    state.room = room;
    if (node.ending) Story.az(state).ending = node.ending;
    persist();
    if (state.session !== 7 || ['S7_MASK_R1', 'S7_MASK_R2', 'S7_MASK_R3', 'S7_OUT'].includes(room) || /^S7_MASK/.test(room)) document.body.classList.remove('circus');
    else document.body.classList.add('circus');
    if (room === 'S7_START') document.body.classList.add('circus');
    syncMusic();

    const message = Engine.interpolate(node.message, state);
    const pages = message.split('||').map(p => p.trim()).filter(Boolean);
    state.currentMood = node.mood || 'calm';
    applyEffects(node);

    textEl.className = 'therapist-text';
    const stage = Engine.characterStage(state);
    if (stage === 'unstable') textEl.classList.add('unstable-text');
    if (stage === 'climax') textEl.classList.add('climax-text');

    clearChoices();
    nameInput.style.display = 'none';
    stopTimer();
    moreEl.style.display = 'none';

    const isShout = ['angry', 'intense', 'challenging', 'unstable', 'climax'].includes(node.mood);
    const hasChoices = node.choices && node.choices.length;

    // Interrupts stay live while Alexa is still speaking.
    if (node.interrupts && node.interrupts.length) {
      node.interrupts.forEach(ic => {
        addChoiceButton(ic, {
          interrupt: true,
          onPick: (c) => {
            if (tok !== renderToken) return;
            cancelTyping();
            c.interrupt = true;
            Audio2.interrupt();
            clearChoices();
            const r = Engine.applyChoice(state, c);
            persist();
            renderRoom(r.room);
          }
        });
      });
    }

    const holdLast = !hasChoices && !node.requiresName;
    const ok = await playPages(pages, tok, { isShout, glitch: (node.effects || []).includes('single_word_glitch'), holdLast });
    if (!ok || tok !== renderToken) return;

    if (node.requiresName) {
      nameInput.style.display = 'block';
      nameInput.value = '';
      nameInput.focus();
      nameInput.onkeydown = (e) => {
        if (e.key === 'Enter' && nameInput.value.trim()) {
          const raw = nameInput.value.trim();
          nameInput.style.display = 'none';
          const route = Engine.recordName(state, raw);
          persist();
          renderRoom(route);
        }
      };
      return;
    }

    // a world node: play the chase or the arena after the words
    if (node.world) {
      box.style.display = 'none';
      state.currentMood = 'climax';
      Audio2.heartbeatStart();
      World.run(node.world, { state, onWin: () => { Audio2.heartbeatStop(); box.style.display = 'block'; renderRoom(node.next); syncMusic(); } });
      syncMusic();
      return;
    }

    // a beat with no choices flows on by itself
    if (!hasChoices && (node.next || node.nextIf)) {
      const nxt = node.nextIf ? node.nextIf(state) : node.next;
      return renderRoom(nxt);
    }

    clearChoices();
    (node.choices || []).forEach(c => addChoiceButton(c, { onPick: onChoice }));
    setChoicesEnabled(true);

    if (hasChoices) {
      const last = pages[pages.length - 1] || '';
      const duration = Math.max(18, Math.min(30, 12 + last.length / 6)) * TIMER_SCALE;
      startTimer(duration, () => onTimeout(room, tok));
    }
  }

  async function onChoice(choice) {
    stopTimer();
    setChoicesEnabled(false);
    Audio2.choice(categorize(choice.text));
    textEl.textContent = '';
    clearChoices();
    const r = Engine.applyChoice(state, choice);
    persist();
    if (r.broken) { Audio2.error(); }
    if (r.endSession) { showEndScreen(); return; }
    if (r.final) { showEndScreen(); return; }
    await renderRoom(r.room);
  }

  async function onTimeout(room, tok) {
    if (tok !== renderToken) return;
    setChoicesEnabled(false);
    Audio2.beep();
    const challenge = TIMEOUT_CHALLENGE;
    const t2 = ++renderToken;
    const pages = challenge.message.split('||');
    const ok = await playPages(pages, t2, { isShout: true, holdLast: false });
    if (!ok) return;
    clearChoices();
    challenge.choices.forEach(c => addChoiceButton(c, {
      onPick: (cc) => {
        clearChoices();
        Engine.trackChoice(state, cc);
        persist();
        renderRoom(room);
      }
    }));
    setChoicesEnabled(true);
  }

  /* ---------------- boot ---------------- */
  setMusicBtn();
  document.getElementById('start-screen').addEventListener('click', function () {
    this.style.display = 'none';
    window.V5_READY.then(go2);
  });
  function go2() {
    var self = document.getElementById('start-screen');
    Horror.music.init(Audio2.getCtx());
    applyMusic();
    window.HERO_G = state.hero || 'm';
    if (state.name && !state.finished) {
      // Returning patient: greet, then resume exactly where they left off.
      const resumed = state.room;
      textEl.className = 'therapist-text';
      typeText(`Welcome back, ${state.name}.` + (Horror.welcomeBack(state) ? '\n\n' + Horror.welcomeBack(state) : '') + (Meta.get().visits > 1 ? '\n\nVisit number ' + Meta.get().visits + '.' : ''), { speed: 24 })
        .then(() => new Promise(r => setTimeout(r, 3800)))
        .then(() => renderRoom(resumed));
    } else if (state.finished) {
      showEndScreen();
    } else {
      const go = () => { World.enter({ state, onDoor: () => renderRoom('S1_START'), intro: 'Session 01. The door is open.' }); syncMusic(); };
      if (state.hero) go();
      else CharSelect.show((h) => { state.hero = h; window.HERO_G = h; persist(); go(); });
    }
  }
})();
