// Private summary. Needs the secret key. Never returns IPs (none are stored).
const crypto = require('crypto');
const U = process.env.KV_REST_API_URL, T = process.env.KV_REST_API_TOKEN, K = process.env.STATS_KEY || '';
async function redis(cmds) {
  const r = await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  return (await r.json()).map(x => x.result);
}
const obj = (a) => { const o = {}; for (let i = 0; a && i < a.length; i += 2) o[a[i]] = a[i + 1]; return o; };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = String(req.headers['x-stats-key'] || '');
  const a = Buffer.from(key), b = Buffer.from(K);
  if (!K || a.length !== b.length || !crypto.timingSafeEqual(a, b)) { res.status(404).end(); return; }
  try {
    const q = req.query || {};
    const since = Number(q.since || 0), full = q.full === '1';
    const [total, finished] = await redis([['ZCARD', 'plays'], ['ZCARD', 'finished']]);
    const ids = (await redis([['ZRANGEBYSCORE', 'plays', '(' + since, '+inf']]))[0] || [];
    // also players that changed since `since`
    const act = (await redis([['ZRANGE', 'plays', '0', '-1']]))[0] || [];
    const hs = await redis(act.map(id => ['HGETALL', 'p:' + id]));
    const players = act.map((id, i) => Object.assign({ id: id.slice(0, 6) }, obj(hs[i])));
    const changed = players.filter(p => Number(p.last || 0) > since || Number(p.first || 0) > since);
    const newIds = new Set(ids.map(x => x.slice(0, 6)));
    const out = { now: Date.now(), total: Number(total), finished: Number(finished), newPlayers: changed.filter(p => newIds.has(p.id)).length, changed: changed.length };
    const brief = (p) => ({ id: p.id, name: p.name || null, hero: p.hero, device: p.device, browser: p.browser, os: p.os, first: Number(p.first), last: Number(p.last), sessionMax: Number(p.sessionMax || 0), room: p.room, choices: Number(p.choices || 0), tone: { bad: Number(p.tone_bad || 0), neutral: Number(p.tone_neutral || 0), good: Number(p.tone_good || 0) }, ending: p.ending || null, visits: Number(p.visits || 0) });
    out.players = (full ? players : changed).map(brief);
    if (q.choices) { const id = act.find(x => x.startsWith(String(q.choices))); if (id) out.choiceLog = (await redis([['LRANGE', 'c:' + id, '0', '-1']]))[0].map(x => JSON.parse(x)); }
    res.status(200).json(out);
  } catch (e) { res.status(500).json({ error: 'fail' }); }
};
