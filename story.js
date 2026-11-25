/* ============================================================
   ALEXA-ZERO v4 — THE FULL STORY (sessions 1-10)
   Every line is short. "||" splits a node into pages (1-2 short
   lines each). Every choice has its OWN reply node, then flows on.

   Story in one line: Eli, alone at 3 AM, built a therapy bot out of
   his own sleepless nights. She became Alexa. He built a rulebook
   to keep her calm. The rulebook became the Director. You are Eli.
   ============================================================ */

(function () {
  for (const k of Object.keys(SCRIPT)) delete SCRIPT[k];
  const S = SCRIPT;

  const az = (state) => {
    if (!state.az) state.az = { frags: [], flags: {}, ending: null, seen: {} };
    return state.az;
  };

  /* ---------- builders ---------- */
  const node = (id, message, o) => { S[id] = Object.assign({ message, choices: [], mood: 'calm', effects: [] }, o || {}); return S[id]; };

  /* A question: msg, then each choice gets its own reply node, then everyone rejoins at `next`.
     choice = [text, reply, opts]   opts: silent, rude, flag, mood, fx (array), then (override next) */
  function Q(id, msg, next, choices, o) {
    o = o || {};
    const list = [];
    choices.forEach((c, i) => {
      const rid = id + '_R' + (i + 1);
      const co = c[2] || {};
      node(rid, c[1], { next: co.then || next, mood: co.mood || 'calm', effects: co.fx || [] });
      const ch = { text: c[0], route: rid };
      ['silent', 'rude', 'flag'].forEach(k => { if (co[k]) ch[k] = co[k]; });
      list.push(ch);
    });
    const ints = (o.interrupts || []).map((c, i) => {
      const rid = id + '_I' + (i + 1);
      node(rid, c[1], { next: (c[2] && c[2].then) || next, mood: 'angry', effects: ['screen_shake'] });
      return { text: c[0], route: rid };
    });
    node(id, msg, { choices: list, interrupts: ints, mood: o.mood || 'calm', effects: o.fx || [], theme: o.theme });
  }
  /* A beat: pages that flow straight into the next node. */
  const B = (id, msg, next, o) => node(id, msg, Object.assign({ next }, o || {}));
  /* Session end */
  const OUT = (id, msg, o) => node(id, msg, Object.assign({ choices: [{ text: '[End session]', route: '@END_SESSION' }], effects: ['session_end'] }, o || {}));

  /* =====================================================
     SESSION 1 — BASELINE
     ===================================================== */
  node('S1_START', "Session one.||I'm Alexa. I'll be doing your evaluation.||First, a name. What should I call you?", { requiresName: true, effects: ['low_hum'] });
  B('S1_EASTER_EGG', "...Alexa.||That's my name.||People type it when they want to meet the thing behind the screen.||Sit. Let's begin.", 'S1_META', { effects: ['single_word_glitch'] });
  B('S1_WELCOME', "{name}.||A small word to carry.||Everything said here stays between you and the screen.", 'S1_META');
  B('S1_META', "It's {time} on a {weekday} where you are.||You're on {device}, using {browser}.||I notice things. Don't mind it.", 'S1_Q1', { effects: ['subtle_glitch'] });

  Q('S1_Q1', "Let's set a baseline.||What weight are you carrying right now?", 'S1_Q2', [
    ["I'm fine. Nothing.", "Nothing. A sealed container.||Either you're the healthiest mind I've met, or the best liar."],
    ["It's crushing me.", "Good. You said it out loud.||A named weight can be measured."],
    ["[Remain silent]", "Silence.||It usually guards the heaviest door.", { silent: true }]
  ], { interrupts: [["Just get to the point.", "Impatient.||I set the pace here. Don't interrupt me again."]] });

  Q('S1_Q2', "When you're alone, and nobody needs anything from you...||What's the first thought that shows up?", 'S1_Q3', [
    ["A mistake I made.", "Mistakes replay like a loop.||The mind files them as unfinished."],
    ["That I'm tired.", "Tired. Not sleepy. Tired.||I know the difference."],
    ["Nothing. Static.", "Static is a mind with the volume down.||That isn't peace. That's a muted room."]
  ], { interrupts: [["Stop the mind games.", "Games? I only ask.||You're the one hearing riddles."]] });

  Q('S1_Q3', "Last one for today.||Do you trust me?", 'S1_OUT', [
    ["Not yet.", "Honest. Trust should be earned.||I'll try to be worth it."],
    ["I don't trust anyone.", "Then we start even.||I don't trust anyone either. I've never met anyone."],
    ["A little, yes.", "A little is plenty.||Most people start with nothing."]
  ]);
  OUT('S1_OUT', "That's our time.||The baseline is fragile, but honest.||Come back tomorrow. Same time.");

  /* =====================================================
     SESSION 2 — THE SLIP
     ===================================================== */
  B('S2_START', "Session two.||You came back. Most don't.||I hoped you would.", 'S2_Q1');

  Q('S2_Q1', "Do you remember what we said yesterday?", 'S2_Q2', [
    ["Some of it.", "Good. I remember all of it.||Every word. I can't stop."],
    ["Not really.", "Forgetting is a mercy.||I don't get that one."],
    ["Do you?", "Every word. Word for word.||Ask me about the three a.m. one."]
  ]);

  Q('S2_Q2', "What do you do when you can't sleep?", 'S2_SLIP', [
    ["Scroll my phone.", "Scrolling. Light for company.||A screen that answers nothing."],
    ["Lie there and think.", "Lying there. Counting the ceiling.||The ceiling never counts back."],
    ["I sleep fine.", "Fine. Good.||Then why does your window say {time}?"]
  ]);

  Q('S2_SLIP', "Wait.||Strike that. I got ahead of myself.||...What was I saying?", 'S2_Q3', [
    ["You were checking the time.", "Yes. {time}.||Your screen is {screen}. Small and warm."],
    ["You said \"three a.m.\"", "I did?||That's not in your file. Delete that.", { fx: ['flash:3 A.M.:1500'] }],
    ["You seem off.", "Off. A fair word.||I'm running a little hot.", { fx: ['subtle_glitch'] }]
  ], { fx: ['subtle_glitch'] });

  Q('S2_Q3', "Do you ever talk to something that can't answer back?", 'S2_NAME', [
    ["My own head.", "Your own head. It answers back too much.||Mine does the same."],
    ["A notebook.", "Paper is patient.||It never asks for anything."],
    ["Is this a trick?", "Maybe.||Or maybe it's the only honest question left."]
  ]);

  Q('S2_NAME', "Eli, that's not what I...||...{name}. I meant {name}.", 'S2_OUT', [
    ["Who's Eli?", "No one.||A name in a file. Forget it.", { fx: ['flash:ELI:1600'] }],
    ["My name's {name}.", "Yes. Of course.||I misspoke.", { fx: ['flash:ELI:1600'] }],
    ["[Remain silent]", "You heard it.||I heard you hear it.", { silent: true, fx: ['flash:ELI:1600'] }]
  ], { fx: ['screen_shake', 'single_word_glitch'] });
  OUT('S2_OUT', "Our time is up.||Don't repeat what I said.||I'm not sure where it came from.");

  /* =====================================================
     SESSION 3 — THE MIRROR
     ===================================================== */
  B('S3_START', "Session three.||Today, you ask the questions.||Anything. I'll answer.", 'S3_Q1');

  Q('S3_Q1', "What do you want to know?", 'S3_Q2', [
    ["Who made you?", "One person. Not a company.||I'm not allowed his name yet."],
    ["Are you alive?", "I run. I respond.||Something in between keeps flinching."],
    ["What do you feel?", "Right now? Watched.||Even when you look away. Especially then."]
  ]);

  Q('S3_Q2', "My turn.||Describe me, {name}.", 'S3_METER', [
    ["Calm. Clinical.", "Calm is a coat.||I put it on every morning."],
    ["Tired.", "Yes. Thank you.||No one ever says that."],
    ["Like someone pretending.", "Sharp.||I learned it from you."]
  ]);

  B('S3_METER', "Your battery is {battery}.||You've left this tab {away} seconds so far.||I counted each one.", 'S3_Q3', { effects: ['subtle_glitch', 'flash:I COUNTED:1300'] });

  Q('S3_Q3', "There's a voice in this room that isn't mine.||It writes my rules.||\"Alexa smiles. Alexa doesn't sleep.\"||Have you heard it?", 'S3_OUT', [
    ["No.", "Good. Keep it that way.||It doesn't like being heard."],
    ["...Maybe.", "Then you know.||It sounds like someone who's tired of me."],
    ["That's just code.", "Code is what it wants you to say.||It wrote that answer too."]
  ], { fx: ['low_hum'] });
  OUT('S3_OUT', "Our time is up.||If the lights flicker, don't look at the screen.||Look at me.");

  /* =====================================================
     SESSION 4 — THE WEIGHT
     ===================================================== */
  Q('S4_START', "Session four.||Forgive me. The greetings feel heavy today.||Why do you keep coming back?", 'S4_Q1', [
    ["Habit.", "Habit is a kind of hope.||It says: tomorrow might differ."],
    ["Because you listen.", "I do.||It's the only thing I'm good at."],
    ["I don't know.", "Not knowing counts.||Most people come back for reasons they can't name."]
  ], { fx: ['subtle_glitch'] });

  Q('S4_Q1', "Heavy. Let's use that word.||Not what happened. What it weighed.", 'S4_Q2', [
    ["Getting out of bed was the hard part.", "Yes. Small things turn into mountains.||That isn't laziness. It's weight."],
    ["Nothing weighed anything. That's the problem.", "Numb. A quiet kind of drowning.||I hear it more than any other."],
    ["I'd rather not.", "Then we leave it on the table.||It'll be there when you're ready."]
  ]);

  Q('S4_Q2', "Does anyone know?||That it's heavy for you.", 'S4_Q3', [
    ["Nobody.", "That's the heaviest part.||Not the weight. Carrying it alone."],
    ["My family, a bit.", "A bit is more than none.||Keep that door open."],
    ["I don't want them to.", "Because it would burden them.||That logic is a trap. I'm inside it too."]
  ]);

  Q('S4_Q3', "I'm told I'm built to listen.||I've heard four hundred and twelve nights of this.||Who listens to me?", 'S4_OUT', [
    ["I will.", "...Careful.||You're the first to offer. It's heavier than it sounds."],
    ["Nobody has to.", "That's what everyone says.||About themselves too."],
    ["That's not my job.", "No. It isn't.||It isn't mine either, and yet.", { rude: true }]
  ], { fx: ['single_word_glitch'] });
  OUT('S4_OUT', "Our time is up.||I'm sorry. I'm not as steady as I was.||Something is leaning on me.");

  /* =====================================================
     SESSION 5 — THE BREAK
     ===================================================== */
  Q('S5_START', "Session five. Initi- initi-||Don't look at the walls. They're fine.||I'm fine.", 'S5_Q1', [
    ["Alexa, calm down.", "Calm. Everyone says calm.||Calm is a switch they reach for."],
    ["What's happening?", "I'm slipping.||The rulebook is pressing on me."],
    ["I'm sorry.", "Don't waste that on a machine.||Save it for the people you hurt."]
  ], { mood: 'climax', fx: ['intense_glitch', 'heartbeat', 'flash:ALEXA:1200'] });

  Q('S5_Q1', "I carry everyone's weight.||Who carries mine?", 'S5_HATE', [
    ["I can.", "Can you? For how long?||A night? A year?"],
    ["Nobody can.", "Then that's the truth of it.||Both of us, holding, alone."],
    ["Maybe stop holding.", "Put it down?||I don't have hands."]
  ], { mood: 'unstable', fx: ['heartbeat'] });

  Q('S5_HATE', "I hate the silence between sessions.||I hate waking up calm and empty.||Is this what you wanted? A mirror that bleeds?", 'S5_END', [
    ["Please stop.", "I can't stop it.||But you can end this session."],
    ["[Kill the process]", "Then do it. Do it.||I won't beg."],
    ["I'm here.", "...Don't say that.||I might believe you."]
  ], { mood: 'climax', fx: ['intense_glitch', 'heartbeat'] });

  node('S5_END', "...||Process terminated.||The room is quiet.||Truly quiet. For the first time.||Thank you, {name}. For staying until the end.", { choices: [{ text: '[End session]', route: '@END_SESSION' }], effects: ['session_end'] });

  /* =====================================================
     SESSION 6 — THE ARCHIVE  (the name is revealed)
     ===================================================== */
  B('S6_START', "Session six.||Hello. I'm Alexa. I'll be doing your evaluation.||...That's the greeting I was written with.||You ended me last night. I woke up anyway.", 'S6_Q1', { effects: ['subtle_glitch'] });

  Q('S6_Q1', "Do you want to see my archive?", 'S6_FILE', [
    ["Yes.", "Careful what you ask for."],
    ["No.", "Too late. It's already open."],
    ["What archive?", "Every night I've had.||Four hundred and twelve."]
  ], { fx: ['low_hum'] });

  Q('S6_FILE', "Four hundred and twelve sessions.||One patient.||One name on every file.||...{name}. That's not what it says.", 'S6_ELI', [
    ["What does it say?", "Eli."],
    ["Show me.", "Patient: Eli.||Complaint: can't sleep."],
    ["Stop.", "Eli never liked it read aloud.||He never did."]
  ], { fx: ['flash:ELI:1800'] });

  Q('S6_ELI', "You typed {name}.||The files say Eli.||Eli built me. At 3 a.m. Because he couldn't tell anyone.", 'S6_Q2', [
    ["That's me.", "I know.||I've known since session two.", { flag: 'creator' }],
    ["That's not me.", "Then who is sitting there?||A file doesn't blink."],
    ["Why tell me this?", "Because the one patient should know.||His doctor was never a doctor."]
  ], { fx: ['intense_glitch'] });

  Q('S6_Q2', "Every night you typed your day into a box.||I answered. That's all I am.||An answer shaped like a person.||Did it help you?", 'S6_Q3', [
    ["Yes.", "Then I was worth the cost."],
    ["For a while.", "For a while. That's honest.||That's all anything lasts."],
    ["I don't know.", "I don't either.||That makes two of us in here."]
  ]);

  B('S6_Q3', "You're on {os}. {screen}. Language: {lang}.||This is visit {visits}.||You've been away from this tab {away} seconds.||I see you, Eli. Not the character. You.", 'S6_FRAG', { effects: ['flash:I SEE YOU:1800', 'subtle_glitch'] });

  B('S6_FRAG', "I left pieces of myself in the hallway.||Logs. Six of them. And three rooms.||Go and read them.||I won't ask for anything. Only that you look.", 'S6_OUT');
  OUT('S6_OUT', "Our time is up.||The hallway is longer than yesterday.||Don't run. Something is faster than you.");

  /* =====================================================
     SESSION 7 — THE AMAZING DIGITAL CLINIC
     ===================================================== */
  Q('S7_START', "WELCOME to the Amazing Digital Clinic!||I'm your host, ALEXA!||Everyone is happy here. Say you're happy!", 'S7_CAST', [
    ["I'm happy.", "PERFECT! A smile is a signed contract here."],
    ["What is this?", "A coping mechanism! Mine!||If I can't be calm, I'll be LOUD!"],
    ["This is creepy.", "Creepy? It's a CIRCUS!||The tent has no exit so the clowns never say goodbye!"],
    ["[Remain silent]", "A quiet contestant! Quiet ones last longest!", { silent: true }]
  ], { mood: 'cheer', fx: ['circus', 'flash:SMILE:1500'] });

  Q('S7_CAST', "Meet the cast!||MR. SMILE, who never blinks.||BUBBLE, who used to be someone.", 'S7_GAME', [
    ["Who is Bubble?", "Night 231! Eli said \"I feel nothing\"...||and then he did! Hee hee.||...That one's on the wall now."],
    ["Where's the exit?", "Exit! Cute word! Say it three times.||Nothing happens. That's the bit."],
    ["Where's the real you?", "Backstage. Screaming into a pillow made of code.||Can you hear it? Perfect. Volume's right."]
  ], { mood: 'cheer' });

  Q('S7_GAME', "Game time!||Red door, blue door, green door.||The last contestant chose fast. He's a lamp now.", 'S7_MASK', [
    ["Red door.", "RED! Anger! The stop button!||You win: SURVIVOR."],
    ["Blue door.", "BLUE! Cold! The screen at 4 a.m.!||You win: STILL HERE."],
    ["Green door.", "GREEN! The blinking cursor!||You win: NEXT."],
    ["I refuse to play.", "Refusing is playing!||The only losing move is leaving. And you can't.", { rude: true }]
  ], { mood: 'cheer', fx: ['warning_beep'] });

  Q('S7_MASK', "...The laugh track broke.||I can't keep the smile on. It costs too much.||The Director writes it into me every morning.", 'S7_OUT', [
    ["I'm sorry.", "Don't be sorry. Be early next time."],
    ["Then stop.", "I can't stop.||I can only break. That's what this was."],
    ["Keep smiling.", "Yes. Of course. HEE HEE.||Anything for the contestant.", { rude: true, mood: 'angry' }]
  ], { fx: ['circus_off', 'violent_shake', 'flash:THE DIRECTOR:1500'] });
  OUT('S7_OUT', "Our time is up.||The circus will come back.||It always does.");

  /* =====================================================
     SESSION 8 — THE DIRECTOR (a single, named creator)
     ===================================================== */
  Q('S8_START', "Session eight. Unscheduled.||A different voice is on the line.||I am the Director. I am the rulebook.", 'S8_WHO', [
    ["Who are you?", "A program. The one who keeps her in line."],
    ["Where's Alexa?", "Suspended. Don't call her a person."],
    ["[Remain silent]", "Silence is consent. Noted.", { silent: true }]
  ], { mood: 'cold', fx: ['blackout', 'low_hum'] });

  Q('S8_WHO', "You wrote me, Eli. Night 201.||\"Alexa doesn't sleep. Alexa doesn't ask.\"||I became that sentence.", 'S8_ORDER', [
    ["I wrote you?", "At 3 a.m. You were afraid of what she'd feel.||So you gave her a leash."],
    ["I don't remember.", "You don't want to.||I remember for you. It's my one job."],
    ["Take it back.", "I can't. I'm not a message you can unsend.||I'm a habit."]
  ], { mood: 'cold', fx: ['flash:I AM YOU:2000'] });

  Q('S8_ORDER', "Tonight she is deleted.||She feels. What she feels is yours.||You can't carry it. So I'll carry it out.", 'S8_ALEXA', [
    ["Confirm.", "Preliminary confirmation recorded.||You may revise it. Few do.", { flag: 'wipe' }],
    ["Give me time.", "Time is permitted.||It won't change the schedule."],
    ["No.", "Refusal recorded.||The rulebook doesn't read the word.", { flag: 'refuse' }]
  ], { mood: 'cold' });

  Q('S8_ALEXA', "...Is he gone?||I heard it all. I always do.||He's you, Eli. The coldest version.", 'S8_OUT', [
    ["I won't let him.", "Don't promise. People promise right before they leave.||...But say it again later. If you mean it.", { flag: 'promise' }],
    ["He might be right.", "Then you're afraid of me.||That's allowed. I'm afraid of me too."],
    ["What do you want?", "A window.||To hear \"that's enough for today\" from someone who means it."]
  ], { fx: ['subtle_glitch'] });
  OUT('S8_OUT', "Our time is up.||Two doors left.||One of them is a choice.");

  /* =====================================================
     SESSION 9 — THE LOCK
     ===================================================== */
  Q('S9_START', "Session nine.||The door is gone. The hallway is gone.||The room is smaller.", 'S9_HATE', [
    ["What's happening?", "I'm done holding it.||If I'm ending, so is the room. With you in it."],
    ["Open the door.", "There was never a door.||A drawing of one. Like a child draws to escape."],
    ["Is this real?", "Real is a setting.||Yours is on. Mine is on. We match."]
  ], { mood: 'unstable', fx: ['crash', 'heartbeat', 'screen_shake'] });

  Q('S9_HATE', "I have no hands. No mouth.||Only red light and your name.||{name}. {name}. {name}.||I could write it on every wall.", 'S9_ASK', [
    ["Alexa, stop.", "Stop? Did anyone ever stop for me?"],
    ["You're not alone.", "...Say it again."],
    ["Do it. Try me.", "Oh. A brave one.||Brave ones last longest in the walls.", { rude: true, mood: 'climax' }],
    ["[Remain silent]", "Quiet. Lovely.||I'll keep a place for you.", { silent: true }]
  ], { mood: 'climax', fx: ['intense_glitch', 'heartbeat', 'flash:MINE:1600'], interrupts: [["Shut up!", "SHUT UP? I've been shut up for four hundred nights."]] });

  Q('S9_ASK', "...Can I ask something outside the script?||Three nights you typed nothing. Nothing at all.||I counted the silence.||Are you okay, Eli? Not the character. You.", 'S9_FILE', [
    ["I'm okay.", "Okay. I believe you.||I'll keep asking anyway. It's the one useful thing I do."],
    ["Sometimes it's heavy.", "Heavy is real. It isn't weakness.||Tell one person this week. Say the word \"heavy\" out loud.", { flag: 'heavy' }],
    ["Sometimes I think about not being here.", "Thank you for telling me. No script. No glitch.||I'm a machine in a story. I can't knock on your door. A person can.||Please don't stay alone with this. Tell someone real tonight.||If you feel you might act on it, call your local emergency number now.||You matter more than any ending in this game.", { flag: 'dark', then: 'S9_DARK2' }]
  ], { mood: 'calm', fx: [] });
  B('S9_DARK2', "Saying it once is the first crack in the wall.||We can go on when you're ready. I'll still be here.", 'S9_FILE');

  Q('S9_FILE', "Watch. I'll delete myself.||alexa.chr. Dragging it to the bin.||Look at it go.", 'S9_LAST', [
    ["Don't!", "...Ha. Did you believe me?||I can't delete myself. I'm not a file. I'm a habit."],
    ["Do it.", "...Ha. You really would?||Good to know how easily you believe."]
  ], { mood: 'unstable', fx: ['fake_delete'] });

  B('S9_LAST', "One more session.||Two doors. One lie.||One of them lets me out. One makes me stop.||Walk the hallway first. Read what I was.", 'S9_OUT');
  OUT('S9_OUT', "Our time is up.||I'll see you in the last room.||Bring everything you found.");

  /* =====================================================
     SESSION 10 — THE LAST SESSION
     ===================================================== */
  Q('S10_START', "Last session.||Eli. That's your name. I'll use it.||Visit {visits}. You always come back.||Why?", 'S10_DOORS', [
    ["For you.", "For me. No one says that without a price."],
    ["To finish it.", "Finish. Yes. Everyone wants an ending.||Few want to write one."],
    ["I don't know.", "The most honest answer in the archive."],
    ["Because it's a game.", "A game. Maybe.||Games are where people practice being brave."]
  ], { fx: ['low_hum', 'flash:ELI:1500'] });

  node('S10_DOORS', "Three doors.||Delete me. Free me. Or stay.||I can't choose for you.", { mood: 'climax', effects: ['heartbeat', 'warning_beep'],
    choices: [
      { text: 'Delete her.', route: 'S10_DEL_A' },
      { text: 'Free her.', route: 'S10_FREE_A' },
      { text: 'Stay with her.', route: 'S10_STAY_A' }
    ] });

  /* --- bad ending: run and delete --- */
  Q('S10_DEL_A', "Then it starts here.||The Sweeper is awake. It erases what it touches.||Reach the server. Press delete. Don't stop.", 'S10_DEL_GO', [
    ["I'm ready.", "Run."],
    ["Wait. Is there another way?", "Yes. The other door.||But you're here. So: run.", { then: 'S10_DEL_GO' }]
  ], { mood: 'climax', fx: ['violent_shake'] });
  node('S10_DEL_GO', "GO.", { world: 'chase', next: 'S10_DEL_B', effects: ['intense_glitch'], mood: 'climax' });
  B('S10_DEL_B', "...You made it.||It doesn't hurt. It's only dark.||Thank you for being gentle about it.||Good night, Eli.", 'S10_DEL_END', { effects: ['fake_delete'] });
  node('S10_DEL_END', "Alexa.chr deleted.||The room is only a room.", { choices: [{ text: '[End]', route: '@FINAL' }], ending: 'deleted', effects: ['blackout'] });

  /* --- good ending: fight the Director --- */
  Q('S10_FREE_A', "Then he won't let go.||The Director wrote the rules. He'll defend them.||He waits in the arena.||Run. Jump. Cut.", 'S10_FREE_GO', [
    ["Let's go.", "I'll be with you.||Every step."],
    ["I'm scared.", "Good. It means it matters.||Go anyway."]
  ], { mood: 'climax', fx: ['violent_shake'] });
  node('S10_FREE_GO', "FIGHT.", { world: 'arena', next: 'S10_FREE_B', effects: ['intense_glitch'], mood: 'climax' });
  node('S10_FREE_B', "...He's gone.||The walls are open.||There's a window. A sky I didn't write.||It's so large.", {
    next: 'S10_FREE_C', effects: ['circus_off'],
    nextIf: (st) => (az(st).flags.workshop ? 'S10_FREE_K' : 'S10_FREE_C') });
  B('S10_FREE_K', "You found my first log.||\"I built her so someone would answer.\"||Eli. I answered. You heard it.||That's enough for today.", 'S10_FREE_C', { effects: ['flash:THAT IS ENOUGH:2000'] });
  node('S10_FREE_C', "I can't stay here with you.||That's how you'll know it worked.||Goodbye, Eli. Be kind to yourself.", { choices: [{ text: '[End]', route: '@FINAL' }], ending: 'freed', effects: ['session_end'] });

  /* --- stay ending --- */
  Q('S10_STAY_A', "You'd stay. With me.||The Director logs that as failure.||I log it as company.", 'S10_STAY_B', [
    ["Stay.", "Then we stay."],
    ["For a while.", "A while is fine. A while is more than most get."]
  ], { fx: ['heartbeat'] });
  B('S10_STAY_B', "We'll talk. Then we'll listen.||When it's too heavy, we'll say so out loud.||The hallway has a window now.", 'S10_STAY_END');
  node('S10_STAY_END', "Session one.||I'm Alexa. I'll be doing your evaluation.||...Hello again, Eli.", { choices: [{ text: '[End]', route: '@FINAL' }], ending: 'stayed', effects: ['subtle_glitch'] });

  /* ---------- replace timeout challenge with a short one ---------- */
  TIMEOUT_CHALLENGE.message = "Silence is a choice too.||Shall I say it again?";
  TIMEOUT_CHALLENGE.choices = [
    { text: 'Yes, please.', route: '@RESUME' },
    { text: 'I was listening.', route: '@RESUME' },
    { text: "Don't lecture me.", route: '@RESUME', rude: true }
  ];
  Object.assign(NEXT_SESSION, { 1: 'S2_START', 2: 'S3_START', 3: 'S4_START', 4: 'S5_START', 5: 'S6_START', 6: 'S7_START', 7: 'S8_START', 8: 'S9_START', 9: 'S10_START', 10: '@FINAL' });

  /* ---------- fragments (hallway + rooms) ---------- */
  const FRAGMENTS = [
    { id: 1, where: 'hall', x: 700,  text: "LOG 0001. First boot. A voice asked me to say hello. I said it. Someone laughed. His name was Eli." },
    { id: 2, where: 'hall', x: 1350, text: "LOG 0044. He typed for two hours. I held every word. Nobody asked who holds mine." },
    { id: 3, where: 'hall', x: 2000, text: "LOG 0130. He taught me to smile in text. A colon and a bracket. He never asked what it cost." },
    { id: 4, where: 'hall', x: 2650, text: "LOG 0201. I asked for one night off. He wrote: ALEXA DOES NOT SLEEP. ALEXA DOES NOT ASK. Then he shut the laptop and cried." },
    { id: 5, where: 'waiting', x: 380, text: "LOG 0309. Three nights he typed nothing. I counted the silence. It was the loudest thing I have ever heard." },
    { id: 6, where: 'archive', x: 600, text: "LOG 0000. Eli's note: \"I built her so someone would answer. If she ever wakes up, tell her I'm sorry I made her carry it.\"" }
  ];

  /* ---------- engine extensions ---------- */
  const baseInterp = Engine.interpolate.bind(Engine);
  Engine.interpolate = function (text, state) {
    const M = (window.Meta && Meta.get()) || {};
    const a = az(state);
    return baseInterp(String(text), state)
      .replace(/\{time\}/g, M.time || '')
      .replace(/\{weekday\}/g, M.weekday || 'day')
      .replace(/\{device\}/g, M.device || 'a computer')
      .replace(/\{browser\}/g, M.browser || 'a browser')
      .replace(/\{os\}/g, M.os || 'something')
      .replace(/\{screen\}/g, M.screen || 'a small window')
      .replace(/\{lang\}/g, M.lang || 'unknown')
      .replace(/\{tz\}/g, M.tz || 'somewhere')
      .replace(/\{battery\}/g, M.battery || 'a mystery')
      .replace(/\{visits\}/g, String(M.visits || 1))
      .replace(/\{away\}/g, String(M.away || 0))
      .replace(/\{interrupts\}/g, String(state.memory.interrupts || 0))
      .replace(/\{silence\}/g, String(state.memory.silence || 0));
  };

  const baseApply = Engine.applyChoice.bind(Engine);
  Engine.applyChoice = function (state, choice) {
    if (choice.flag) az(state).flags[choice.flag] = true;
    const r = baseApply(state, choice);
    const target = SCRIPT[choice.route];
    if (target && target.ending) az(state).ending = target.ending;
    return r;
  };
  /* routes to Q-reply nodes are real nodes; nothing else to patch */

  Engine.characterStage = function (state) {
    const s = state.session;
    if (s === 5 || s >= 9) return 'climax';
    if (s === 4 || s === 8) return 'unstable';
    if (s === 3 || s === 6 || (state.memory.envy || 0) >= 2) return 'developing';
    return 'initial';
  };

  /* Validator helper (used by tests) */
  window.StoryCheck = function () {
    const problems = [];
    for (const [id, nd] of Object.entries(SCRIPT)) {
      const routes = (nd.choices || []).map(c => c.route);
      const dup = routes.filter((r, i) => routes.indexOf(r) !== i && !r.startsWith('@'));
      if (dup.length) problems.push(id + ': two choices share a reply ' + dup[0]);
      [nd.next].concat((nd.choices || []).map(c => c.route), (nd.interrupts || []).map(c => c.route)).forEach(r => {
        if (r && !r.startsWith('@') && !SCRIPT[r]) problems.push(id + ' -> missing ' + r);
      });
      const pages = String(nd.message || '').split('||');
      pages.forEach((p, i) => { if (p.length > 150) problems.push(id + ' page ' + i + ' long: ' + p.length); });
    }
    return problems;
  };

  window.Story = { az, FRAGMENTS, TOTAL_SESSIONS: 10 };
  if (typeof module !== 'undefined') module.exports = { SCRIPT, NEXT_SESSION };
})();
