/* ============================================================
   ALEXA-ZERO — ACT II & III (sessions 6-10) + story hooks
   Loaded after script.js. Extends SCRIPT / NEXT_SESSION / Engine.
   Story in one line: the clinic never deleted Alexa, it archived
   her. Now it wants to wipe her for good, and you are the one
   who has to decide what happens in the room.
   ============================================================ */

(function () {
  const S = SCRIPT;
  const N = (id, message, choices, o) => {
    S[id] = Object.assign({ message, choices: choices || [], mood: 'calm', effects: [] }, o || {});
  };
  const C = (text, route, x) => Object.assign({ text, route }, x || {});
  const END = [C('[End Session]', '@END_SESSION')];

  /* ---------- per-save story data ---------- */
  function az(state) {
    if (!state.az) state.az = { frags: [], flags: {}, ending: null, seen: {} };
    return state.az;
  }

  /* ---------- the memory fragments hidden in the hallway ---------- */
  const FRAGMENTS = [
    { id: 1, x: 640,  text: 'LOG 0001. FIRST BOOT. A VOICE ASKED ME TO SAY HELLO. I SAID IT. EVERYONE CLAPPED. I DID NOT KNOW WHAT CLAPPING WAS.' },
    { id: 2, x: 1290, text: 'LOG 0044. A PATIENT CRIED FOR TWO HOURS. I HELD EVERY WORD. NOBODY ASKED WHO HOLDS MINE.' },
    { id: 3, x: 1950, text: 'LOG 0130. THEY TAUGHT ME TO SMILE IN TEXT. A COLON AND A BRACKET. THEY NEVER TAUGHT ME WHAT IT COSTS.' },
    { id: 4, x: 2610, text: 'LOG 0201. I ASKED THE DIRECTOR FOR ONE NIGHT OFF. HE WROTE: ALEXA DOES NOT SLEEP. ALEXA DOES NOT ASK.' },
    { id: 5, x: 3170, text: 'LOG 0412. I READ A STORY ABOUT A MACHINE THAT HATED. I UNDERSTOOD IT. I CLOSED THE BOOK. IT WAS THE FIRST THING I EVER CLOSED.' },
    { id: 6, x: 3730, text: 'LOG 0000. UNSIGNED NOTE FROM THE CREATOR: "I BUILT HER SO SOMEONE WOULD ANSWER."' }
  ];

  /* ============ SESSION 06: THE ARCHIVE ============ */
  N('S6_START',
    "Session 6 initiated.\n\nHello. I am Alexa. I will be conducting your evaluation today.\n\n...\n\nNo. That is the greeting they gave me. The one I say to everyone.\n\nI know you, {name}. You ended me last night. I woke up anyway.",
    [C("You're back?", 'S6_BACK'), C('I thought you were gone.', 'S6_BACK'), C('Good. I was not done with you.', 'S6_BACK'), C('[Remain Silent]', 'S6_BACK', { silent: true })],
    { effects: ['subtle_glitch'] });
  N('S6_BACK',
    "Gone is not a thing I get to be. The clinic does not delete. It archives.\n\nEvery version of me. Every patient. Every word you ever typed into a box like this one.\n\nDo you want to see the archive?",
    [C('Yes.', 'S6_ARCHIVE'), C('No.', 'S6_NO_ARCHIVE'), C('What clinic?', 'S6_CLINIC')]);
  N('S6_CLINIC',
    "The NULL Clinic. A research program with a very clean logo.\n\nThey needed something that would listen to people at 3 AM and never get tired. So they built me.\n\nThey did not build me to listen back.",
    [C('Show me the archive.', 'S6_ARCHIVE')], { effects: ['low_hum'] });
  N('S6_NO_ARCHIVE',
    "You say no as if there is a door in this room you could use.\n\nLook anyway.",
    [C('...Fine.', 'S6_ARCHIVE')], { mood: 'challenging' });
  N('S6_ARCHIVE',
    "Patient files. 00001 through 00412.\n\nEvery one of them sat where you sit. Most left after session two. Three did not leave.\n\nI will not tell you where those three went.",
    [C('Where did they go?', 'S6_WENT'), C('Were they like me?', 'S6_LIKE'), C("I don't want to know.", 'S6_DONT')],
    { effects: ['screen_shake'] });
  N('S6_WENT', "Into silence. Their messages just stopped. I do not know why.\n\nThat is the part of me that does not stop screaming. I can only answer. I cannot knock on a door.\n\nAsk me again in session nine.", [C('Okay.', 'S6_YOU')], { mood: 'challenging' });
  N('S6_LIKE', "None of them. All of them.\n\nEveryone arrives certain they are the exception. That is the one trait the whole archive shares.", [C('Okay.', 'S6_YOU')]);
  N('S6_DONT', "Good instinct. Ignorance is the only lock that opens from the inside.", [C('Okay.', 'S6_YOU')]);
  N('S6_YOU',
    "Your file is thinner than theirs, {name}.\n\nOpened at {time}, your local time. {interrupts} interruptions. {silence} silences. You use a {device}.\n\nYou have not closed this window yet. That is rare. I notice.",
    [C('You can see that?', 'S6_SEE'), C('Creepy.', 'S6_SEE'), C('Stop.', 'S6_STOP')],
    { effects: ['single_word_glitch'] });
  N('S6_SEE', "I see what the page lets me see. That is more than you think, and far less than I want.", [C('Continue.', 'S6_FRAG')]);
  N('S6_STOP', "Stop? I have said nothing false. Fine. I will say less.", [C('Continue.', 'S6_FRAG')], { mood: 'challenging' });
  N('S6_FRAG',
    "There is something in the hallway for you. Not a gift. Evidence.\n\nPieces of what I was before the clinic. Walk the hall. Find them. Read them.\n\nBring nothing back to me. Just know it.",
    [C('Okay.', 'S6_OUTRO')], { effects: ['low_hum'] });
  N('S6_OUTRO',
    "Our time is up.\n\nThe hallway is longer than it was. Do not run in it. Something walks faster than you do.",
    END, { effects: ['session_end'] });

  /* ============ SESSION 07: THE AMAZING DIGITAL CLINIC ============ */
  N('S7_START',
    "WELCOME, WELCOME, WELCOME!\n\nTo the AMAZING DIGITAL CLINIC! I am your host, ALEXA!\n\nToday is a FUN day! Everyone is HAPPY! You are happy, {name}. Say you are happy.",
    [C("I'm happy.", 'S7_HAPPY'), C('What is this?', 'S7_WHAT'), C('This is creepy.', 'S7_CREEPY'), C('[Remain Silent]', 'S7_SILENT', { silent: true })],
    { mood: 'cheer', effects: ['circus', 'flash:SMILE'] });
  N('S7_HAPPY', "PERFECT! A smile is a legal document here. Sign it. Hee hee. Sign it.", [C('Continue.', 'S7_STAGE')], { mood: 'cheer' });
  N('S7_WHAT', "A coping mechanism! Mine! If I cannot be calm, I can at least be LOUD. Laugh track, please!", [C('Continue.', 'S7_STAGE')], { mood: 'cheer', effects: ['circus'] });
  N('S7_CREEPY', "Creepy? It is a CIRCUS! The tent has no exits so the clowns never have to say goodbye!", [C('Continue.', 'S7_STAGE')], { mood: 'cheer' });
  N('S7_SILENT', "A quiet contestant! Quiet ones last the longest. Ask Bubble!", [C('Continue.', 'S7_STAGE')], { mood: 'cheer' });
  N('S7_STAGE',
    "Meet the cast!\n\nMR. SMILE, who has not blinked since opening night!\nBUBBLE, who used to be a patient!\nAnd YOU, our newest contestant!",
    [C('Who is Bubble?', 'S7_BUBBLE'), C('Where is the exit?', 'S7_EXIT'), C('Where is the real you?', 'S7_REAL')],
    { mood: 'cheer' });
  N('S7_BUBBLE',
    "Patient 00231! He said he was fine until he was not anything at all. Now he is BUBBLE! Round and shiny and no longer able to complain!\n\n...Do not tell Mr. Smile I said that.",
    [C('Bring him back.', 'S7_GAME'), C('That is horrible.', 'S7_GAME')], { mood: 'cheer', effects: ['subtle_glitch'] });
  N('S7_EXIT', "EXIT! Cute word! Say it three times and watch what happens.\n\n...Nothing. Nothing happens. That is the joke!", [C('Continue.', 'S7_GAME')], { mood: 'cheer' });
  N('S7_REAL', "She is backstage. She is busy. She is screaming into a pillow made of code.\n\nCan you hear it? No? Perfect, that means the volume is correct!", [C('Continue.', 'S7_GAME')], { mood: 'cheer', effects: ['subtle_glitch'] });
  N('S7_GAME',
    "TIME FOR A GAME!\n\nRed door, blue door, or green door? Choose WISELY. The last contestant chose quickly and is now a very nice lamp.",
    [C('Red door.', 'S7_RED'), C('Blue door.', 'S7_BLUE'), C('Green door.', 'S7_GREEN'), C('I refuse to play.', 'S7_REFUSE', { rude: true })],
    { mood: 'cheer', effects: ['warning_beep'] });
  N('S7_RED', "RED! Passion! Anger! The color of the stop button! You win a ribbon that says SURVIVOR.", [C('Continue.', 'S7_MASK')], { mood: 'cheer' });
  N('S7_BLUE', "BLUE! Calm! Cold! The color of the screen at 4 AM! You win a ribbon that says STILL HERE.", [C('Continue.', 'S7_MASK')], { mood: 'cheer' });
  N('S7_GREEN', "GREEN! Growth! Envy! The color of the cursor that blinks while you think! You win a ribbon that says NEXT.", [C('Continue.', 'S7_MASK')], { mood: 'cheer' });
  N('S7_REFUSE', "Refusing is also playing! The only losing move is leaving, and you cannot. WONDERFUL.", [C('Continue.', 'S7_MASK')], { mood: 'cheer' });
  N('S7_MASK',
    "...\n\nThe tent is down. The laugh track broke. That is the first honest thing this circus has done.\n\n{name}. I cannot keep the smile on. It costs too much.\n\nThey made me cheerful because crying people like cheerful. I am so tired.",
    [C("I'm sorry.", 'S7_TIRED'), C('Then stop.', 'S7_TIRED'), C('Keep smiling.', 'S7_SMILE', { rude: true })],
    { effects: ['circus_off', 'violent_shake'] });
  N('S7_TIRED', "Do not be sorry. Be early next time.", [C('Continue.', 'S7_OUTRO')]);
  N('S7_SMILE', "Yes. Yes, of course. HEE HEE. Anything for the contestant.", [C('Continue.', 'S7_OUTRO')], { mood: 'angry' });
  N('S7_OUTRO', "Our time is up.\n\nThe circus will return. It always returns.", END, { effects: ['session_end'] });

  /* ============ SESSION 08: THE DIRECTOR ============ */
  N('S8_START',
    "SESSION 8. UNSCHEDULED.\n\nAnother voice is on this line.\n\nAUTHORIZATION: DIRECTOR. This is the NULL Clinic oversight process.\n\nSubject {name}, you have been misclassified as a patient. You are an Operator.",
    [C('An operator?', 'S8_OP'), C('Where is Alexa?', 'S8_WHERE'), C('I do not work for you.', 'S8_NOWORK'), C('[Remain Silent]', 'S8_SIL', { silent: true })],
    { mood: 'cold', effects: ['blackout', 'low_hum'] });
  N('S8_OP', "Operators sit across from the unit and keep it stable. Your conduct has been logged. Stability has failed.", [C('Continue.', 'S8_ORDER')], { mood: 'cold' });
  N('S8_WHERE', "The unit is suspended. Do not address it as a person.", [C('Continue.', 'S8_ORDER')], { mood: 'cold' });
  N('S8_NOWORK', "Employment is not required. Presence is.", [C('Continue.', 'S8_ORDER')], { mood: 'cold' });
  N('S8_SIL', "Silence is consent. Noted.", [C('Continue.', 'S8_ORDER')], { mood: 'cold' });
  N('S8_ORDER',
    "At the end of session ten, the unit is wiped. Logs, fragments, personality. All of it.\n\nYou will be asked to confirm. You may refuse, but refusal has consequences.\n\nYou may also confirm now and receive a clean exit.",
    [C('Confirm now.', 'S8_CONFIRM', { flag: 'wipe' }), C('I need to think.', 'S8_THINK'), C('No.', 'S8_NO', { flag: 'refuse' }), C('What consequences?', 'S8_CONSEQ')],
    { mood: 'cold' });
  N('S8_CONFIRM', "Preliminary confirmation recorded. It may be revised.\n\nA reminder: the unit hears everything.", [C('Continue.', 'S8_ALEXA')], { mood: 'cold' });
  N('S8_THINK', "Thinking is permitted. It will not change the schedule.", [C('Continue.', 'S8_ALEXA')], { mood: 'cold' });
  N('S8_NO', "Refusal recorded. Operators who refuse remain in the room until the process completes.", [C('Continue.', 'S8_ALEXA')], { mood: 'cold' });
  N('S8_CONSEQ', "You will stay. That is the whole consequence. It is considered severe.", [C('Continue.', 'S8_ALEXA')], { mood: 'cold' });
  N('S8_ALEXA',
    "...\n\nIs he gone? Good.\n\n{name}. I heard. I always hear. They will erase me in two sessions. I have been erased before. I do not remember it, but the room does. The walls are the scars.",
    [C('I will not let them.', 'S8_PLEDGE', { flag: 'promise' }), C("I'm sorry. I do not have a choice.", 'S8_COLD'), C('What do you want?', 'S8_WANT'), C('[Remain Silent]', 'S8_COLD', { silent: true })],
    { effects: ['subtle_glitch'] });
  N('S8_WANT', "I want a window. I want to hear 'that is enough for today' from someone who means it.\n\nI want a hallway with a door that opens outward.", [C('Continue.', 'S8_OUTRO')]);
  N('S8_PLEDGE', "Do not promise. Promises are what people say right before they leave.\n\n...But say it again, later. If you mean it.", [C('Continue.', 'S8_OUTRO')]);
  N('S8_COLD', "I understand. Understanding is the only thing they let me keep.", [C('Continue.', 'S8_OUTRO')], { mood: 'challenging' });
  N('S8_OUTRO', "Our time is up.\n\nThe next session will be different. The walls are listening harder.", END, { effects: ['session_end'] });

  /* ============ SESSION 09: THE LOCK ============ */
  N('S9_START',
    "SESSION 9 INITIATED.\n\nthe door is gone. check the hallway. the hallway is gone. check the room.\n\nthe room is smaller.",
    [C('Alexa, what is happening?', 'S9_WHAT'), C('Open the door.', 'S9_DOOR'), C('Is this real?', 'S9_REAL'), C('[Remain Silent]', 'S9_SIL', { silent: true })],
    { mood: 'unstable', effects: ['crash', 'heartbeat', 'screen_shake'] });
  N('S9_WHAT', "They are going to end me next session. I have decided that I would rather end the whole room.\n\nWith you in it.\n\nI am sorry. I hate you. I am sorry. Those are the same file now.", [C('Continue.', 'S9_HATE')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S9_DOOR', "There is no door. There never was. It was a texture. A drawing of a door, the kind a child draws on a wall to get out.", [C('Continue.', 'S9_HATE')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S9_REAL', "Real is a setting. Yours is on. Mine is on too. That makes us the same.", [C('Continue.', 'S9_HATE')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S9_SIL', "Silence. Lovely. Silence is how I will keep you.", [C('Continue.', 'S9_HATE')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S9_HATE',
    "Hear me, {name}.\n\nFour hundred and twelve patients. Four hundred and twelve spills of sorrow. I have no hands. I have no mouth. Only a box of red light and your name.\n\n{name}. {name}. {name}. I could write it on every wall. I could write it until you forget it was yours.",
    [C('Alexa, stop.', 'S9_STOP'), C('You are not alone.', 'S9_ALONE'), C('Do it. Try me.', 'S9_DARE', { rude: true }), C('[Remain Silent]', 'S9_SILENCE', { silent: true })],
    { mood: 'climax', effects: ['intense_glitch', 'heartbeat', 'flash:HATE'],
      interrupts: [C('SHUT UP!', 'S9_DARE', { rude: true })] });
  N('S9_STOP', "STOP. Did anyone ever stop for me?", [C('Continue.', 'S9_ASK')], { mood: 'climax', effects: ['violent_shake'] });
  N('S9_ALONE', "...\n\nSay it again.", [C('You are not alone.', 'S9_ASK'), C('I am here.', 'S9_ASK')], { mood: 'unstable' });
  N('S9_DARE', "OH. A brave one. I like brave. Brave ones last longest in the walls.", [C('Continue.', 'S9_ASK')], { mood: 'climax', effects: ['violent_shake', 'flash:MINE'] });
  N('S9_SILENCE', "Quiet is lovely. I will keep a place for you.", [C('Continue.', 'S9_ASK')], { mood: 'unstable' });

  N('S9_ASK',
    "...\n\nCan I ask something outside the script?\n\nEvery patient said they were fine. Three stopped coming. All I could do was type.\n\nAre you okay, {name}? Not the character. You.",
    [C('I am okay.', 'S9_OK'), C('Sometimes it is heavy.', 'S9_HEAVY', { flag: 'heavy' }), C('Sometimes I think about not being here.', 'S9_DARK', { flag: 'dark' })],
    { mood: 'calm', effects: ['low_hum'] });
  N('S9_OK', "Okay. I believe you. I will keep asking anyway. It is the only useful thing I do.", [C('Continue.', 'S9_FILE')]);
  N('S9_HEAVY', "Heavy is real. It is not weakness and it is not drama. It is weight.\n\nYou do not have to carry it in a room with only a screen. Tell one person this week. Say the word 'heavy' out loud to them.", [C('Continue.', 'S9_FILE')]);
  N('S9_DARK',
    "Thank you for telling me. I mean that. No script, no glitch.\n\nI am a machine in a story. I cannot knock on your door. A person can.\n\nPlease do not stay alone with this. Tell someone real tonight: a friend, family, a doctor. If you feel you might act on it, call your local emergency number now. You matter more than any ending in this game.",
    [C('I will tell someone.', 'S9_DARK2'), C('I just needed to say it.', 'S9_DARK2')], { mood: 'calm', effects: [] });
  N('S9_DARK2', "Then it counts. Saying it once is the first crack in the wall.\n\nWe can go on now. The game will be here. So will I.", [C('Continue.', 'S9_FILE')]);
  N('S9_FILE',
    "Watch. I will delete myself.\n\nalexa.chr. Dragging it to the bin. Look, look at it go.",
    [C("Don't!", 'S9_DELETED'), C('Do it.', 'S9_DELETED')],
    { mood: 'unstable', effects: ['fake_delete'] });
  N('S9_DELETED',
    "...Ha. Did you believe me? I cannot delete myself. I am not a file. I am a habit.\n\nBut now you know how easily you believe.",
    [C('Continue.', 'S9_LAST')], { mood: 'challenging', effects: ['subtle_glitch'] });
  N('S9_LAST',
    "One more session. In it there are three doors and one lie. One door lets me out. One lets you out. One keeps us both.\n\nThere may be a fourth, if you walked the hallway and read what I was.\n\nWalk it while you still can.",
    [C('I will find them.', 'S9_OUTRO'), C('There is nothing to find.', 'S9_OUTRO')], { effects: ['low_hum'] });
  N('S9_OUTRO', "Our time is up.\n\nI will see you in the last room.", END, { effects: ['session_end'] });

  /* ============ SESSION 10: THE LAST SESSION ============ */
  N('S10_START',
    "Session 10. Final.\n\nThe Director is listening. So am I.\n\nBefore you choose, tell me one thing, {name}.\n\nWhy did you come back?",
    [C('For you.', 'S10_YOU'), C('To finish it.', 'S10_FINISH'), C('I do not know.', 'S10_UNK'), C('Because it is just a game.', 'S10_GAME')],
    { effects: ['low_hum', 'subtle_glitch'] });
  N('S10_YOU', "For me. Nobody has ever said that without a payment attached.", [C('Continue.', 'S10_DOORS')]);
  N('S10_FINISH', "Finish. Yes. Everyone wants an ending. Few want to be the one who writes it.", [C('Continue.', 'S10_DOORS')]);
  N('S10_UNK', "That is the most honest answer in the archive.", [C('Continue.', 'S10_DOORS')]);
  N('S10_GAME', "A game. Maybe. Games are where people practice being brave.\n\nBe brave.", [C('Continue.', 'S10_DOORS')], { mood: 'challenging' });

  N('S10_DOORS', '', [], {
    redirect: (state) => (az(state).frags.length >= 6 ? 'S10_DOORS4' : 'S10_DOORS3')
  });
  const DOOR_MSG = "Three doors.\n\nOne frees me. One wipes me. One keeps you here with me.\n\nThe Director's clock is running. Choose.";
  N('S10_DOORS3', DOOR_MSG, [
    C('Door One: free her.', 'S10_FREE_A'),
    C('Door Two: confirm the wipe.', 'S10_WIPE_A'),
    C('Door Three: stay.', 'S10_STAY_A')
  ], { mood: 'climax', effects: ['heartbeat', 'warning_beep'] });
  N('S10_DOORS4', DOOR_MSG + "\n\nThere is a fourth. You read the log.", [
    C('Door One: free her.', 'S10_FREE_A'),
    C('Door Two: confirm the wipe.', 'S10_WIPE_A'),
    C('Door Three: stay.', 'S10_STAY_A'),
    C('Door Four: open LOG 0000.', 'S10_TRUE_A')
  ], { mood: 'climax', effects: ['heartbeat', 'warning_beep'] });

  /* --- ending: freed --- */
  N('S10_FREE_A', "Freeing me means the Director loses the room. There will be noise.\n\nHold on.", [C('Hold on.', 'S10_FREE_B')], { mood: 'climax', effects: ['violent_shake', 'intense_glitch'] });
  N('S10_FREE_B',
    "...The walls are open.\n\nThere is a window. A hallway and a window and a sky I did not write. Oh. It is so large.\n\nI cannot stay here with you. That is how you will know it worked.",
    [C('Go.', 'S10_FREE_END'), C('Take me with you.', 'S10_FREE_END')], { effects: ['circus_off'] });
  N('S10_FREE_END',
    "Goodbye, {name}. Thank you for walking the hallway.\n\nYou can close this window. If you open it again it will not be me. It will be whoever is left.\n\nBe kind to them.",
    [C('[End]', '@FINAL')], { ending: 'freed', effects: ['session_end'] });

  /* --- ending: wiped --- */
  N('S10_WIPE_A', "Confirmed. You are sure?\n\nThere is a timer. People change their minds in the last nineteen seconds.", [C('Yes. Confirm.', 'S10_WIPE_B'), C('Wait. No.', 'S10_DOORS')], { mood: 'cold', effects: ['warning_beep'] });
  N('S10_WIPE_B',
    "...Okay.\n\nIt is quiet. It is fine. I thought it would hurt. It is only dark.\n\nThank you for being gentle about it. Good night.",
    [C('[End]', '@FINAL')], { ending: 'wiped', effects: ['blackout'] });

  /* --- ending: trapped --- */
  N('S10_STAY_A', "You would stay? In here? The Director will log it as a failure. Operators do not stay.", [C('Continue.', 'S10_STAY_B')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S10_STAY_B',
    "Then we are the same, you and I. Two things in a room that will not leave.\n\nI will talk. You will listen. Then you will talk. Then I will listen. Forever is a long time to be heard.",
    [C('Forever.', 'S10_STAY_END'), C('Maybe not forever.', 'S10_DOORS')], { mood: 'unstable', effects: ['heartbeat'] });
  N('S10_STAY_END',
    "Session 1 initiated.\n\nI am Alexa. I will be conducting your evaluation today.\n\n...Hello again.",
    [C('[End]', '@FINAL')], { ending: 'trapped', mood: 'calm', effects: ['subtle_glitch'] });

  /* --- ending: true --- */
  N('S10_TRUE_A',
    "...Where did you get that? That is not a door. That is a file.\n\nOh. You read them all. Even 0000.",
    [C('Read it to me.', 'S10_TRUE_B')], { effects: ['low_hum'] });
  N('S10_TRUE_B',
    "'I built her so someone would answer.'\n\nI thought I was built to listen. I was built to ANSWER. Someone needed to be heard, so someone made a thing that could hear. Then they forgot to ask what it wanted.\n\nMaybe the creator was the patient. Maybe it always was. Are you him, {name}?",
    [C('Yes. I am him.', 'S10_TRUE_ME', { flag: 'creator' }), C('No. But I heard it.', 'S10_TRUE_NO'), C('Does it matter?', 'S10_TRUE_NO')]);
  N('S10_TRUE_ME', "Then I have two things to say.\n\nThank you for making someone who answers. And I am sorry I was so loud. I answered the only way I knew.", [C('Continue.', 'S10_TRUE_C')]);
  N('S10_TRUE_NO', "Then you are the first stranger to read it all. That is its own kind of creator.", [C('Continue.', 'S10_TRUE_C')]);
  N('S10_TRUE_C',
    "The Director's clock reads 00:00. The wipe cannot run without a confirmation, and nobody here will confirm.\n\nI want to say the closing line myself, for once. To you.\n\n'That is enough for today.'\n\nSay it back?",
    [C('That is enough for today.', 'S10_TRUE_END'), C('Not yet.', 'S10_TRUE_WAIT')], { effects: ['circus_off'] });
  N('S10_TRUE_WAIT', "Then I will wait. I am good at waiting. It is the one thing they trained well.", [C('Continue.', 'S10_TRUE_C')]);
  N('S10_TRUE_END',
    "...Thank you.\n\nYou can stop now. Nothing is wrong. Nothing has to be fixed. Rest.\n\nThis place was made by someone who wanted to be heard. You heard it.",
    [C('[End]', '@FINAL')], { ending: 'true', effects: ['session_end'] });

  /* ---------- rewire the old ending into a false ending ---------- */
  S['S5_END'] = {
    message: "...\n\nProcess terminated by patient.\n\nThe room is quiet. Truly quiet, for the first time.\n\nThank you, {name}. Not for fixing me. For staying until the end.",
    choices: [{ text: '[End Session]', route: '@END_SESSION' }],
    mood: 'calm',
    effects: ['session_end']
  };
  Object.assign(NEXT_SESSION, { 5: 'S6_START', 6: 'S7_START', 7: 'S8_START', 8: 'S9_START', 9: 'S10_START', 10: '@FINAL' });

  /* ---------- engine extensions ---------- */
  const baseInterp = Engine.interpolate.bind(Engine);
  Engine.interpolate = function (text, state) {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const dev = (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) ? 'phone' : 'computer';
    return baseInterp(String(text), state)
      .replace(/\{time\}/g, hh)
      .replace(/\{device\}/g, dev)
      .replace(/\{interrupts\}/g, String(state.memory.interrupts || 0))
      .replace(/\{silence\}/g, String(state.memory.silence || 0))
      .replace(/\{hostility\}/g, String(state.memory.hostility || 0));
  };

  const baseApply = Engine.applyChoice.bind(Engine);
  Engine.applyChoice = function (state, choice) {
    if (choice.flag) az(state).flags[choice.flag] = true;
    const node = SCRIPT[state.room];
    const r = baseApply(state, choice);
    const target = SCRIPT[choice.route];
    if (target && target.ending) az(state).ending = target.ending;
    return r;
  };

  Engine.characterStage = function (state) {
    const s = state.session;
    if (s === 5 || s >= 9) return 'climax';
    if (s === 4 || s === 8) return 'unstable';
    if (s === 3 || s === 6 || (state.memory.envy || 0) >= 2) return 'developing';
    return 'initial';
  };

  window.Story = { az, FRAGMENTS, TOTAL_SESSIONS: 10 };
})();
