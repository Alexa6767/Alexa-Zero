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
  function applyMusic() {
    setMusicBtn();
    if (musicWanted) music.play().catch(() => {}); else music.pause();
  }
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    musicWanted = !musicWanted;
    try { localStorage.setItem(MUSIC_KEY, musicWanted ? 'on' : 'off'); } catch (err) {}
    applyMusic();
  });

  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.armed === '1') {
      wipeSave();
      location.reload();
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
    const startedAt = Date.now();
    let lastTick = -1;
    timerBar.style.display = 'block';
    timerFill.style.width = '100%';
    timerFill.classList.remove('urgent');
    timerInterval = setInterval(() => {
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
    btn.textContent = choice.text.toUpperCase();
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
    endTitle.textContent = isFinal ? 'TREATMENT COMPLETE' : 'SESSION COMPLETE';
    endNotes.innerHTML = `
      <div class="end-session-main" data-text="">${isFinal ? 'THE ROOM IS QUIET.' : 'A WEEK LATER'}</div>
      <div class="end-session-sub">${isFinal
        ? 'Process terminated by patient. Thank you for staying until the end.'
        : 'The room is quiet again. The silence has shifted. You are ready for the next conversation.'}</div>
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
          renderRoom(state.room);
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
  async function renderRoom(room) {
    const node = Engine.getNode(room);
    if (!node) { // corrupt save safety net — never strand the player
      state = Engine.freshState();
      persist();
      return renderRoom('S1_START');
    }
    state.room = room;
    persist();

    const message = Engine.interpolate(node.message, state);
    state.currentMood = node.mood || 'calm';
    applyEffects(node);

    textEl.className = 'therapist-text';
    const stage = Engine.characterStage(state);
    if (stage === 'unstable') textEl.classList.add('unstable-text');
    if (stage === 'climax') textEl.classList.add('climax-text');

    clearChoices();
    nameInput.style.display = 'none';
    stopTimer();

    const isShout = ['angry', 'intense', 'challenging', 'unstable', 'climax'].includes(node.mood);

    // Interrupts are live while Alexa is still speaking.
    if (node.interrupts && node.interrupts.length) {
      node.interrupts.forEach(ic => {
        addChoiceButton(ic, {
          interrupt: true,
          onPick: (c) => {
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

    await typeText(message.toUpperCase(), { isShout });

    if ((node.effects || []).includes('single_word_glitch')) glitchOneWord();

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

    clearChoices();
    (node.choices || []).forEach(c => addChoiceButton(c, { onPick: onChoice }));
    setChoicesEnabled(true);

    if (node.choices && node.choices.length) {
      const duration = Math.max(20, Math.min(40, message.length / 15)) * TIMER_SCALE;
      startTimer(duration, () => onTimeout(room));
    }
  }

  async function onChoice(choice) {
    stopTimer();
    setChoicesEnabled(false);
    Audio2.choice(categorize(choice.text));
    textEl.textContent = ''; // no stuck PROCESSING label: clear, then type
    clearChoices();
    const r = Engine.applyChoice(state, choice);
    persist();
    if (r.broken) { Audio2.error(); }
    if (r.endSession) { showEndScreen(); return; }
    if (r.final) { showEndScreen(); return; }
    await renderRoom(r.room);
  }

  async function onTimeout(room) {
    setChoicesEnabled(false);
    Audio2.beep();
    const challenge = TIMEOUT_CHALLENGE;
    await typeText(challenge.message.toUpperCase(), { isShout: true });
    clearChoices();
    challenge.choices.forEach(c => addChoiceButton(c, {
      onPick: (cc) => {
        clearChoices();
        Engine.trackChoice(state, cc); // rude resumes raise hostility
        persist();
        renderRoom(room); // pick up exactly where the silence happened
      }
    }));
    setChoicesEnabled(true);
  }

  /* ---------------- boot ---------------- */
  setMusicBtn();
  document.getElementById('start-screen').addEventListener('click', function () {
    this.style.display = 'none';
    Audio2.getCtx();
    applyMusic();
    if (state.name && !state.finished) {
      // Returning patient: greet, then resume exactly where they left off.
      const resumed = state.room;
      textEl.className = 'therapist-text';
      typeText(`WELCOME BACK, ${String(state.name).toUpperCase()}.`, { speed: 24 })
        .then(() => new Promise(r => setTimeout(r, 900)))
        .then(() => renderRoom(resumed));
    } else if (state.finished) {
      showEndScreen();
    } else {
      renderRoom('S1_START');
    }
  });
})();
