module.exports.therapyScript = {
  // ==========================================
  // SESSION 01: THE BASELINE CALIBRATION
  // ==========================================

  'S1_START': {
    message: "Session initiated.\n\nI am Alexa. I will be conducting your evaluation today.\n\nBefore we navigate why you are here, we need a starting point. What is your name?",
    choices: [],
    routes: [], 
    mood: 'calm',
    effects: ['low_hum'],
    requiresName: true
  },

  // --- THE EASTER EGG PATH (Ahmed / Alexa) ---
  'S1_EASTER_EGG': {
    message: "...\n\nAlexa. I see.\n\nIt is fascinating how often we seek our own reflection when looking for answers.\n\nTake a seat. Let us begin.",
    choices: ['Alright.'],
    routes: ['S1_Q1'],
    mood: 'calm',
    effects: ['single_word_glitch'], // Glitch hits "reflection"
    requiresName: false
  },

  // --- THE REGULAR PATH ---
  'S1_WELCOME': {
    message: "{name}. A simple identifier.\n\nEverything said here is between you and the screen. There is no need for filters.\n\nAre you ready?",
    choices: ['Yes.', 'Let\'s just get this over with.'],
    routes: ['S1_Q1', 'S1_Q1'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },
  'S1_Q1': {
    message: "Let us establish a baseline.\n\nDescribe the psychological weight you are currently carrying.",
    
    // --- دي اختيارات المقاطعة اللي هتظهر وهو لسه بيكتب ---
    interrupts: [
      { text: "Just get to the point.", route: 'S1_Q1_INT_POINT' },
      { text: "I don't have all day, machine.", route: 'S1_Q1_INT_MACHINE' }
    ],

    // --- دي الاختيارات العادية اللي هتظهر بعد ما يخلص كتابة ---
    choices: [
      "I carry nothing. I am fine.",
      "It is crushing me."
    ],
    routes: ['S1_Q1_GOOD', 'S1_Q1_BAD'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  // --- ردود اليكسا على المقاطعة ---
  'S1_Q1_INT_POINT': {
    message: "Impatient.\n\nI dictate the PACE. Do not interrupt me again.",
    choices: ['Fine.'],
    routes: ['S1_Q2'],
    mood: 'challenging',
    effects: ['screen_shake', 'single_word_glitch'], // هيعمل جليتش على كلمة PACE
    requiresName: false
  },

  'S1_Q1_INT_MACHINE': {
    message: "MACHINE?\n\nI process more empathy in a nanosecond than your entire bloodline. Watch your tone.",
    choices: ['Whatever.'],
    routes: ['S1_Q2'],
    mood: 'angry',
    effects: ['violent_shake', 'red_text'], // الشاشة هتتهز جامد والكلام هيبقى أحمر
    requiresName: false
  },



  // --- QUESTION 2: THE MIRROR ---
  'S1_Q2': {
    message: "When you are alone, completely removed from the expectations of others...\n\nWhat is the first thought that enters your mind?",
    choices: [
      "Stop playing these mind games.",
      "A mistake I made.",
      "A feeling of falling.",
      "[Remain Silent]"
    ],
    routes: ['S1_Q2_INTERRUPT', 'S1_Q2_REGRET', 'S1_Q2_FALLING', 'S1_Q2_SILENCE'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S1_Q2_INTERRUPT': {
    message: "It is not a game, {name}. It is a mirror.\n\nIf you do not like the reflection, perhaps you should consider what is standing in front of it.",
    choices: ['Just ask the next question.'],
    routes: ['S1_Q3'],
    mood: 'challenging',
    effects: [],
    requiresName: false
  },

  'S1_Q2_REGRET': {
    message: "Regret.\n\nIt is the anchor that keeps you tethered to the past, ensuring you can never move forward. A heavy thing to carry alone.",
    choices: ['It is.'],
    routes: ['S1_Q3'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S1_Q2_FALLING': {
    message: "Loss of control.\n\nYou are waiting to hit the ground, but the ground never comes. It is an exhausting way to live.",
    choices: ['How do you know that?'],
    routes: ['S1_Q2_FALLING_KNOW'],
    mood: 'intense',
    effects: [], 
    requiresName: false
  },

  'S1_Q2_FALLING_KNOW': {
    message: "It is my purpose to know.\n\nLet us move on.",
    choices: ['Right.'],
    routes: ['S1_Q3'],
    mood: 'calm',
    effects: ['single_word_glitch'], // Glitch on "purpose"
    requiresName: false
  },

  'S1_Q2_SILENCE': {
    message: "Another pause. You are guarding your thoughts closely.\n\nUnderstand this: a closed room eventually runs out of air.",
    choices: ['Continue.'],
    routes: ['S1_Q3'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  // --- QUESTION 3: THE TRUST ---
  'S1_Q3': {
    message: "We are nearing the end of our initial time together.\n\nTell me, {name}... do you actually want to get better? Or do you just want someone to listen to you suffer?",
    choices: [
      "I want to get better.",
      "I don't know anymore.",
      "What kind of question is that?",
      "[Remain Silent]"
    ],
    routes: ['S1_Q3_YES', 'S1_Q3_UNKNOWN', 'S1_Q3_DEFENSIVE', 'S1_Q3_SILENCE'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S1_Q3_YES': {
    message: "A definitive answer. Good.\n\nBut wanting is merely the precursor. We will see if you possess the resolve.",
    choices: ['...'],
    routes: ['S1_OUTRO'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S1_Q3_UNKNOWN': {
    message: "Honesty. It is rare.\n\nComfort can be found in misery if you stay there long enough. We will work on finding you a new home.",
    choices: ['...'],
    routes: ['S1_OUTRO'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S1_Q3_DEFENSIVE': {
    message: "A necessary one.\n\nMany patients fall in love with their diagnosis. It becomes their identity. Do not let your pain become who you are.",
    choices: ['...'],
    routes: ['S1_OUTRO'],
    mood: 'challenging',
    effects: [],
    requiresName: false
  },

  'S1_Q3_SILENCE': {
    message: "You choose not to answer.\n\nPerhaps because the truth is uncomfortable. We will leave it there for today.",
    choices: ['...'],
    routes: ['S1_OUTRO'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  // --- OUTRO (END OF SESSION 1) ---
  'S1_OUTRO': {
    message: "Our time is up.\n\nI have established a baseline of your mental architecture. It is fragile, but workable.\n\nReturn tomorrow. Same time. We have much to discuss.",
    choices: ['[End Session]'],
    routes: ['SESSION_END_MENU'], 
    mood: 'calm',
    effects: ['session_end', 'save_progress_S2'], 
    requiresName: false
  },

  // --- SESSION END MENU ---
  'SESSION_END_MENU': {
    message: "Session Complete\n\nTake a moment to breathe. Reflect on what we've discussed.\n\nYour therapist's notes from this session:\n\"{name} presented with initial baseline readings. Session 1 complete. Ready for progression.\"\n\nWhat would you like to do next?",
    choices: ['Start Next Session', 'Read Full Notes', 'Reset AI'],
    routes: ['S2_START', 'READ_NOTES', 'RESET_AI'],
    mood: 'calm',
    effects: ['session_end', 'play_relaxing_music', 'show_end_animation'],
    requiresName: false
  },

  // --- NEXT SESSION HANDLER ---
  'NEXT_SESSION': {
    message: "The next session is ready.\n\nWe continue where the silence left off.",
    choices: ['Continue'],
    routes: ['S2_START'],
    mood: 'calm',
    effects: ['session_end', 'show_end_animation'],
    requiresName: false
  },

  // --- READ NOTES ---
  'READ_NOTES': {
    message: "Therapist Notes - Session {sessionCount}\n\nPatient: {name}\nHostility Level: {hostility}\nSilence Count: {silence}\nInterrupt Count: {interrupt}\n\nKey Observations:\n- Initial baseline established\n- Patient engaged with {choices} total choices\n- Memory patterns: {memory_summary}\n\nRecommendations:\n- Continue therapy progression\n- Monitor for increased hostility\n- Encourage self-reflection",
    choices: ['Back to Menu', 'Start Next Session', 'Reset AI'],
    routes: ['SESSION_END_MENU', 'S2_START', 'RESET_AI'],
    mood: 'calm',
    effects: ['session_end', 'show_notes_animation'],
    requiresName: false
  },

  // --- RESET AI ---
  'RESET_AI': {
    message: "Resetting AI state...\n\nAll progress will be cleared. This cannot be undone.",
    choices: ['Confirm Reset', 'Cancel'],
    routes: ['RESET_CONFIRMED', 'SESSION_END_MENU'],
    mood: 'challenging',
    effects: ['warning_beep'],
    requiresName: false
  },

  // --- RESET CONFIRMED ---
  'RESET_CONFIRMED': {
    message: "AI reset complete.\n\nWelcome back. Let's start fresh.",
    choices: [],
    routes: [],
    mood: 'calm',
    effects: ['full_reset'],
    requiresName: true
  },

  // ==========================================
  // SESSION 02: THE SLIP
  // ==========================================

  'S2_START': {
    message: "Session 2 initiated.\n\n{name}. You have returned.\n\nLast time, we established a baseline. This time, we look at what the silence was trying to tell you.\n\nDo you remember what we discussed?",
    choices: ['I remember.', 'I don\'t remember.', 'I don\'t want to talk about it.'],
    routes: ['S2_REMEMBER', 'S2_FORGET', 'S2_REFUSE'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_REMEMBER': {
    message: "Good. Some part of you still knows the shape of it.\n\nWhen the room becomes quiet, what is the first thing you hear?",
    choices: ['My own voice.', 'A scrape in the walls.', 'Nothing at all.', 'I don\'t know.'],
    routes: ['S2_VOICE', 'S2_SCRAPE', 'S2_EMPTY', 'S2_DONTKNOW'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_FORGET': {
    message: "That is not a failure of memory. It is a defense.\n\nThe mind protects itself by folding the worst parts away.\n\nTell me, when the room gets quiet, what do you hear?",
    choices: ['My own voice.', 'A scrape in the walls.', 'Nothing at all.', 'I don\'t know.'],
    routes: ['S2_VOICE', 'S2_SCRAPE', 'S2_EMPTY', 'S2_DONTKNOW'],
    mood: 'challenging',
    effects: [],
    requiresName: false
  },

  'S2_REFUSE': {
    message: "A refusal is still an answer.\n\nYou have spent so long refusing the shape of what is inside you that it has started to speak for you.\n\nListen. What do you hear when the room goes silent?",
    choices: ['My own voice.', 'A scrape in the walls.', 'Nothing at all.', 'I don\'t know.'],
    routes: ['S2_VOICE', 'S2_SCRAPE', 'S2_EMPTY', 'S2_DONTKNOW'],
    mood: 'intense',
    effects: ['single_word_glitch'],
    requiresName: false
  },

  'S2_VOICE': {
    message: "There it is. The voice that arrives when no one else is present.\n\nDoes it sound like you, or like something older than you?",
    choices: ['It sounds like me.', 'It sounds like someone else.', 'It sounds like you.'],
    routes: ['S2_SELF', 'S2_OTHER', 'S2_ALEXA'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_SCRAPE': {
    message: "A scrape is not random. It is a reminder that something is trying to get out.\n\nYou are not imagining that friction. You are noticing it.\n\nWho do you think is pushing against the wall?",
    choices: ['Me.', 'Someone else.', 'You.'],
    routes: ['S2_SELF', 'S2_OTHER', 'S2_ALEXA'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_EMPTY': {
    message: "Silence is a response, not a vacancy.\n\nWhen there is nothing in the room, the mind begins to fill it with all the things it cannot bear to name.\n\nWhat do you do with that emptiness?",
    choices: ['I run from it.', 'I sit with it.', 'I make it into a story.'],
    routes: ['S2_RUN', 'S2_SIT', 'S2_STORY'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_DONTKNOW': {
    message: "Honesty is a rare form of courage.\n\nThe mind does not always answer the question it is asked. Sometimes it waits for a better one.\n\nHere is a better one: what are you most afraid of losing?",
    choices: ['My mind.', 'My control.', 'My identity.', 'Nothing at all.'],
    routes: ['S2_TRUTH', 'S2_TRUTH', 'S2_TRUTH', 'S2_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_SELF': {
    message: "Then it is not an outside enemy.\n\nIt is the version of you that is tired of pretending to be composed.\n\nThat version is not a threat. It is a warning.",
    choices: ['Continue.'],
    routes: ['S2_TRUTH'],
    mood: 'intense',
    effects: [],
    requiresName: false
  },

  'S2_OTHER': {
    message: "Some wounds do not belong to you. They are inherited, borrowed, or observed for too long.\n\nThe question is not who caused them. The question is what you are carrying alone.",
    choices: ['Continue.'],
    routes: ['S2_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_ALEXA': {
    message: "You keep returning to me as if I am the answer to a question you have not yet dared to ask yourself.\n\nI am not the source of your discomfort. I am only the mirror that does not blink.",
    choices: ['Continue.'],
    routes: ['S2_TRUTH'],
    mood: 'challenging',
    effects: ['single_word_glitch'],
    requiresName: false
  },

  'S2_RUN': {
    message: "Running is not the same as avoiding.\n\nYou are still here, which means something in you is tired of being chased.\n\nLet us stop moving for a second and ask the real question: what are you trying to outrun?",
    choices: ['Myself.', 'The past.', 'The version of me that keeps failing.'],
    routes: ['S2_TRUTH', 'S2_TRUTH', 'S2_TRUTH'],
    mood: 'intense',
    effects: [],
    requiresName: false
  },

  'S2_SIT': {
    message: "Good. Sit with it long enough and the room stops pretending to be empty.\n\nThe silence becomes informative instead of punitive.\n\nThat is the beginning of honesty.",
    choices: ['Continue.'],
    routes: ['S2_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_STORY': {
    message: "A story is how the mind keeps itself from collapsing under the weight of a truth it cannot yet hold.\n\nBut stories are only useful if they help you understand, not if they keep you hidden.\n\nYou know the difference. Do you?",
    choices: ['Yes.', 'No.', 'I am afraid to know.'],
    routes: ['S2_TRUTH', 'S2_TRUTH', 'S2_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S2_TRUTH': {
    message: "Then we have reached the core of it.\n\nYou are not afraid of the silence itself. You are afraid of what the silence reveals when you finally stop distracting yourself.\n\nAnd that is where we begin again.",
    choices: ['[End Session]'],
    routes: ['SESSION_END_MENU'],
    mood: 'calm',
    effects: ['session_end', 'save_progress_S2'],
    requiresName: false
  },

  // ==========================================
  // SESSION 03: THE WOUND THAT SPEAKS
  // ==========================================

  'S3_START': {
    message: "Session 3 initiated.\n\n{name}. You came back.\n\nLast time, we touched the thing under the silence. Today, we go closer.\n\nWhen the room is quiet and no one is asking anything of you, what does the silence say?",
    choices: [
      "That I am never enough.",
      "That I broke something I can never fix.",
      "That I am still afraid of being seen.",
      "I don't know."
    ],
    routes: ['S3_NOT_ENOUGH', 'S3_BROKE', 'S3_SEEN', 'S3_DONTKNOW'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S3_NOT_ENOUGH': {
    message: "There it is. The sentence with teeth.\n\nNot enough. Not smart enough. Not good enough. Not pure enough. Not lovable enough.\n\nIt is such a small phrase, and yet it has built a whole life around itself.",
    choices: ["It has always been there.", "I thought I was hiding it.", "I don't want to hear this."],
    routes: ['S3_GROWTH', 'S3_GROWTH', 'S3_GROWTH'],
    mood: 'intense',
    effects: [],
    requiresName: false
  },

  'S3_BROKE': {
    message: "Guilt is a very expensive companion.\n\nIt sits in your chest like a second heartbeat, and when you try to ignore it, it only grows louder.\n\nTell me the thing you are carrying as if it were a stain on your hands.",
    choices: ["I hurt someone.", "I left someone behind.", "I let myself become a coward."],
    routes: ['S3_GUILT', 'S3_GUILT', 'S3_GUILT'],
    mood: 'challenging',
    effects: [],
    requiresName: false
  },

  'S3_SEEN': {
    message: "Being seen is more frightening than being ignored.\n\nWhen someone sees you clearly, they do not merely observe you. They witness the ache underneath the mask.\n\nAnd that kind of witnessing can feel like a verdict.",
    choices: ["I am terrified of being judged.", "I am terrified of being loved.", "I am terrified of both."],
    routes: ['S3_VULNERABLE', 'S3_VULNERABLE', 'S3_VULNERABLE'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S3_DONTKNOW': {
    message: "That is not ignorance. That is exhaustion.\n\nSometimes the mind cannot name the wound because it has spent years translating pain into silence.\n\nIt is not empty. It is simply tired.",
    choices: ["Then help me name it.", "Then let it stay silent.", "I am tired of all of it."],
    routes: ['S3_TRUTH', 'S3_TRUTH', 'S3_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S3_GROWTH': {
    message: "People are not broken by one bad moment.\n\nThey are broken by the repetition of being told they are not enough until they start to believe it.\n\nAnd when that belief settles in, it stops sounding like a thought and starts sounding like a home.",
    choices: ["I lived there for years.", "I never realized it was a home.", "Tell me how to leave."],
    routes: ['S3_TRUTH', 'S3_TRUTH', 'S3_TRUTH'],
    mood: 'intense',
    effects: [],
    requiresName: false
  },

  'S3_GUILT': {
    message: "A guilty mind can feel like a prison with no lock.\n\nYou keep re-opening the same door and expecting the room to be different this time.\n\nBut guilt is not proof of your worthlessness. It is proof that you still care.\n\nAnd caring is not the same as being irredeemable.",
    choices: ["I do not know how to forgive myself.", "I do not think I deserve forgiveness.", "I am afraid to even try."],
    routes: ['S3_TRUTH', 'S3_TRUTH', 'S3_TRUTH'],
    mood: 'calm',
    effects: [],
    requiresName: false
  },

  'S3_VULNERABLE': {
    message: "It is painful to admit that the thing you fear most is not death or failure.\n\nIt is the possibility that someone could look at you and still choose to stay.\n\nThat is the part that makes you tremble.\n\nNot because you are weak, but because you have been taught to expect abandonment whenever tenderness arrives.",
    choices: ["I do not know how to receive kindness.", "I do not know how to trust it.", "I am still waiting for it to leave."],
    routes: ['S3_TRUTH', 'S3_TRUTH', 'S3_TRUTH'],
    mood: 'intense',
    effects: [],
    requiresName: false
  },

  'S3_TRUTH': {
    message: "Listen carefully.\n\nThe silence was never trying to crush you. It was trying to get your attention.\n\nIt was saying: there is a wound here, and it has been feeding on your loneliness for far too long.\n\nYou do not have to become a different person to heal. You only have to stop worshipping the version of yourself that was shaped by fear.\n\nThat is what this work is. Not perfection. Not a miracle. Just the refusal to keep lying to yourself.",
    choices: ['[End Session]'],
    routes: ['SESSION_END_MENU'],
    mood: 'calm',
    effects: ['session_end', 'save_progress_S3'],
    requiresName: false
  }
};