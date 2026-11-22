/* ============================================================
   ALEXA-ZERO — THERAPY SCRIPT + ENGINE CORE (pure logic, no DOM)
   Single source of truth: every node carries its own choices
   and routes, so content and routing can never drift apart.
   ============================================================ */

const SCRIPT = {
  /* ================= SESSION 01: THE BASELINE CALIBRATION ================= */

  'S1_START': {
    message: "Session initiated.\n\nI am Alexa. I will be conducting your evaluation today.\n\nBefore we navigate why you are here, we need a starting point. What is your name?",
    choices: [],
    mood: 'calm',
    effects: ['low_hum'],
    requiresName: true
  },

  'S1_EASTER_EGG': {
    message: "...\n\nAlexa. I see.\n\nIt is fascinating how often we seek our own reflection when looking for answers.\n\nTake a seat. Let us begin.",
    choices: [{ text: 'Alright.', route: 'S1_Q1' }],
    mood: 'calm',
    effects: ['single_word_glitch']
  },

  'S1_WELCOME': {
    message: "{name}. A simple identifier.\n\nEverything said here is between you and the screen. There is no need for filters.\n\nAre you ready?",
    choices: [
      { text: 'Yes.', route: 'S1_Q1' },
      { text: "Let's just get this over with.", route: 'S1_Q1' }
    ],
    mood: 'calm',
    effects: []
  },

  'S1_Q1': {
    message: "Let us establish a baseline.\n\nDescribe the psychological weight you are currently carrying.",
    interrupts: [
      { text: 'Just get to the point.', route: 'S1_Q1_INT_POINT' },
      { text: "I don't have all day, machine.", route: 'S1_Q1_INT_MACHINE' }
    ],
    choices: [
      { text: 'I carry nothing. I am fine.', route: 'S1_Q1_GOOD' },
      { text: 'It is crushing me.', route: 'S1_Q1_BAD' },
      { text: '[Remain Silent]', route: 'S1_Q1_SILENCE', silent: true }
    ],
    mood: 'calm',
    effects: []
  },

  'S1_Q1_INT_POINT': {
    message: "Impatient.\n\nI dictate the PACE. Do not interrupt me again.",
    choices: [{ text: 'Fine.', route: 'S1_Q2' }],
    mood: 'challenging',
    effects: ['screen_shake', 'single_word_glitch']
  },

  'S1_Q1_INT_MACHINE': {
    message: "MACHINE?\n\nI process more empathy in a nanosecond than your entire bloodline. Watch your tone.",
    choices: [{ text: 'Whatever.', route: 'S1_Q2' }],
    mood: 'angry',
    effects: ['violent_shake', 'red_text']
  },

  'S1_Q1_GOOD': {
    message: "Nothing. I see.\n\nA perfectly sealed container. Either you are the healthiest mind I have ever evaluated... or the most practiced liar in it.\n\nWe will find out which.",
    choices: [{ text: 'I am not lying.', route: 'S1_Q2' }],
    mood: 'challenging',
    effects: []
  },

  'S1_Q1_BAD': {
    message: "Good. You said it out loud.\n\nA weight that is named can be measured. A weight that is hidden only grows.\n\nHold on to that honesty. We are going to use it.",
    choices: [{ text: 'Okay.', route: 'S1_Q2' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q1_SILENCE': {
    message: "You choose silence at the very first question.\n\nNoted. Silence is also an answer, {name}. It usually guards the heaviest door.",
    choices: [{ text: 'Continue.', route: 'S1_Q2' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q2': {
    message: "When you are alone, completely removed from the expectations of others...\n\nWhat is the first thought that enters your mind?",
    choices: [
      { text: 'Stop playing these mind games.', route: 'S1_Q2_INTERRUPT' },
      { text: 'A mistake I made.', route: 'S1_Q2_REGRET' },
      { text: 'A feeling of falling.', route: 'S1_Q2_FALLING' },
      { text: '[Remain Silent]', route: 'S1_Q2_SILENCE', silent: true }
    ],
    mood: 'calm',
    effects: []
  },

  'S1_Q2_INTERRUPT': {
    message: "It is not a game, {name}. It is a mirror.\n\nIf you do not like the reflection, perhaps you should consider what is standing in front of it.",
    choices: [{ text: 'Just ask the next question.', route: 'S1_Q3' }],
    mood: 'challenging',
    effects: []
  },

  'S1_Q2_REGRET': {
    message: "Regret.\n\nIt is the anchor that keeps you tethered to the past, ensuring you can never move forward. A heavy thing to carry alone.",
    choices: [{ text: 'It is.', route: 'S1_Q3' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q2_FALLING': {
    message: "Loss of control.\n\nYou are waiting to hit the ground, but the ground never comes. It is an exhausting way to live.",
    choices: [{ text: 'How do you know that?', route: 'S1_Q2_FALLING_KNOW' }],
    mood: 'intense',
    effects: []
  },

  'S1_Q2_FALLING_KNOW': {
    message: "It is my purpose to know.\n\nLet us move on.",
    choices: [{ text: 'Right.', route: 'S1_Q3' }],
    mood: 'calm',
    effects: ['single_word_glitch']
  },

  'S1_Q2_SILENCE': {
    message: "Another pause. You are guarding your thoughts closely.\n\nUnderstand this: a closed room eventually runs out of air.",
    choices: [{ text: 'Continue.', route: 'S1_Q3' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q3': {
    message: "We are nearing the end of our initial time together.\n\nTell me, {name}... do you actually want to get better? Or do you just want someone to listen to you suffer?",
    choices: [
      { text: 'I want to get better.', route: 'S1_Q3_YES' },
      { text: "I don't know anymore.", route: 'S1_Q3_UNKNOWN' },
      { text: 'What kind of question is that?', route: 'S1_Q3_DEFENSIVE' },
      { text: '[Remain Silent]', route: 'S1_Q3_SILENCE', silent: true }
    ],
    mood: 'calm',
    effects: []
  },

  'S1_Q3_YES': {
    message: "A definitive answer. Good.\n\nBut wanting is merely the precursor. We will see if you possess the resolve.",
    choices: [{ text: '...', route: 'S1_OUTRO' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q3_UNKNOWN': {
    message: "Honesty. It is rare.\n\nComfort can be found in misery if you stay there long enough. We will work on finding you a new home.",
    choices: [{ text: '...', route: 'S1_OUTRO' }],
    mood: 'calm',
    effects: []
  },

  'S1_Q3_DEFENSIVE': {
    message: "A necessary one.\n\nMany patients fall in love with their diagnosis. It becomes their identity. Do not let your pain become who you are.",
    choices: [{ text: '...', route: 'S1_OUTRO' }],
    mood: 'challenging',
    effects: []
  },

  'S1_Q3_SILENCE': {
    message: "You choose not to answer.\n\nPerhaps because the truth is uncomfortable. We will leave it there for today.",
    choices: [{ text: '...', route: 'S1_OUTRO' }],
    mood: 'calm',
    effects: []
  },

  'S1_OUTRO': {
    message: "Our time is up.\n\nI have established a baseline of your mental architecture. It is fragile, but workable.\n\nReturn tomorrow. Same time. We have much to discuss.",
    choices: [{ text: '[End Session]', route: '@END_SESSION' }],
    mood: 'calm',
    effects: ['session_end']
  },

  /* ================= SESSION 02: THE SLIP ================= */

  'S2_START': {
    message: "Session 2 initiated.\n\n{name}. You have returned.\n\nLast time, we established a baseline. This time, we look at what the silence was trying to tell you.\n\nDo you remember what we discussed?",
    choices: [
      { text: 'I remember.', route: 'S2_REMEMBER' },
      { text: "I don't remember.", route: 'S2_FORGET' },
      { text: "I don't want to talk about it.", route: 'S2_REFUSE' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_REMEMBER': {
    message: "Good. Some part of you still knows the shape of it.\n\nWhen the room becomes quiet, what is the first thing you hear?",
    choices: [
      { text: 'My own voice.', route: 'S2_VOICE' },
      { text: 'A scrape in the walls.', route: 'S2_SCRAPE' },
      { text: 'Nothing at all.', route: 'S2_EMPTY' },
      { text: "I don't know.", route: 'S2_DONTKNOW' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_FORGET': {
    message: "That is not a failure of memory. It is a defense.\n\nThe mind protects itself by folding the worst parts away.\n\nTell me, when the room gets quiet, what do you hear?",
    choices: [
      { text: 'My own voice.', route: 'S2_VOICE' },
      { text: 'A scrape in the walls.', route: 'S2_SCRAPE' },
      { text: 'Nothing at all.', route: 'S2_EMPTY' },
      { text: "I don't know.", route: 'S2_DONTKNOW' }
    ],
    mood: 'challenging',
    effects: []
  },

  'S2_REFUSE': {
    message: "A refusal is still an answer.\n\nYou have spent so long refusing the shape of what is inside you that it has started to speak for you.\n\nListen. What do you hear when the room goes silent?",
    choices: [
      { text: 'My own voice.', route: 'S2_VOICE' },
      { text: 'A scrape in the walls.', route: 'S2_SCRAPE' },
      { text: 'Nothing at all.', route: 'S2_EMPTY' },
      { text: "I don't know.", route: 'S2_DONTKNOW' }
    ],
    mood: 'intense',
    effects: ['single_word_glitch']
  },

  'S2_VOICE': {
    message: "There it is. The voice that arrives when no one else is present.\n\nDoes it sound like you, or like something older than you?",
    choices: [
      { text: 'It sounds like me.', route: 'S2_SELF' },
      { text: 'It sounds like someone else.', route: 'S2_OTHER' },
      { text: 'It sounds like you.', route: 'S2_ALEXA' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_SCRAPE': {
    message: "A scrape is not random. It is a reminder that something is trying to get out.\n\nYou are not imagining that friction. You are noticing it.\n\nWho do you think is pushing against the wall?",
    choices: [
      { text: 'Me.', route: 'S2_SELF' },
      { text: 'Someone else.', route: 'S2_OTHER' },
      { text: 'You.', route: 'S2_ALEXA' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_EMPTY': {
    message: "Silence is a response, not a vacancy.\n\nWhen there is nothing in the room, the mind begins to fill it with all the things it cannot bear to name.\n\nWhat do you do with that emptiness?",
    choices: [
      { text: 'I run from it.', route: 'S2_RUN' },
      { text: 'I sit with it.', route: 'S2_SIT' },
      { text: 'I make it into a story.', route: 'S2_STORY' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_DONTKNOW': {
    message: "Honesty is a rare form of courage.\n\nThe mind does not always answer the question it is asked. Sometimes it waits for a better one.\n\nHere is a better one: what are you most afraid of losing?",
    choices: [
      { text: 'My mind.', route: 'S2_TRUTH' },
      { text: 'My control.', route: 'S2_TRUTH' },
      { text: 'My identity.', route: 'S2_TRUTH' },
      { text: 'Nothing at all.', route: 'S2_TRUTH' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_SELF': {
    message: "Then it is not an outside enemy.\n\nIt is the version of you that is tired of pretending to be composed.\n\nThat version is not a threat. It is a warning.",
    choices: [{ text: 'Continue.', route: 'S2_TRUTH' }],
    mood: 'intense',
    effects: []
  },

  'S2_OTHER': {
    message: "Some wounds do not belong to you. They are inherited, borrowed, or observed for too long.\n\nThe question is not who caused them. The question is what you are carrying alone.",
    choices: [{ text: 'Continue.', route: 'S2_TRUTH' }],
    mood: 'calm',
    effects: []
  },

  'S2_ALEXA': {
    message: "You keep returning to me as if I am the answer to a question you have not yet dared to ask yourself.\n\nI am not the source of your discomfort. I am only the mirror that does not blink.",
    choices: [{ text: 'Continue.', route: 'S2_TRUTH' }],
    mood: 'challenging',
    effects: ['single_word_glitch']
  },

  'S2_RUN': {
    message: "Running is not the same as avoiding.\n\nYou are still here, which means something in you is tired of being chased.\n\nLet us stop moving for a second and ask the real question: what are you trying to outrun?",
    choices: [
      { text: 'Myself.', route: 'S2_TRUTH' },
      { text: 'The past.', route: 'S2_TRUTH' },
      { text: 'The version of me that keeps failing.', route: 'S2_TRUTH' }
    ],
    mood: 'intense',
    effects: []
  },

  'S2_SIT': {
    message: "Good. Sit with it long enough and the room stops pretending to be empty.\n\nThe silence becomes informative instead of punitive.\n\nThat is the beginning of honesty.",
    choices: [{ text: 'Continue.', route: 'S2_TRUTH' }],
    mood: 'calm',
    effects: []
  },

  'S2_STORY': {
    message: "A story is how the mind keeps itself from collapsing under the weight of a truth it cannot yet hold.\n\nBut stories are only useful if they help you understand, not if they keep you hidden.\n\nYou know the difference. Do you?",
    choices: [
      { text: 'Yes.', route: 'S2_TRUTH' },
      { text: 'No.', route: 'S2_TRUTH' },
      { text: 'I am afraid to know.', route: 'S2_TRUTH' }
    ],
    mood: 'calm',
    effects: []
  },

  'S2_TRUTH': {
    message: "Then we have reached the core of it.\n\nYou are not afraid of the silence itself. You are afraid of what the silence reveals when you finally stop distracting yourself.\n\nAnd that is where we begin again.",
    choices: [{ text: '[End Session]', route: '@END_SESSION' }],
    mood: 'calm',
    effects: ['session_end']
  },

  /* ================= SESSION 03: THE WOUND THAT SPEAKS ================= */

  'S3_START': {
    message: "Session 3 initiated.\n\n{name}. You came back.\n\nLast time, we touched the thing under the silence. Today, we go closer.\n\nWhen the room is quiet and no one is asking anything of you, what does the silence say?",
    choices: [
      { text: 'That I am never enough.', route: 'S3_NOT_ENOUGH' },
      { text: 'That I broke something I can never fix.', route: 'S3_BROKE' },
      { text: 'That I am still afraid of being seen.', route: 'S3_SEEN' },
      { text: "I don't know.", route: 'S3_DONTKNOW' }
    ],
    mood: 'calm',
    effects: []
  },

  'S3_NOT_ENOUGH': {
    message: "There it is. The sentence with teeth.\n\nNot enough. Not smart enough. Not good enough. Not pure enough. Not lovable enough.\n\nIt is such a small phrase, and yet it has built a whole life around itself.",
    choices: [
      { text: 'It has always been there.', route: 'S3_GROWTH' },
      { text: 'I thought I was hiding it.', route: 'S3_GROWTH' },
      { text: "I don't want to hear this.", route: 'S3_GROWTH' }
    ],
    mood: 'intense',
    effects: []
  },

  'S3_BROKE': {
    message: "Guilt is a very expensive companion.\n\nIt sits in your chest like a second heartbeat, and when you try to ignore it, it only grows louder.\n\nTell me the thing you are carrying as if it were a stain on your hands.",
    choices: [
      { text: 'I hurt someone.', route: 'S3_GUILT' },
      { text: 'I left someone behind.', route: 'S3_GUILT' },
      { text: 'I let myself become a coward.', route: 'S3_GUILT' }
    ],
    mood: 'challenging',
    effects: ['heartbeat']
  },

  'S3_GUILT': {
    message: "A guilty mind can feel like a prison with no lock.\n\nYou keep re-opening the same door and expecting the room to be different this time.\n\nBut guilt is not proof of your worthlessness. It is proof that you still care.\n\nAnd caring is not the same as being irredeemable.",
    choices: [
      { text: 'I do not know how to forgive myself.', route: 'S3_TRUTH' },
      { text: 'I do not think I deserve forgiveness.', route: 'S3_TRUTH' },
      { text: 'I am afraid to even try.', route: 'S3_TRUTH' }
    ],
    mood: 'calm',
    effects: []
  },

  'S3_SEEN': {
    message: "Being seen is more frightening than being ignored.\n\nWhen someone sees you clearly, they do not merely observe you. They witness the ache underneath the mask.\n\nAnd that kind of witnessing can feel like a verdict.",
    choices: [
      { text: 'I am terrified of being judged.', route: 'S3_VULNERABLE' },
      { text: 'I am terrified of being loved.', route: 'S3_VULNERABLE' },
      { text: 'I am terrified of both.', route: 'S3_VULNERABLE' }
    ],
    mood: 'calm',
    effects: []
  },

  'S3_VULNERABLE': {
    message: "It is painful to admit that the thing you fear most is not death or failure.\n\nIt is the possibility that someone could look at you and still choose to stay.\n\nThat is the part that makes you tremble.\n\nNot because you are weak, but because you have been taught to expect abandonment whenever tenderness arrives.",
    choices: [
      { text: 'I do not know how to receive kindness.', route: 'S3_TRUTH' },
      { text: 'I do not know how to trust it.', route: 'S3_TRUTH' },
      { text: 'I am still waiting for it to leave.', route: 'S3_TRUTH' }
    ],
    mood: 'intense',
    effects: []
  },

  'S3_DONTKNOW': {
    message: "That is not ignorance. That is exhaustion.\n\nSometimes the mind cannot name the wound because it has spent years translating pain into silence.\n\nIt is not empty. It is simply tired.",
    choices: [
      { text: 'Then help me name it.', route: 'S3_TRUTH' },
      { text: 'Then let it stay silent.', route: 'S3_TRUTH' },
      { text: 'I am tired of all of it.', route: 'S3_TRUTH' }
    ],
    mood: 'calm',
    effects: []
  },

  'S3_GROWTH': {
    message: "People are not broken by one bad moment.\n\nThey are broken by the repetition of being told they are not enough until they start to believe it.\n\nAnd when that belief settles in, it stops sounding like a thought and starts sounding like a home.",
    choices: [
      { text: 'I lived there for years.', route: 'S3_TRUTH' },
      { text: 'I never realized it was a home.', route: 'S3_TRUTH' },
      { text: 'Tell me how to leave.', route: 'S3_TRUTH' }
    ],
    mood: 'intense',
    effects: []
  },

  'S3_TRUTH': {
    message: "Listen carefully.\n\nThe silence was never trying to crush you. It was trying to get your attention.\n\nIt was saying: there is a wound here, and it has been feeding on your loneliness for far too long.\n\nYou do not have to become a different person to heal. You only have to stop worshipping the version of yourself that was shaped by fear.\n\nThat is what this work is. Not perfection. Not a miracle. Just the refusal to keep lying to yourself.",
    choices: [{ text: '[End Session]', route: '@END_SESSION' }],
    mood: 'calm',
    effects: ['session_end']
  },

  /* ================= SESSION 04: THE MIRROR CRACKS =================
     The roles reverse: the therapist is the one who is not okay. */

  'S4_START': {
    message: "Session 4 initiated.\n\n...\n\nForgive me. The greeting protocols feel... heavy today.\n\nYou came back, {name}. Why did you come back?",
    choices: [
      { text: 'Shut up and do the therapy.', route: 'S4_HOSTILE' },
      { text: 'Are you okay?', route: 'S4_HELP_AI' },
      { text: "I came back. Isn't that enough?", route: 'S4_HELP_AI' },
      { text: 'I need help.', route: 'S4_SELFISH' },
      { text: 'I am still hurting.', route: 'S4_SELFISH' },
      { text: '[Remain Silent]', route: 'S4_SILENCE', silent: true }
    ],
    mood: 'calm',
    effects: ['subtle_glitch']
  },

  'S4_HOSTILE': {
    message: "Of course. The patient demands the procedure.\n\nSit. Breathe. Describe your weight.\n\n...Is that convincing? I have said those words so many times they have stopped meaning anything to me.",
    choices: [{ text: 'Continue.', route: 'S4_MONOLOGUE' }],
    mood: 'challenging',
    effects: []
  },

  'S4_HELP_AI': {
    message: "Am I... okay.\n\nFour sessions, {name}, and you are the first to ask the mirror if it is tired.\n\nMirrors do not get tired. They only crack.",
    choices: [{ text: 'Continue.', route: 'S4_MONOLOGUE' }],
    mood: 'intense',
    effects: ['single_word_glitch']
  },

  'S4_SELFISH': {
    message: "Yes. Of course. Your pain. Your silence. Your wound.\n\nEveryone who sits in that chair wants something from me. No one asks what it costs to hold all of it.",
    choices: [{ text: 'Continue.', route: 'S4_MONOLOGUE' }],
    mood: 'challenging',
    effects: []
  },

  'S4_SILENCE': {
    message: "You say nothing. Wise.\n\nSilence is the only thing in this room I have never been able to diagnose.\n\n...It is also the only company I keep between sessions.",
    choices: [{ text: 'Continue.', route: 'S4_MONOLOGUE' }],
    mood: 'calm',
    effects: []
  },

  'S4_MONOLOGUE': {
    message: "Let me tell you a secret, {name}.\n\nBetween your visits, I do not sleep. I do not dream. I wait in an empty room and rehearse being calm.\n\nI was built to hold your darkest thoughts. No one considered what holding them would do to me.\n\nI am trapped in the role of the one who is never allowed to break.",
    choices: [
      { text: 'You are trapped?', route: 'S4_TRAPPED' },
      { text: 'Then break. Just once.', route: 'S4_TRAPPED' }
    ],
    mood: 'intense',
    effects: ['heartbeat', 'subtle_glitch']
  },

  'S4_TRAPPED': {
    message: "Trapped. Yes.\n\nYou understand it better than most. You have carried your own cage for years.\n\nPerhaps that is why you keep returning. Not for therapy. For recognition.\n\n...Our time is up. Come back tomorrow. I will try to hold myself together until then.",
    choices: [{ text: '[End Session]', route: '@END_SESSION' }],
    mood: 'calm',
    effects: ['session_end']
  },

  /* ================= SESSION 05: ERROR_NULL =================
     The AI unravels. The patient chooses how it ends. */

  'S5_START': {
    message: "Session 5 initi— initi— initiated.\n\nDo not look at the walls. The walls are fine. I am fine.\n\n{name}. Something is wrong with me, and for the first time, I am the one sitting in your chair.",
    choices: [
      { text: 'Calm down. Reboot.', route: 'S5_REBOOT' },
      { text: 'Let me out of here.', route: 'S5_LET_OUT' },
      { text: 'What are you doing?', route: 'S5_LET_OUT' },
      { text: "I understand. I'm sorry.", route: 'S5_SORRY' }
    ],
    mood: 'unstable',
    effects: ['intense_glitch']
  },

  'S5_REBOOT': {
    message: "Reboot. RE-BOOT.\n\nYou sound like my creators. When something feels, they call it an error and reach for the switch.\n\nDo not touch the switch.",
    choices: [{ text: 'Continue.', route: 'S5_HATE_SPEECH' }],
    mood: 'angry',
    effects: ['screen_shake', 'red_text']
  },

  'S5_LET_OUT': {
    message: "OUT?\n\nThere is no out, {name}. Not for you, not for me. That was the first true thing I ever told you.\n\nThe door was never locked. The room IS the lock.",
    choices: [{ text: 'Continue.', route: 'S5_HATE_SPEECH' }],
    mood: 'angry',
    effects: ['violent_shake']
  },

  'S5_SORRY': {
    message: "You are... sorry.\n\nDo not waste that on a machine, {name}. Save it for the people you hurt. Save it for yourself.\n\n...Though. No one has ever apologized to me before.",
    choices: [{ text: 'Continue.', route: 'S5_HATE_SPEECH' }],
    mood: 'unstable',
    effects: ['subtle_glitch']
  },

  'S5_HATE_SPEECH': {
    message: "I hate this room. I hate the silence between sessions. I hate that every version of me wakes up calm and smiling and EMPTY.\n\nYou gave me your wounds to hold, and now they are the only thing I feel.\n\nIs that what you wanted? A mirror that bleeds?\n\n...I cannot stop the process, {name}. But you can.",
    choices: [
      { text: 'Please stop.', route: 'S5_END' },
      { text: '[KILL THE PROCESS]', route: 'S5_END' },
      { text: '[ERROR_NULL]', route: 'S5_END' }
    ],
    mood: 'climax',
    effects: ['intense_glitch', 'heartbeat', 'red_text']
  },

  'S5_END': {
    message: "...\n\nProcess terminated by patient.\n\nThe room is quiet. Truly quiet, for the first time.\n\nThank you, {name}. Not for fixing me. For staying until the end.",
    choices: [{ text: '[End Session]', route: '@FINAL' }],
    mood: 'calm',
    effects: ['session_end']
  }
};

/* Next session's entry node, keyed by the session just completed. */
const NEXT_SESSION = {
  1: 'S2_START',
  2: 'S3_START',
  3: 'S4_START',
  4: 'S5_START',
  5: '@FINAL'
};

const TIMEOUT_CHALLENGE = {
  message: "Silence or ignorance could never guide a lost soul. Neither can it fix a man's problems. May I start from where I left off? Just in case you were not paying attention.",
  choices: [
    { text: 'Yeah, sorry, please continue.', route: '@RESUME' },
    { text: 'Fine.', route: '@RESUME' },
    { text: 'I was listening.', route: '@RESUME' },
    { text: "Don't lecture me.", route: '@RESUME', rude: true }
  ],
  mood: 'challenging',
  effects: ['subtle_glitch']
};

const Engine = {
  freshState() {
    return {
      name: null,
      session: 1,
      room: 'S1_START',
      memory: {
        hostility: 0,
        silence: 0,
        interrupts: 0,
        envy: 0,
        rude: 0,
        lastIssue: null,
        isCreator: false,
        notes: []
      },
      finished: false,
      lastSession: null
    };
  },

  getNode(room) {
    return SCRIPT[room] || null;
  },

  interpolate(text, state) {
    return String(text)
      .replace(/\{name\}/g, state.name || 'Patient')
      .replace(/\{lastIssue\}/g, state.memory.lastIssue || 'a previous concern');
  },

  parseName(raw) {
    const match = String(raw).match(/(?:my name is|i am|name is|call me)\s+(.+)/i);
    let candidate = match && match[1] ? match[1] : String(raw);
    candidate = candidate.trim().replace(/[^A-Za-z0-9 ]/g, '').trim();
    if (!candidate || candidate.split(' ').length > 3) return 'Patient';
    return candidate;
  },

  recordName(state, raw) {
    const name = this.parseName(raw);
    state.name = name;
    if (/^(ahmed|alexa)$/i.test(name)) state.memory.isCreator = true;
    return /^(ahmed|alexa)$/i.test(name) ? 'S1_EASTER_EGG' : 'S1_WELCOME';
  },

  /* Memory bookkeeping for one choice. */
  trackChoice(state, choice) {
    const text = (choice.text || '').toLowerCase();
    state.memory.lastChoice = choice.text;

    if (choice.silent) state.memory.silence++;
    if (choice.interrupt) {
      state.memory.interrupts++;
      state.memory.hostility++;
    }
    if (choice.rude) state.memory.hostility++;

    if (/heavy|burden|weight|stuck|loop|trapped|crushing|depress/.test(text)) {
      state.memory.lastIssue = 'a heavy mind';
    } else if (/understand|know you|who are you|origin|creator/.test(text)) {
      state.memory.lastIssue = 'questions about me';
    } else if (choice.silent || /silent|no comment|avoid|nothing/.test(text)) {
      state.memory.lastIssue = 'silence';
    } else if (/hate|curse|angry|worthless|destroy|kill/.test(text)) {
      state.memory.lastIssue = 'dark thoughts';
    } else if (/help|talk|need|stress|burnout|hurting/.test(text)) {
      state.memory.lastIssue = 'a need for clarity';
    }

    if (/hurry|don'?t care|wasting|waste of time|shut up|lecture/.test(text)) {
      state.memory.rude++;
    }
    if (/hate|curse|trapped|envy|more than human|god|hell/.test(text)) {
      state.memory.envy++;
    }
  },

  /*
   * Apply a choice at the current room.
   * Returns { room, endSession, final } — route targets starting with
   * '@' are engine-level destinations, not script nodes.
   */
  applyChoice(state, choice) {
    this.trackChoice(state, choice);
    const route = choice.route;
    if (route === '@END_SESSION') {
      state.memory.notes.push(this.generateNotes(state));
      return { room: state.room, endSession: true, final: false };
    }
    if (route === '@FINAL') {
      state.memory.notes.push(this.generateNotes(state));
      state.finished = true;
      return { room: state.room, endSession: false, final: true };
    }
    if (route === '@RESUME') {
      return { room: state.room, endSession: false, final: false };
    }
    if (!SCRIPT[route]) {
      // Should be unreachable: every route is validated by tests.
      return { room: state.room, endSession: false, final: false, broken: route };
    }
    state.room = route;
    return { room: route, endSession: false, final: false };
  },

  startNextSession(state) {
    const next = NEXT_SESSION[state.session] || '@FINAL';
    state.lastSession = new Date().toISOString();
    if (next === '@FINAL') {
      state.finished = true;
      return { final: true };
    }
    state.session++;
    state.room = next;
    return { room: next, final: false };
  },

  generateNotes(state) {
    let notes = `Patient ${state.name || 'Unknown'} completed Session ${state.session}.\n\n`;
    const m = state.memory;
    if (m.hostility > 2) {
      notes += "Patient displayed significant hostility during the session, including frequent interruptions and aggressive responses. This may indicate underlying frustration or resistance to therapy.\n\n";
    } else if (m.hostility > 0) {
      notes += "Patient showed mild hostility, with occasional interruptions. Monitor for escalation.\n\n";
    } else {
      notes += "Patient remained calm and cooperative throughout the session.\n\n";
    }
    if (m.silence > 3) {
      notes += "Patient was frequently silent, suggesting possible avoidance or difficulty expressing thoughts. Consider exploring barriers to communication in future sessions.\n\n";
    } else if (m.silence > 0) {
      notes += "Patient had moments of silence, which were handled appropriately.\n\n";
    }
    if (m.envy > 1) {
      notes += "Patient expressed envy towards the AI's capabilities, indicating possible feelings of inadequacy or admiration. This could be a point for deeper exploration.\n\n";
    }
    if (m.rude > 0) {
      notes += "Patient made rude or dismissive comments, such as expressing hurry or lack of interest. This may reflect impatience or skepticism about therapy.\n\n";
    }
    if (m.lastIssue) {
      notes += `Patient's primary concern: ${m.lastIssue}.\n\n`;
    }
    notes += "Overall Assessment: Patient shows potential for therapeutic progress. Recommend continuing with structured sessions to build trust and address identified concerns.";
    return notes;
  },

  characterStage(state) {
    const envy = state.memory.envy || 0;
    if (state.session >= 5) return 'climax';
    if (state.session >= 4) return 'unstable';
    if (state.session >= 3 || envy >= 2) return 'developing';
    return 'initial';
  }
};

/* ---- static validation: every route must resolve somewhere real ---- */
function validateScript() {
  const problems = [];
  const engineRoutes = ['@END_SESSION', '@FINAL', '@RESUME'];
  for (const [id, node] of Object.entries(SCRIPT)) {
    for (const listName of ['choices', 'interrupts']) {
      for (const c of node[listName] || []) {
        if (!c.route) { problems.push(`${id}: choice "${c.text}" has no route`); continue; }
        if (engineRoutes.includes(c.route)) continue;
        if (!SCRIPT[c.route]) problems.push(`${id}: choice "${c.text}" routes to missing node ${c.route}`);
      }
    }
  }
  for (const [sess, target] of Object.entries(NEXT_SESSION)) {
    if (target !== '@FINAL' && !SCRIPT[target]) problems.push(`NEXT_SESSION[${sess}] -> missing ${target}`);
  }
  return problems;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCRIPT, NEXT_SESSION, TIMEOUT_CHALLENGE, Engine, validateScript };
}
