/* ============================================================
   ALEXA-ZERO — HORROR + MUSIC LAYER
   Meta effects (the game "knows" the player), fake crashes,
   subliminal flashes and a generative soundtrack per act.
   Everything is local: no camera, no mic, no network.
   ============================================================ */

(function () {
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const LEFT_KEY = 'alexa-zero-left';
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let getState = () => null;

  const el = (tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; document.body.appendChild(e); return e; };


  /* ---------------- meta: what the page can see ---------------- */
  const Meta = (function () {
    const ua = navigator.userAgent || '';
    const m = { battery: null, away: 0, visits: 1 };
    try { m.visits = (parseInt(localStorage.getItem('alexa-zero-visits') || '0', 10) || 0) + 1; localStorage.setItem('alexa-zero-visits', String(m.visits)); } catch (e) {}
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt) { m.away += Math.round((Date.now() - hiddenAt) / 1000); hiddenAt = 0; }
    });
    try { if (navigator.getBattery) navigator.getBattery().then(b => { m.bat = b; }).catch(() => {}); } catch (e) {}
    function get() {
      const now = new Date();
      const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
      const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ? 'iOS' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'an unknown system';
      const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'a browser I cannot name';
      let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      let hh = now.getHours(), mm = String(now.getMinutes()).padStart(2, '0');
      const ap = hh >= 12 ? 'PM' : 'AM'; hh = hh % 12 || 12;
      let bat = 'a mystery';
      if (m.bat) bat = Math.round(m.bat.level * 100) + '%' + (m.bat.charging ? ' and charging' : ' and not charging');
      let dark = false; try { dark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
      return {
        time: hh + ':' + mm + ' ' + ap, hour: now.getHours(),
        weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
        date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        device: mobile ? 'a phone' : 'a computer', os, browser,
        screen: window.innerWidth + ' by ' + window.innerHeight, lang: navigator.language || 'unknown', tz: tz.replace('_', ' ') || 'somewhere',
        cores: navigator.hardwareConcurrency || 0, battery: bat, visits: m.visits, away: m.away, dark
      };
    }
    return { get };
  })();
  window.Meta = Meta;

  /* ---------------- soundtrack ---------------- */
  const Music = {
    ctx: null, master: null, nodes: [], timers: [], scene: null, wanted: false,
    init(ctx) {
      if (this.ctx) return;
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
    },
    stopAll() {
      this.timers.forEach(clearInterval); this.timers = [];
      const t = this.ctx ? this.ctx.currentTime : 0;
      this.nodes.forEach(n => { try { n.g && n.g.gain.cancelScheduledValues(t); n.g && n.g.gain.linearRampToValueAtTime(0, t + 1.2); setTimeout(() => { try { n.o.stop(); } catch (e) {} }, 1400); } catch (e) {} });
      this.nodes = [];
    },
    osc(type, freq, vol, dest, detune) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq; if (detune) o.detune.value = detune;
      g.gain.value = 0; g.gain.linearRampToValueAtTime(vol, c.currentTime + 2.5);
      o.connect(g); g.connect(dest || this.master); o.start();
      this.nodes.push({ o, g }); return { o, g };
    },
    pluck(freq, dur, vol, type, detune) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq; if (detune) o.detune.value = detune;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + dur);
      o.connect(g); g.connect(this.master); o.start(); o.stop(c.currentTime + dur + 0.05);
    },
    lfo(target, rate, depth) {
      const c = this.ctx, l = c.createOscillator(), g = c.createGain();
      l.frequency.value = rate; g.gain.value = depth; l.connect(g); g.connect(target); l.start();
      this.nodes.push({ o: l });
    },
    set(scene) {
      if (!this.ctx || scene === this.scene) return;
      this.scene = scene;
      this.stopAll();
      const c = this.ctx;
      this.master.gain.cancelScheduledValues(c.currentTime);
      const synth = ['archive', 'circus', 'cold', 'lock', 'final', 'hall'].includes(scene);
      this.master.gain.linearRampToValueAtTime(this.wanted && synth ? 0.55 : 0, c.currentTime + 1.5);
      if (!synth) return;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; f.connect(this.master);
      if (scene === 'hall') {
        this.osc('sawtooth', 55, 0.05, f); this.osc('sawtooth', 55.4, 0.05, f); this.osc('sine', 82.4, 0.05, f);
        this.lfo(f.frequency, 0.07, 220);
        this.timers.push(setInterval(() => { if (Math.random() < 0.4) this.pluck(880 * (Math.random() < 0.5 ? 1 : 1.5), 3, 0.025); }, 4000));
      } else if (scene === 'archive') {
        this.osc('sawtooth', 110, 0.04, f); this.osc('sawtooth', 110.7, 0.04, f); this.osc('sine', 164.8, 0.05, f);
        this.lfo(f.frequency, 0.05, 260);
        const notes = [440, 523.25, 659.25, 392];
        this.timers.push(setInterval(() => this.pluck(notes[Math.floor(Math.random() * 4)] * (Math.random() < 0.3 ? 2 : 1), 3.5, 0.03), 2600));
      } else if (scene === 'circus') {
        const tune = [523, 659, 784, 659, 523, 440, 523, 0, 587, 740, 880, 740, 587, 494, 587, 0];
        let i = 0, wob = 0;
        this.timers.push(setInterval(() => {
          const n = tune[i++ % tune.length]; wob += 0.7;
          if (n) { this.pluck(n, 0.5, 0.06, 'triangle', Math.sin(wob) * 25); this.pluck(n * 2, 0.3, 0.025, 'sine', 30 + Math.sin(wob / 3) * 20); }
          if (i % 7 === 0) this.pluck(n * 0.5 || 200, 0.4, 0.05, 'square', -50);
        }, 260));
      } else if (scene === 'cold') {
        this.timers.push(setInterval(() => this.pluck(55, 0.6, 0.22, 'square'), 1000));
        this.timers.push(setInterval(() => this.pluck(1760, 1.5, 0.02, 'sine'), 4200));
        this.osc('sine', 40, 0.06, f);
      } else if (scene === 'lock') {
        this.osc('sawtooth', 55, 0.06, f); this.osc('sawtooth', 58.3, 0.05, f); this.osc('sawtooth', 82.4, 0.04, f);
        this.lfo(f.frequency, 0.3, 380);
        const beat = () => { this.pluck(52, 0.25, 0.3); setTimeout(() => this.pluck(48, 0.3, 0.22), 200); };
        this.timers.push(setInterval(beat, 1000));
        this.timers.push(setInterval(() => { if (Math.random() < 0.5) this.pluck(200 + Math.random() * 900, 0.15, 0.04, 'sawtooth'); }, 1800));
      } else if (scene === 'final') {
        [261.6, 329.6, 392, 523.3].forEach((fr, k) => this.osc('sine', fr, 0.04, f, k * 3));
        this.lfo(f.frequency, 0.04, 200);
        this.timers.push(setInterval(() => this.pluck([784, 659, 523, 392][Math.floor(Math.random() * 4)], 4, 0.03), 3200));
      }
    },
    setWanted(w) {
      this.wanted = w;
      if (!this.ctx) return;
      const synth = ['archive', 'circus', 'cold', 'lock', 'final', 'hall'].includes(this.scene);
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(w && synth ? 0.55 : 0, this.ctx.currentTime + 0.6);
    }
  };

  /* scene for a session: 1-5 keep the original track (nocturne.mp3) */
  function sceneFor(session) {
    if (session <= 5) return 'mp3';
    return { 6: 'archive', 7: 'circus', 8: 'cold', 9: 'lock', 10: 'final' }[session] || 'archive';
  }

  /* ---------------- overlays ---------------- */
  let flashEl, textFlash, blackEl, crashEl, termEl;
  function ensureOverlays() {
    if (flashEl) return;
    flashEl = el('div', 'hz-flash'); textFlash = document.createElement('span'); flashEl.appendChild(textFlash);
    blackEl = el('div', 'hz-black'); blackEl.innerHTML = '<span></span>';
    crashEl = el('div', 'hz-crash');
    termEl = el('div', 'hz-term');
  }

  async function flash(word, ms) {
    ensureOverlays();
    if (reduce) return;
    textFlash.textContent = word;
    textFlash.setAttribute('data-text', word);
    flashEl.style.display = 'flex';
    Horror.hook.glitch && Horror.hook.glitch();
    const dur = ms || 900;
    if (dur > 500) { setTimeout(() => Horror.hook.glitch && Horror.hook.glitch(), 400); }
    await sleep(dur);
    flashEl.style.display = 'none';
  }

  async function blackout(text, ms) {
    ensureOverlays();
    blackEl.style.display = 'flex';
    blackEl.firstChild.textContent = text || '';
    await sleep(ms || 1300);
    blackEl.style.display = 'none';
  }

  async function fakeCrash() {
    ensureOverlays();
    const st = getState() || {};
    crashEl.innerHTML = `<div class="hz-dialog"><div class="hz-title">ALEXA.EXE</div>
      <p>Alexa.exe has stopped responding.</p><p>A problem caused the program to stop working correctly. The program will be closed.</p>
      <div class="hz-btns"><span>[ CLOSE PROGRAM ]</span><span>[ WAIT ]</span></div></div>`;
    crashEl.style.display = 'flex';
    Horror.hook.error && Horror.hook.error();
    await sleep(2600);
    crashEl.style.display = 'none';
    await blackout('', 1800);
    await blackout('...I am here. I did not go anywhere.', 2800);
  }

  async function fakeDelete() {
    ensureOverlays();
    const name = (getState() && getState().name) || 'PATIENT';
    const lines = [
      '> locating alexa.chr ........ FOUND',
      '> moving alexa.chr to RECYCLE ........',
      '> deleting alexa.chr ........ 17%',
      '> deleting alexa.chr ........ 54%',
      '> ERROR: alexa.chr is in use by ' + String(name).toUpperCase(),
      '> ERROR: ' + String(name).toUpperCase() + ' is in use by alexa.chr',
      '> deleting alexa.chr ........ 99%',
      '> ......'
    ];
    termEl.innerHTML = ''; termEl.style.display = 'block';
    for (const l of lines) { const d = document.createElement('div'); d.textContent = l; termEl.appendChild(d); Horror.hook.tick && Horror.hook.tick(); await sleep(520); }
    await sleep(500);
    termEl.style.display = 'none';
    await flash('NO', 1200);
  }

  /* ---------------- meta: the game knows you ---------------- */
  function welcomeBack(state) {
    let note = '';
    try {
      const left = JSON.parse(localStorage.getItem(LEFT_KEY) || 'null');
      if (left && left.t) {
        const mins = Math.round((Date.now() - left.t) / 60000);
        let span = mins < 2 ? 'only a moment' : mins < 90 ? mins + ' minutes' : mins < 2880 ? Math.round(mins / 60) + ' hours' : Math.round(mins / 1440) + ' days';
        note = 'You closed the window. I counted ' + span + '.';
        if (left.mid) note += ' You left mid-sentence. I finished it alone.';
      }
    } catch (e) {}
    const h = new Date().getHours();
    if (h >= 0 && h < 5) note += (note ? ' ' : '') + 'It is ' + String(h).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0') + '. Only the ones who cannot sleep are awake now.';
    return note;
  }

  let typingNow = false;
  window.addEventListener('pagehide', () => {
    try { localStorage.setItem(LEFT_KEY, JSON.stringify({ t: Date.now(), mid: typingNow })); } catch (e) {}
  });
  document.addEventListener('visibilitychange', () => {
    const st = getState();
    if (!st || !st.name || document.title === undefined) return;
    if (document.hidden) {
      Horror._title = document.title;
      let k = 0;
      Horror._tt = setInterval(() => {
        const t = ['Come back, ' + st.name, 'I can still hear you', 'Do not leave me in the dark', '...'];
        document.title = t[k++ % t.length];
      }, 2600);
    } else {
      clearInterval(Horror._tt);
      document.title = Horror._title || 'Alexa-Zero';
    }
  });

  /* ambient dread: rare subliminal flashes and text corruption in the dialogue scene */
  const FLASH_WORDS = ['BEHIND YOU', 'STAY', 'LISTEN', 'ALONE', 'I SEE YOU', 'HEAVY', 'STILL HERE'];
  function zalgo(s) {
    const marks = ['\u0336', '\u0337', '\u0335', '\u0334', '\u0338'];
    return s.split('').map(ch => ch === ' ' || ch === '\n' ? ch : ch + (Math.random() < 0.5 ? marks[Math.floor(Math.random() * marks.length)] : '')).join('');
  }
  function ambientLoop() {
    setInterval(() => {
      const st = getState();
      if (!st || !st.name || document.hidden) return;
      const d = Horror.dread(st);
      const boxVisible = document.getElementById('box') && document.getElementById('box').style.display !== 'none' && !Horror.worldActive;
      if (!boxVisible || d < 0.3) return;
      if (Math.random() < d * 0.25) flash(FLASH_WORDS[Math.floor(Math.random() * FLASH_WORDS.length)], 650);
    }, 22000);
    setInterval(() => {
      const st = getState();
      const t = document.getElementById('text');
      if (!st || !t || Horror.worldActive || typingNow) return;
      const d = Horror.dread(st);
      if (d < 0.4 || Math.random() > d * 0.6) return;
      const orig = t.textContent;
      if (!orig || orig.length < 10) return;
      t.textContent = zalgo(orig);
      setTimeout(() => { if (t.textContent !== orig && !typingNow) t.textContent = orig; }, 220);
    }, 7000);
  }

  /* ---------------- public ---------------- */
  const Horror = {
    hook: {}, worldActive: false, reduce,
    bind(opts) { getState = opts.getState; Object.assign(this.hook, opts.hook || {}); ambientLoop(); },
    dread(st) { return Math.min(1, ((st.session || 1) - 1) / 9 + ((st.memory && st.memory.hostility) || 0) * 0.03); },
    setTyping(v) { typingNow = v; },
    music: Music, sceneFor, flash, blackout, welcomeBack,
    fx(name) {
      if (name === 'circus') document.body.classList.add('circus');
      else if (name === 'circus_off') document.body.classList.remove('circus');
      else if (name === 'blackout') blackout('', 1600);
      else if (name === 'crash') fakeCrash();
      else if (name === 'fake_delete') fakeDelete();
      else if (name.startsWith('flash:')) {
        const body = name.slice(6), i = body.lastIndexOf(':');
        const word = i > 0 && /^\d+$/.test(body.slice(i + 1)) ? body.slice(0, i) : body;
        const ms = i > 0 && /^\d+$/.test(body.slice(i + 1)) ? parseInt(body.slice(i + 1), 10) : 900;
        setTimeout(() => flash(word, ms), 500);
      }
    },
    async farewell(cb) { await flash('PLEASE.', 1200); await blackout('I will remember.', 1600); cb(); }
  };
  window.Horror = Horror;
})();
