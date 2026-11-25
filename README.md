# Alexa-Zero

A Katana Zero style therapy-horror story. You sit across from Alexa, an AI
therapist with a timer, a temper and a memory. Ten sessions, a walkable
hallway between them, hidden log fragments, and four endings.
Progress is saved in your own browser (localStorage). No accounts, no server.

Content warning: depression, self-harm themes, flashing lights, sudden sounds.

## Run locally
Static site. Open `index.html` or run `npx serve .`

## Files
- `index.html`, `style.css`: page and look
- `script.js`: sessions 1-5 and the branching engine
- `story.js`: sessions 6-10, endings, story hooks
- `world.js`: the walkable hallway
- `horror.js`: meta horror effects and the generated soundtrack
- `app.js`: rendering, timer, sound, save/resume
- `nocturne.mp3`: background music for sessions 1-5
