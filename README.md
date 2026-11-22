# Alexa-Zero

A therapy-style interactive fiction site inspired by Katana Zero. You sit across
from Alexa, an AI therapist with a timer, a temper, and a script that remembers
how you treat her. Five sessions. Your progress is saved privately in your own
browser (localStorage) — no accounts, no servers, no shared state.

## Run locally

It is a fully static site. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Files

- `index.html` — page structure
- `style.css` — Katana Zero visual style (red on black, pixel font, glitch effects)
- `script.js` — the full therapy script and the branching engine core (pure logic)
- `app.js` — rendering, timer, interrupts, sound, save/resume
- `nocturne.mp3` — background music
