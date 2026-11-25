/* Session atmosphere: a drifting inkblot behind the text. Its colour, speed and sharpness follow
   the tone of the player's choices (harsh, neutral, gentle) and the mood of the scene. */
(function () {
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var cv = document.createElement('canvas');
  cv.id = 'atmo';
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d');
  var W = 128, H = 72;
  cv.width = W; cv.height = H;
  var img = ctx.createImageData(W, H), data = img.data;
  var tone = 0, toneT = 0, mood = 0, moodT = 0.2, dread = 0, boost = 0, t = 0, last = 0, acc = 0;
  var C = {
    harsh:   { ink: [210, 14, 44],  bg: [20, 0, 6],   sp: 1.5, sharp: 0.05 },
    neutral: { ink: [78, 92, 128],  bg: [6, 8, 16],   sp: 0.6, sharp: 0.14 },
    gentle:  { ink: [70, 170, 160], bg: [8, 16, 18],  sp: 0.38, sharp: 0.3 }
  };
  function mix(a, b, u) { return a + (b - a) * u; }
  function params() {
    var a = tone < 0 ? C.neutral : C.neutral, b = tone < 0 ? C.harsh : C.gentle, u = Math.min(1, Math.abs(tone));
    return {
      ink: [mix(a.ink[0], b.ink[0], u), mix(a.ink[1], b.ink[1], u), mix(a.ink[2], b.ink[2], u)],
      bg: [mix(a.bg[0], b.bg[0], u), mix(a.bg[1], b.bg[1], u), mix(a.bg[2], b.bg[2], u)],
      sp: mix(a.sp, b.sp, u), sharp: mix(a.sharp, b.sharp, u)
    };
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || cv.style.display === 'none') return;
    var dt = Math.min(0.1, (now - last) / 1000 || 0); last = now; acc += dt;
    if (acc < 1 / 14) return; dt = acc; acc = 0;
    tone += (toneT - tone) * Math.min(1, dt * 1.2);
    toneT *= Math.pow(0.985, dt * 10);
    mood += (moodT - mood) * Math.min(1, dt * 1.5);
    boost *= Math.pow(0.3, dt);
    var p = params();
    var inten = Math.min(1.3, 0.35 + mood * 0.5 + dread * 0.45 + boost);
    t += dt * p.sp * (0.7 + inten);
    var wave = Math.sin(t * 0.9) * 0.5 + 0.5;
    var fy = tone < -0.2 ? 5.6 : 3.8;
    var i, x, y;
    for (y = 0; y < H; y++) {
      var v = y / H, bar = Math.exp(-Math.pow((v - ((t * 0.07) % 1.2)) * 9, 2));
      for (x = 0; x < W / 2; x++) {
        var u = x / W;
        var f = Math.sin(u * 14 + t) + Math.sin(v * fy - t * 0.7 + u * 3) + Math.sin((u + v) * 9 + t * 0.5) +
          Math.sin(Math.sqrt((u - 0.3) * (u - 0.3) + (v - 0.5) * (v - 0.5)) * 20 - t * 1.1) * 0.9;
        f += 2.1 * Math.exp(-Math.pow((u - 0.5) * 4.2, 2)) - 1.15 - (1 - wave) * 0.25;
        var k = (f - 0.25) / p.sharp; k = k < 0 ? 0 : k > 1 ? 1 : k;
        var a = k * (0.55 + 0.45 * inten) * (0.8 + 0.4 * bar);
        a = a > 1 ? 1 : a;
        var r = p.bg[0] + (p.ink[0] - p.bg[0]) * a, g = p.bg[1] + (p.ink[1] - p.bg[1]) * a, b = p.bg[2] + (p.ink[2] - p.bg[2]) * a;
        var n = (Math.random() - 0.5) * 14;
        for (var s = 0; s < 2; s++) {
          i = (y * W + (s ? W - 1 - x : x)) * 4;
          data[i] = r + n; data[i + 1] = g + n; data[i + 2] = b + n; data[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  if (!reduce) requestAnimationFrame(frame); else { last = 0; frame(0); }
  var MOOD = { calm: 0.1, warm: 0, gentle: 0, curious: 0.25, tense: 0.6, cold: 0.5, angry: 1, intense: 1, challenging: 0.9, unstable: 1, climax: 1.2 };
  window.Atmo = {
    pick: function (cat) { toneT = Math.max(-1.2, Math.min(1.2, toneT + (cat === 'bad' ? -0.6 : cat === 'good' ? 0.6 : 0.05))); boost = 0.5; },
    scene: function (st, node) {
      mood = mood; moodT = (node && MOOD[node.mood] != null) ? MOOD[node.mood] : 0.3;
      dread = window.Horror && Horror.dread && st ? Horror.dread(st) : 0;
      if (node && /angry|intense|unstable|climax|challenging/.test(node.mood || '')) toneT = Math.min(toneT, -0.5);
    },
    show: function (on) { cv.style.display = on ? 'block' : 'none'; },
    _s: function () { return { tone: tone, toneT: toneT, mood: mood, dread: dread }; },
    _set: function (v) { tone = toneT = v; }
  };
})();
