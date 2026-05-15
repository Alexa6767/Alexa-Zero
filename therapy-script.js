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
    routes: ['NEXT_SESSION', 'READ_NOTES', 'RESET_AI'],
    mood: 'calm',
    effects: ['session_end', 'play_relaxing_music', 'show_end_animation'],
    requiresName: false
  },

  // --- NEXT SESSION HANDLER ---
  'NEXT_SESSION': {
    message: "The next session is still under development.\n\nThis module is not ready yet.\n\nPlease return later or reset the AI to start over.",
    choices: ['Back to Menu', 'Reset AI'],
    routes: ['SESSION_END_MENU', 'RESET_AI'],
    mood: 'calm',
    effects: ['session_end', 'show_end_animation'],
    requiresName: false
  },

  // --- READ NOTES ---
  'READ_NOTES': {
    message: "Therapist Notes - Session {sessionCount}\n\nPatient: {name}\nHostility Level: {hostility}\nSilence Count: {silence}\nInterrupt Count: {interrupt}\n\nKey Observations:\n- Initial baseline established\n- Patient engaged with {choices} total choices\n- Memory patterns: {memory_summary}\n\nRecommendations:\n- Continue therapy progression\n- Monitor for increased hostility\n- Encourage self-reflection",
    choices: ['Back to Menu', 'Start Next Session', 'Reset AI'],
    routes: ['SESSION_END_MENU', 'NEXT_SESSION', 'RESET_AI'],
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
    message: "Session 2 initiated.\n\n{name}. You have returned.\n\nLast time, we established a baseline. Now we begin the work.\n\nDo you remember what we discussed?",
    choices: ['Yes.', 'No.', 'I don\'t want to talk about it.'],
    routes: ['S2_REMEMBER', 'S2_FORGET', 'S2_INTERRUPT'],
    mood: 'calm',
    effects: [],
    requiresName: false
  }
};