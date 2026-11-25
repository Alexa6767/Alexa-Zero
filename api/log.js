// Anonymous play log. Stores only what the game sends: no IP, no headers, no accounts.
const U = process.env.KV_REST_API_URL, T = process.env.KV_REST_API_TOKEN;
async function redis(cmds) {
  const r = await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  return r.json();
}
const s = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).end(); return; }
  try {
    let b = req.body;
    if (typeof b === 'string') b = JSON.parse(b || '{}');
    b = b || {};
    const pid = s(b.pid, 40);
    if (!/^[a-z0-9]{8,40}$/.test(pid) || !U || !T) { res.status(400).end(); return; }
    const now = Date.now(), k = 'p:' + pid, cmds = [];
    const dev = ['phone', 'desktop', 'tablet'].includes(b.device) ? b.device : 'unknown';
    cmds.push(['HSETNX', k, 'first', String(now)]);
    cmds.push(['HSET', k, 'last', String(now), 'device', dev, 'browser', s(b.browser, 24), 'os', s(b.os, 16), 'lang', s(b.lang, 10), 'tz', s(b.tz, 40), 'sessionMax', String(Math.max(0, Math.min(12, b.session | 0)))]);
    cmds.push(['ZADD', 'plays', 'NX', String(now), pid]);
    const ev = s(b.ev, 16), d = b.d || {};
    if (ev === 'start') { cmds.push(['HINCRBY', k, 'visits', '1']); if (d.hero) cmds.push(['HSET', k, 'hero', s(d.hero, 2)]); }
    else if (ev === 'name') { cmds.push(['HSET', k, 'name', s(d.name, 30)]); cmds.push(['ZADD', 'named', 'NX', String(now), pid]); }
    else if (ev === 'hero') cmds.push(['HSET', k, 'hero', s(d.hero, 2)]);
    else if (ev === 'choice') {
      cmds.push(['RPUSH', 'c:' + pid, JSON.stringify({ t: now, r: s(d.room, 24), x: s(d.text, 80), c: s(d.cat, 8), s: b.session | 0 })]);
      cmds.push(['LTRIM', 'c:' + pid, '-400', '-1']);
      cmds.push(['HINCRBY', k, 'choices', '1']);
      if (d.cat) cmds.push(['HINCRBY', k, 'tone_' + s(d.cat, 8), '1']);
    } else if (ev === 'session') cmds.push(['HSET', k, 'room', s(d.room, 24)]);
    else if (ev === 'world') { cmds.push(['HINCRBY', k, 'w_' + s(d.mode, 8) + '_' + (d.win ? 'win' : 'try'), '1']); }
    else if (ev === 'ending') { cmds.push(['HSET', k, 'ending', s(d.ending, 12), 'endedAt', String(now)]); cmds.push(['ZADD', 'finished', 'NX', String(now), pid]); }
    else if (ev === 'music') cmds.push(['HSET', k, 'music', d.on ? 'on' : 'off']);
    await redis(cmds);
    res.status(204).end();
  } catch (e) { res.status(204).end(); }
};
