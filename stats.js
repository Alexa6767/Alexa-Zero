/* Anonymous play stats. Sends gameplay events to the site's own private endpoint.
   No IP, no account, no device name: a random play id kept in this browser only. */
(function () {
  var KEY = 'alexa-zero-pid', pid = '';
  try { pid = localStorage.getItem(KEY) || ''; if (!/^[a-z0-9]{8,40}$/.test(pid)) { pid = ''; } } catch (e) {}
  if (!pid) { var a = new Uint8Array(12); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; }); pid = Array.prototype.map.call(a, function (b) { return (b % 36).toString(36); }).join(''); try { localStorage.setItem(KEY, pid); } catch (e) {} }
  var ua = navigator.userAgent || '';
  var phone = /Android.*Mobile|iPhone|iPod|Mobile/i.test(ua), tablet = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  var device = phone ? 'phone' : tablet ? 'tablet' : 'desktop';
  var browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  var os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  var lastSession = -1;
  function send(ev, d, st) {
    try {
      var body = JSON.stringify({ pid: pid, ev: ev, d: d || {}, session: st ? st.session | 0 : 0, device: device, browser: browser, os: os, lang: (navigator.language || '').slice(0, 10), tz: tz });
      if (location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname)) return;
      fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  window.Stats = {
    ev: send,
    room: function (st, room, node) {
      if (st.session !== lastSession) { lastSession = st.session; send('session', { room: room }, st); }
      if (node && node.ending) send('ending', { ending: node.ending }, st);
    }
  };
  // the notice
  function note() {
    var s = document.getElementById('start-screen');
    if (!s || document.getElementById('stats-note')) return;
    var n = document.createElement('div'); n.id = 'stats-note';
    n.textContent = 'Your choices are recorded anonymously (no name, account or IP).';
    s.appendChild(n);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', note); else note();
})();
